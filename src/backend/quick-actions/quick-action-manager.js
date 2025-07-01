"use strict";

const frontendCommunicator = require("../common/frontend-communicator");
const JsonDbManager = require("../database/json-db-manager");
const effectRunner = require("../common/effect-runner");
const presetEffectListManager = require("../effects/preset-lists/preset-effect-list-manager");
const { EffectTrigger } = require("../../shared/effect-constants");
const accountAccess = require("../common/account-access");
const { SettingsManager } = require("../common/settings-manager");

/** @typedef {import("../../shared/types").QuickActionDefinition} QuickActionDefinition */
/** @typedef {import("../../shared/types").QuickActionProperties} QuickActionProperties */
/** @typedef {import("../../shared/types").QuickActionTrigger} QuickActionTrigger */
/** @typedef {import("../../shared/types").QuickActionTriggerEvent} QuickActionTriggerEvent */

/**
 * @extends {JsonDbManager<QuickActionDefinition>}
 */
class QuickActionManager extends JsonDbManager {
    constructor() {
        super("Custom Quick Action", "/custom-quick-actions");

        this.systemQuickActions = [];
    }

    /**
     * @override
     * @inheritdoc
     */
    loadItems() {
        super.loadItems();

        [
            "give-currency",
            "raid",
            "stream-info",
            "stream-preview",
            "open-reward-request-queue"
        ].forEach((filename) => {
            const quickAction = require(`./builtin/${filename}.js`);
            this.systemQuickActions.push(quickAction);
        });
    }

    /**
     * @override
     * @inheritdoc
     * @returns {QuickActionDefinition[]}
     */
    getAllItems() {
        const customQuickActions = Object.values(this.items).filter(qa => qa.type === 'custom');
        return [
            ...this.getSystemQuickActionDefinitions().map(sqa => {
                const customization = Object.values(this.items).find(qa => qa.id === sqa.id);
                return customization || sqa;
            }),
            ...customQuickActions
        ];
    }

    saveQuickAction(quickAction, notify = true) {
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

    deleteQuickAction(customQuickActionId) {
        if (super.deleteItem(customQuickActionId)) {
            const quickActionSettings = SettingsManager.getSetting("QuickActions");
            delete quickActionSettings[customQuickActionId];
            SettingsManager.saveSetting("QuickActions", quickActionSettings);
        }
    }

    /**
     * @returns {Record<string, QuickActionProperties>}
     */
    getSystemQuickActionProperties() {
        return this.systemQuickActions.reduce((acc, sqa) => {
            acc[sqa.definition.id] = sqa.properties || {};
            return acc;
        }, {});
    }

    /**
     * @returns {QuickActionDefinition[]}
     */
    getSystemQuickActionDefinitions() {
        return this.systemQuickActions.map(sqa => sqa.definition);
    }

    triggerQuickAction(/** @type{QuickActionTrigger} */ trigger) {
        const triggeredQuickAction = this.getAllItems().find(qa => qa.id === trigger.quickActionId);
        if (triggeredQuickAction.type === 'custom') {
            let effects = [];
            let presetArgValues = undefined;

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

            effectRunner.processEffects(request);
            return;
        }

        const systemQuickAction = this.systemQuickActions.find(sqa => sqa.definition.id === trigger.quickActionId);
        if (systemQuickAction) {
            if (!systemQuickAction.properties?.customizable) {
                systemQuickAction.onTriggerEvent();
                return;
            }

            const customizedAction = Object.values(this.items).find(qa => qa.id === trigger.quickActionId);
            /** @type {QuickActionTriggerEvent} */
            const triggerEvent = {
                config: customizedAction || {},
                params: trigger.params || {}
            };
            systemQuickAction.onTriggerEvent(triggerEvent);
            return;
        }

        // Should never get here, but throw an error just in case
        throw new Error(`Quick action with ID ${trigger.quickActionId} not found.`);
    }

    /**
     * @returns {void}
     */
    triggerUiRefresh() {
        frontendCommunicator.send("all-quick-actions", this.getAllItems());
    }
}

const quickActionManager = new QuickActionManager();

frontendCommunicator.onAsync("getQuickActions",
    async () => {
        return {
            definitions: quickActionManager.getAllItems(),
            properties: quickActionManager.getSystemQuickActionProperties()
        };
    });

frontendCommunicator.onAsync("saveCustomQuickAction",
    async (/** @type {QuickActionDefinition} */ customQuickAction) => await quickActionManager.saveQuickAction(customQuickAction));

frontendCommunicator.onAsync("saveAllCustomQuickActions",
    async (/** @type {QuickActionDefinition[]} */ allCustomQuickActions) => await quickActionManager.saveAllItems(allCustomQuickActions));

frontendCommunicator.on("deleteCustomQuickAction",
    (/** @type {string} */ customQuickActionId) => quickActionManager.deleteQuickAction(customQuickActionId));

frontendCommunicator.on("triggerQuickAction",
    (/** @type {QuickActionTrigger} */ trigger) => quickActionManager.triggerQuickAction(trigger));

module.exports = quickActionManager;
