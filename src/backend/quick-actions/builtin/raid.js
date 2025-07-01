"use strict";

const SystemQuickAction = require("../quick-action");
const accountAccess = require("../../common/account-access");
const connectionManager = require("../../common/connection-manager");
const effectRunner = require("../../common/effect-runner");
const frontendCommunicator = require("../../common/frontend-communicator");
const { EffectTrigger } = require("../../../shared/effect-constants");
const { v4: uuid } = require("uuid");

class RaidQuickAction extends SystemQuickAction {
    constructor() {
        const definition = {
            id: "firebot:raid",
            name: "Raid",
            type: "system",
            icon: "fad fa-rocket-launch"
        };
        const properties = {
            customizable: true,
            hasDefaultAction: true,
            modalHelpText: "Use the variables '$raidQuickActionTargetUsername' and '$raidQuickActionTargetUserDisplayName' to access the username and display name of the selected raid target."
        };
        super(definition, properties);
    }

    onTriggerEvent(args = {}) {
        if (!args.params || Object.keys(args.params).length === 0) {
            frontendCommunicator.send("trigger-quickaction:raid");
            return;
        }

        if (!args.params.username || args.params.username.trim() === "") {
            throw new Error("The raid quick action requires a username parameter");
        }

        const effects = [];

        if (!args.config || !args.config.overrideDefault) {
            if (!connectionManager.streamerIsOnline()) {
                const message = `You cannot trigger a raid while you are offline (selected raid target: ${args.params.username})`;
                frontendCommunicator.send("error", message);
                return;
            }

            effects.push({
                id: uuid(),
                type: "firebot:raid",
                action: "Raid Channel",
                username: args.params.username
            });
        }

        if (args.config && args.config.effectList && Array.isArray(args.config.effectList.list)) {
            effects.push(...args.config.effectList.list);
        }

        if (effects.length === 0) {
            frontendCommunicator.send("error", "No effects are configured to run for the raid quick action. Please edit the quick action and either select the default action or add at least one effect to the effect list.");
            return;
        }

        const streamer = accountAccess.getAccounts().streamer;
        const request = {
            trigger: {
                type: EffectTrigger.QUICK_ACTION,
                metadata: {
                    username: streamer.username,
                    quickAction: {
                        id: "firebot:raid",
                        action: "Raid Channel",
                        username: args.params.username,
                        userDisplayName: args.params.userDisplayName || args.params.username
                    }
                }
            },
            effects: {
                list: effects
            },
        };

        effectRunner.processEffects(request)
            .catch(error => {
                frontendCommunicator.send("error", `Error processing raid quick action: ${error.message}`);
            });
    }
}

module.exports = new RaidQuickAction().toJson();
