"use strict";

(function() {
    /** @typedef {import("../../../shared/types").QuickActionDefinition} QuickAction */
    /** @typedef {import("../../../shared/types").QuickActionProperties} QuickActionProperties */

    angular
        .module("firebotApp")
        .factory("quickActionsService", function(backendCommunicator, utilityService) {
            const service = {};

            /** @type {QuickAction[]} */
            service.quickActions = [];

            /** @type {Record<string, QuickActionProperties>} */
            service.quickActionProperties = {};

            /**
             * @memberof quickActionService
             * @param {QuickAction} quickAction
             * @returns {void}
             */
            const updateQuickActions = (quickAction) => {
                const index = service.quickActions.findIndex(cqa => cqa.id === quickAction.id);
                if (index > -1) {
                    service.quickActions[index] = quickAction;
                } else {
                    service.quickActions.push(quickAction);
                }
            };

            /**
             * @returns {Promise.<void>}
             */
            service.loadQuickActions = async () => {
                const response = await backendCommunicator.fireEventAsync("getQuickActions");

                if (response) {
                    service.quickActions = response.definitions || [];
                    service.quickActionProperties = response.properties || {};
                }

                service.setupListeners();
            };

            /**
             * @return {void}
             */
            service.setupListeners = () => {
                backendCommunicator.on("all-quick-actions", (/** @type {QuickAction[]} */ quickActions) => {
                    if (quickActions != null) {
                        service.quickActions = quickActions;
                    }
                });

                backendCommunicator.on("trigger-quickaction:stream-info", () => {
                    utilityService.showModal({
                        component: "editStreamInfoModal",
                        size: "md"
                    });
                });

                backendCommunicator.on("trigger-quickaction:give-currency", () => {
                    utilityService.showModal({
                        component: "giveCurrencyModal",
                        size: "md"
                    });
                });

                backendCommunicator.on("trigger-quickaction:reward-queue", () => {
                    utilityService.showModal({
                        component: "rewardQueueModal",
                        size: "lg"
                    });
                });

                backendCommunicator.on("trigger-quickaction:raid", (resolveObj) => {
                    utilityService.showModal({
                        component: "raidModal",
                        size: "md",
                        resolveObj: resolveObj
                    });
                });
            };

            /**
             * @returns {QuickAction[]}
             */
            service.getQuickActions = async () => {
                if (!service.quickActions || !service.quickActions.length) {
                    await service.loadQuickActions();
                }

                return service.quickActions || [];
            };

            /**
             * @param {string} quickActionId
             * @returns {QuickAction}
             */
            service.getQuickAction = (quickActionId) => {
                return service.quickActions.find(qa => qa.id === quickActionId);
            };

            /**
             * @param {QuickAction} customQuickAction
             * @returns {Promise.<void>}
             */
            service.saveCustomQuickAction = async (customQuickAction) => {
                const savedCustomQuickAction = await backendCommunicator.fireEventAsync("saveCustomQuickAction", customQuickAction);

                if (savedCustomQuickAction) {
                    updateQuickActions(savedCustomQuickAction);
                    return true;
                }

                return false;
            };

            /**
             * @param {string} customQuickActionId
             * @returns {void}
             */
            service.deleteCustomQuickAction = (customQuickActionId) => {
                service.quickActions = service.quickActions.filter(cqa => cqa.id !== customQuickActionId);
                backendCommunicator.fireEvent("deleteCustomQuickAction", customQuickActionId);
            };

            /**
             * @param {QuickAction} [customQuickAction]
             * @returns {void}
             */
            service.showAddOrEditCustomQuickActionModal = (customQuickAction) => {
                const quickAction = {
                    definition: customQuickAction,
                    properties: service.quickActionProperties[customQuickAction.id] || {}
                };

                utilityService.showModal({
                    component: "addOrEditCustomQuickActionModal",
                    size: "md",
                    resolveObj: {
                        quickAction: () => quickAction
                    }
                });
            };

            return service;
        });
}());