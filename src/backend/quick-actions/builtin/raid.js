"use strict";

/** @typedef {import("../../shared/types").QuickActionTriggerEvent} QuickActionTriggerEvent */

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
            customHelpText: [
                "Note: This quick action will trigger only the effects that you define here. Be sure to include the 'Raid/Unraid Twitch Channel' effect somewhere in your custom effect list to initiate a raid.",
                "You may use the variables '$raidQuickActionTargetUsername' and '$raidQuickActionTargetUserDisplayName' in your effects to access the username and display name of the selected raid target, respectively."
            ],
            defaultHelpText: [
                "The default effect of this quick action is to initiate a raid to the selected channel."
            ]
        };
        super(definition, properties);
    }

    onTriggerEvent(/** @type {QuickActionTriggerEvent} */ event = {}) {
        if (!event.params || Object.keys(event.params).length === 0) {
            const resolveObj = {
                streamerIsOnline: connectionManager.streamerIsOnline()
            };
            frontendCommunicator.send("trigger-quickaction:raid", resolveObj);
            return;
        }

        if (!event.params.username || event.params.username.trim() === "") {
            throw new Error("The raid quick action requires a username parameter");
        }

        const effects = [];

        if (!event.config || !event.config.overrideDefault) {
            effects.push({
                id: uuid(),
                type: "firebot:raid",
                action: "Raid Channel",
                username: event.params.username
            });
        }

        if (event.config && event.config.effectList && Array.isArray(event.config.effectList.list)) {
            effects.push(...event.config.effectList.list);
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
                        username: event.params.username,
                        userDisplayName: event.params.userDisplayName || event.params.username
                    }
                }
            },
            effects: {
                list: effects
            }
        };

        effectRunner.processEffects(request)
            .catch((error) => {
                frontendCommunicator.send("error", `Error processing raid quick action: ${error.message}`);
            });
    }
}

module.exports = new RaidQuickAction().toJson();
