// Modified by The Static Mage, 2026
// Licensed under GPL-3.0

import { TypedEmitter } from "tiny-typed-emitter";
import NodeCache, { WrappedValue } from "node-cache";
import type { JsonDB } from "node-json-db";

import { EventManager } from "../events/event-manager";
import { ProfileManager } from "../common/profile-manager";
import { SettingsManager } from "./settings-manager";
import frontendCommunicator from './frontend-communicator';
import logger from '../logwrapper';
import { simpleClone } from '../utils';

interface CustomVariableInspectorItem {
    key: string;
    value: unknown;
    ttl: number;
}

type FirebotCacheData = {
    [key: string]: WrappedValue<unknown> & { meta?: {
        persist?: boolean;
    }; };
};

class CustomVariableManager extends TypedEmitter<{
    "created-item": (item: { name: string, value: unknown }) => void;
    "updated-item": (item: { name: string, value: unknown }) => void;
    "deleted-item": (item: { name: string, value: unknown }) => void;
}> {
    private _cache: NodeCache;
    private writeDebounceTimer: NodeJS.Timeout | null = null;
    private lastPersistedData: string = "";

    constructor() {
        super();

        this._cache = new NodeCache({ stdTTL: 0, checkperiod: 1 });

        this._cache.on("set",
            (key: string, value: unknown) => this.onCustomVariableCreate(key, value)
        );

        this._cache.on("expired",
            (key: string, value: unknown) => this.onCustomVariableExpire(key, value)
        );

        this._cache.on("del",
            (key: string, value: unknown) => this.onCustomVariableDelete(key, value)
        );

        frontendCommunicator.on("custom-variables:get-initial-inspector-variables",
            () => this.getInitialInspectorVariables()
        );

        frontendCommunicator.on("custom-variables:delete",
            (key: string) => this.deleteCustomVariable(key)
        );

        // Register listener to flush any pending writes on app shutdown
        this.registerAppCloseListener();
    }

    private registerAppCloseListener(): void {
        // Use dynamic import to avoid circular dependencies
        void (async () => {
            try {
                const { AppCloseListenerManager } = await import("../app-management/app-close-listener-manager");
                AppCloseListenerManager.registerListener(() => this.flushPendingWrite());
            } catch (error) {
                logger.debug("Failed to register custom variable app close listener:", error);
            }
        })();
    }

    private onCustomVariableCreate(key: string, value: unknown): void {
        void EventManager.triggerEvent("firebot", "custom-variable-set", {
            username: "Firebot",
            createdCustomVariableName: key,
            createdCustomVariableData: value
        });

        frontendCommunicator.sendToVariableInspector("custom-variables:created", {
            key,
            value,
            ttl: this._cache.getTtl(key)
        });

        this.schedulePersistVariablesToFile();
    }

    private onCustomVariableExpire(key: string, value: unknown): void {
        void EventManager.triggerEvent("firebot", "custom-variable-expired", {
            username: "Firebot",
            expiredCustomVariableName: key,
            expiredCustomVariableData: value
        });

        frontendCommunicator.sendToVariableInspector("custom-variables:expired", {
            key,
            value
        });

        this.schedulePersistVariablesToFile();
    }

    private onCustomVariableDelete(key: string, value: unknown): void {
        this.emit("deleted-item", {
            name: key,
            value: value
        });

        frontendCommunicator.sendToVariableInspector("custom-variables:deleted", key);

        this.schedulePersistVariablesToFile();
    };

    private getVariableCacheDb(): JsonDB {
        return ProfileManager.getJsonDbInProfile("custom-variable-cache");
    }

    getInitialInspectorVariables(): CustomVariableInspectorItem[] {
        return Object.entries(this._cache.data)
            .map(([key, value]) => ({
                key,
                value: value.v as unknown,
                ttl: value.t
            }));
    }

    getAllVariables(): FirebotCacheData {
        return simpleClone(this._cache.data);
    }

    persistVariablesToFile(): void {
        // Intentionally left blank; implementation is in the private method below
    }

    /**
     * Schedules a debounced write to disk. Only performs the actual write if data has changed.
     * Subsequent calls within 2 seconds will not trigger additional writes.
     */
    private schedulePersistVariablesToFile(): void {
        // Clear any existing debounce timer
        if (this.writeDebounceTimer !== null) {
            clearTimeout(this.writeDebounceTimer);
        }

        // Schedule a new write after 2 seconds
        this.writeDebounceTimer = setTimeout(() => {
            this.writeDebounceTimer = null;
            this.persistVariablesToFileReal();
        }, 2000);
    }

    /**
     * Immediately flushes any pending write that hasn't been executed yet.
     * Called on app shutdown to ensure no data is lost.
     */
    private flushPendingWrite(): void {
        if (this.writeDebounceTimer !== null) {
            clearTimeout(this.writeDebounceTimer);
            this.writeDebounceTimer = null;
            logger.debug("Flushing pending custom variables write on app shutdown");
            this.persistVariablesToFileReal();
        }
    }

    /**
     * Persists custom variables to disk, but only if the data has actually changed
     * compared to the last successful write.
     */
    private persistVariablesToFileReal(): void {
        try {
            const db = this.getVariableCacheDb();
            const persistAllVars = SettingsManager.getSetting("PersistCustomVariables");

            let dataToPersist: FirebotCacheData;
            if (persistAllVars) {
                dataToPersist = this._cache.data;
            } else {
                dataToPersist = Object.entries(this._cache.data as FirebotCacheData).reduce((acc, [key, { t, v, meta }]) => {
                    if (meta?.persist) {
                        acc[key] = { t, v, meta };
                    }
                    return acc;
                }, {} as FirebotCacheData);
            }

            // Only write if data has actually changed
            const currentDataString = JSON.stringify(dataToPersist);
            if (currentDataString === this.lastPersistedData) {
                logger.debug("Custom variables data unchanged, skipping persist");
                return;
            }

            // Update the last persisted state before writing (to detect race conditions)
            this.lastPersistedData = currentDataString;

            if (persistAllVars) {
                logger.debug("Persisting all custom variables to file");
            } else {
                logger.debug("Persisting specified custom variables to file");
            }

            db.push("/", dataToPersist);
        } catch (error) {
            logger.warn("Error persisting custom variables to file:", error);
            // Reset the persisted data state on error to force a retry on next change
            this.lastPersistedData = "";
        }
    }

    loadVariablesFromFile(): void {
        const db = this.getVariableCacheDb();
        const data = db.getData("/") as FirebotCacheData;
        if (data) {
            const persistAllVars = SettingsManager.getSetting("PersistCustomVariables");
            for (const [key, { t, v, meta }] of Object.entries(data)) {
                if (!persistAllVars && !(meta?.persist)) {
                    // global persist disabled and this var wasn't marked to persist
                    continue;
                }
                const now = Date.now();
                if (t && t > 0 && t < now) {
                    // this var has expired
                    this.onCustomVariableExpire(key, v);
                    continue;
                }
                const ttl = t === 0 ? 0 : (t - now) / 1000;
                this.setValueWithMeta(key, v, ttl, meta);
            }
        }
    }

    private setValueWithMeta(key: string, value: unknown, ttl?: number, meta = {}): void {
        this._cache.set(key, value, ttl ?? 0);
        this._cache.data[key]["meta"] = meta;
    }

    addCustomVariable(
        name: string,
        data: unknown,
        ttl = 0,
        propertyPath: string = null,
        persist?: boolean
    ): void {
        //attempt to parse data as json
        try {
            data = JSON.parse(data as string);
        } catch { }

        const eventType = !this._cache.keys().includes(name)
            ? "created-item"
            : "updated-item";

        const dataRaw = data != null
            ? data.toString().toLowerCase()
            : "null";

        const dataIsNull = dataRaw === "null" || dataRaw === "undefined";

        const currentData = this._cache.get(name);

        const meta = (this._cache.data[name] as unknown as FirebotCacheData)?.meta ?? {};
        if (persist != null) {
            meta["persist"] = true;
        }

        if (propertyPath == null || propertyPath.length < 1) {
            let dataToSet = dataIsNull ? undefined : data;
            if (currentData && Array.isArray(currentData) && !Array.isArray(data) && !dataIsNull) {
                // Clone the array before mutating to prevent race conditions
                const clonedArray = simpleClone(currentData);
                clonedArray.push(data);
                dataToSet = clonedArray;
            }
            this.setValueWithMeta(name, dataToSet, ttl, meta);
            this.emit(eventType, {
                name: name,
                value: dataToSet
            });
        } else {
            if (!currentData) {
                return;
            }

            try {
                // Deep clone the current data before modifying to prevent concurrent mutation issues
                const clonedData = simpleClone(currentData);
                let cursor = clonedData;
                const pathNodes = propertyPath.split(".");

                for (let i = 0; i < pathNodes.length; i++) {
                    let node: string | number = pathNodes[i];

                    // parse to int for array access
                    if (!isNaN(Number(node))) {
                        node = parseInt(node);
                    }

                    const isLastItem = i === pathNodes.length - 1;
                    if (isLastItem) {
                        // if data recognized as null and cursor is an array, remove index instead of setting value
                        if (dataIsNull && Array.isArray(cursor) && typeof node === "number" && !isNaN(node)) {
                            cursor.splice(node, 1);
                        } else {
                            //if next node is an array and we detect we are not setting a new array or removing array, then push data to array
                            if (Array.isArray(cursor[node]) && !Array.isArray(data) && !dataIsNull) {
                                cursor[node].push(data);
                            } else {
                                cursor[node] = dataIsNull ? undefined : data;
                            }
                        }
                    } else {
                        cursor = cursor[node];
                    }
                }

                this.setValueWithMeta(name, clonedData, ttl ?? 0, meta);
                this.emit(eventType, {
                    name: name,
                    value: clonedData
                });
            } catch (error) {
                logger.debug(`Error setting data to custom variable ${name} using property path ${propertyPath}`, error);
            }
        }
    }

    getCustomVariable<T = unknown>(
        name: string,
        propertyPath?: string,
        defaultData?: T
    ): T {
        let data: T = this._cache.get(name);

        if (data == null) {
            return defaultData;
        }

        if (propertyPath == null || propertyPath === "null" || propertyPath === '') {
            return data;
        }

        try {
            const pathNodes = `${propertyPath}`.split(".");
            for (let i = 0; i < pathNodes.length; i++) {
                if (data == null) {
                    break;
                }
                let node: string | number = pathNodes[i];

                // parse to int for array access
                if (!isNaN(Number(node))) {
                    node = parseInt(node);
                }

                data = data[node] as T;
            }
            return data != null ? data : defaultData;
        } catch (error) {
            logger.debug(`Error getting data from custom variable ${name} using property path ${propertyPath}`, error);
            return defaultData;
        }
    }

    deleteCustomVariable(name: string): void {
        const data = this._cache.get(name);

        if (data == null) {
            logger.debug(`Cannot delete custom variable ${name}: Variable does not exist.`);
        }

        try {
            this._cache.del(name);

            logger.debug(`Custom variable ${name} deleted`);
        } catch (error) {
            logger.debug(`Error deleting custom variable ${name}: ${error}`);
        }
    }
}

const manager = new CustomVariableManager();

export { manager as CustomVariableManager };
