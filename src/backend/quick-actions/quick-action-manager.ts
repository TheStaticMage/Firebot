import { QuickActionDefinition, QuickActionTriggerEvent, SystemQuickAction } from "../../types/quick-actions";
import { EffectList } from "../../types/effects";
import { EffectTrigger } from "../../shared/effect-constants";
import JsonDbManager from "../database/json-db-manager";
import frontendCommunicator from "../common/frontend-communicator";
import effectRunner from "../common/effect-runner";
import presetEffectListManager from "../effects/preset-lists/preset-effect-list-manager";
import accountAccess from "../common/account-access";
import { SettingsManager } from "../common/settings-manager";

import { GiveCurrencyQuickAction } from "./builtin/give-currency";
import { OpenRewardQueueQuickAction } from "./builtin/open-reward-request-queue";
import { StreamInfoQuickAction } from "./builtin/stream-info";
import { StreamPreviewQuickAction } from "./builtin/stream-preview";

class QuickActionManager extends JsonDbManager<QuickActionDefinition> {
    systemQuickActions: SystemQuickAction[] = [
        GiveCurrencyQuickAction,
        OpenRewardQueueQuickAction,
        StreamInfoQuickAction,
        StreamPreviewQuickAction
    ];

    constructor() {
        super("Custom Quick Action", "/custom-quick-actions");

        frontendCommunicator.on("quick-actions:get-quick-actions",
            () => this.getAllItems()
        );

        frontendCommunicator.on("quick-actions:save-custom-quick-action",
            (customQuickAction: QuickActionDefinition) =>
                this.saveQuickAction(customQuickAction)
        );

        frontendCommunicator.on("quick-actions:save-all-custom-quick-actions",
            (allCustomQuickActions: QuickActionDefinition[]) =>
                this.saveAllItems(allCustomQuickActions)
        );

        frontendCommunicator.on("quick-actions:delete-custom-quick-action",
            (customQuickActionId: string) =>
                this.deleteQuickAction(customQuickActionId)
        );

        frontendCommunicator.on("quick-actions:trigger-quick-action",
            (quickActionId: string, params: Record<string, unknown> = {}) => this.triggerQuickAction(quickActionId, params)
        );
    }

    loadItems(): void {
        super.loadItems();
    }

    getAllItems(): QuickActionDefinition[] {
        return [
            ...this.getSystemQuickActionDefinitions().map((sqa) => {
                const customization = Object.values(this.items).find(qa => qa.id === sqa.id);
                return customization || sqa;
            }),
            ...Object.values(this.items)
        ];
    }

    saveQuickAction(quickAction: QuickActionDefinition, notify = true): QuickActionDefinition {
        const savedQuickAction = super.saveItem(quickAction);
        if (!savedQuickAction) {
            return;
        }
        const quickActionSettings = SettingsManager.getSetting("QuickActions");
        if (!Object.keys(quickActionSettings).includes(quickAction.id)) {
            quickActionSettings[quickAction.id] = { enabled: true, position: Object.keys(quickActionSettings).length };
            SettingsManager.saveSetting("QuickActions", quickActionSettings);
        }
        if (notify) {
            this.triggerUiRefresh();
        }
        return savedQuickAction;
    }

    deleteQuickAction(customQuickActionId: string): void {
        if (super.deleteItem(customQuickActionId)) {
            const quickActionSettings = SettingsManager.getSetting("QuickActions");
            delete quickActionSettings[customQuickActionId];
            SettingsManager.saveSetting("QuickActions", quickActionSettings);
        }
    }

    getSystemQuickActionDefinitions(): QuickActionDefinition[] {
        return this.systemQuickActions.map(sqa => sqa.definition);
    }

    triggerQuickAction(quickActionId: string, params: Record<string, unknown> = {}): void {
        const triggeredQuickAction = [
            ...this.getSystemQuickActionDefinitions(),
            ...Object.values(this.items)
        ].find(qa => qa.id === quickActionId);

        if (triggeredQuickAction.type === 'custom') {
            let effects: EffectList = null;
            let presetArgValues: Record<string, unknown> = null;

            if (triggeredQuickAction.presetListId != null) {
                const presetList = presetEffectListManager.getItem(triggeredQuickAction.presetListId);
                if (triggeredQuickAction.promptForArgs && presetList?.args?.length > 0) {
                    frontendCommunicator.send("show-run-preset-list-modal", triggeredQuickAction.presetListId);
                    return;
                }
                effects = presetList?.effects;
                presetArgValues = triggeredQuickAction.presetArgValues;
            } else if (triggeredQuickAction.effectList != null) {
                effects = triggeredQuickAction.effectList;
            }

            const request = {
                trigger: {
                    type: EffectTrigger.QUICK_ACTION,
                    metadata: {
                        username: accountAccess.getAccounts().streamer.username,
                        presetListArgs: presetArgValues
                    }
                },
                effects: effects
            };

            void effectRunner.processEffects(request);
            return;
        }

        const systemQuickAction = this.systemQuickActions.find(sqa => sqa.definition.id === triggeredQuickAction.id);
        if (systemQuickAction) {
            if (!systemQuickAction.definition.properties?.customizable) {
                systemQuickAction.onTriggerEvent();
                return;
            }

            const customizedAction = Object.values(this.items).find(qa => qa.id === triggeredQuickAction.id);
            const triggerEvent: QuickActionTriggerEvent = {
                config: customizedAction || {},
                params
            };
            systemQuickAction.onTriggerEvent(triggerEvent);
            return;
        }

        // Should never get here, but throw an error just in case
        throw new Error(`Quick action with ID ${triggeredQuickAction.id} not found.`);
    }

    triggerUiRefresh(): void {
        frontendCommunicator.send("all-quick-actions", this.getAllItems());
    }
}

const quickActionManager = new QuickActionManager();

export { quickActionManager as QuickActionManager };
