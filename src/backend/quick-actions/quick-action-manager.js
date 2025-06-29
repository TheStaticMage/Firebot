"use strict";

const frontendCommunicator = require("../common/frontend-communicator");
const JsonDbManager = require("../database/json-db-manager");
const effectRunner = require("../common/effect-runner");
const presetEffectListManager = require("../effects/preset-lists/preset-effect-list-manager");
const { EffectTrigger } = require("../../shared/effect-constants");
const accountAccess = require("../common/account-access");
const { SettingsManager } = require("../common/settings-manager");

/** @typedef {import("../../shared/types").QuickActionDefinition} QuickActionDefinition */

/** @typedef {import("../../shared/types").QuickActionTrigger} QuickActionTrigger */

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
            ...this.getSystemQuickActionDefinitions(),
            ...customQuickActions
        ];
    }

    saveQuickAction(quickAction, notify = true) {
        if (quickAction.type === 'system-editable') {
            delete quickAction.modalData;
        }

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
     * @returns {QuickActionDefinition[]}
     */
    getSystemQuickActionDefinitions() {
        // System editable quick actions have their configuration saved along with the custom
        // quick actions but are defined along with the system quick actions.
        const systemEditableQuickActions = Object.values(this.items).filter(qa => qa.type === 'system-editable');
        const systemQuickActions = this.systemQuickActions
            .map(sqa => sqa.definition)
            .map(sqa => {
                const editableQuickAction = systemEditableQuickActions.find(qa => qa.id === sqa.id);
                if (editableQuickAction) {
                    sqa.overrideDefault = editableQuickAction.overrideDefault;
                    sqa.presetListId = editableQuickAction.presetListId;
                    sqa.presetArgValues = editableQuickAction.presetArgValues;
                    sqa.promptForArgs = editableQuickAction.promptForArgs;
                    sqa.effectList = editableQuickAction.effectList;
                }
                return sqa;
            });

        return systemQuickActions;
    }

    triggerQuickAction(trigger) {
        const { quickActionId, isInitialClick = true, args = {} } = trigger;
        const triggeredQuickAction = this.getAllItems().find(qa => qa.id === quickActionId);

        const systemQuickAction = this.systemQuickActions.find(sqa => sqa.definition.id === quickActionId);
        if (systemQuickAction) {
            if (systemQuickAction.definition?.type !== 'system-editable' || isInitialClick) {
                systemQuickAction.onTriggerEvent();
                return;
            }

            // If there is no customization to the editable system quick action, or the default
            // behavior has not been overridden, execute the default effects.
            if (!triggeredQuickAction || !triggeredQuickAction.overrideDefault) {
                systemQuickAction.onDefaultTriggerEvent(effectRunner, args);
                return;
            }
        }

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
                    presetListArgs: presetArgValues,
                    quickAction: {
                        id: quickActionId,
                        args: args,
                    }
                }
            },
            effects: effects
        };

        effectRunner.processEffects(request);
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
    async () => quickActionManager.getAllItems());

frontendCommunicator.onAsync("saveCustomQuickAction",
    async (/** @type {QuickActionDefinition} */ customQuickAction) => await quickActionManager.saveQuickAction(customQuickAction));

frontendCommunicator.onAsync("saveAllCustomQuickActions",
    async (/** @type {QuickActionDefinition[]} */ allCustomQuickActions) => await quickActionManager.saveAllItems(allCustomQuickActions));

frontendCommunicator.on("deleteCustomQuickAction",
    (/** @type {string} */ customQuickActionId) => quickActionManager.deleteQuickAction(customQuickActionId));

frontendCommunicator.on("triggerQuickAction",
    (/** @type {QuickActionTrigger} */ trigger) => quickActionManager.triggerQuickAction(trigger));

module.exports = quickActionManager;
