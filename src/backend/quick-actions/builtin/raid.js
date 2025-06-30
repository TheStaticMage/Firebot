"use strict";

const SystemQuickAction = require("../quick-action");
const accountAccess = require("../../common/account-access");
const connectionManager = require("../../common/connection-manager");
const frontendCommunicator = require("../../common/frontend-communicator");
const { EffectTrigger } = require("../../../shared/effect-constants");
const { v4: uuid } = require("uuid");

class RaidQuickAction extends SystemQuickAction {
    constructor() {
        super({
            id: "firebot:raid",
            name: "Raid",
            type: "system",
            icon: "fad fa-rocket-launch",
            customizable: true,
            modalData: {
                helpText: "Use the variables '$raidQuickActionTargetUsername' and '$raidQuickActionTargetUserDisplayName' to access the username and display name of the selected raid target."
            }
        });
    }

    onTriggerEvent() {
        frontendCommunicator.send("trigger-quickaction:raid");
    }

    getDefaultRequest(args) {
        return new Promise((resolve, reject) => {
            if (!args || !args.username) {
                reject(new Error("Raid Quick Action requires a username argument"));
            }

            if (!connectionManager.streamerIsOnline()) {
                reject(new Error(`You cannot trigger a raid while offline (selected raid target: ${args.username})`));
            }

            const effects = [
                {
                    id: uuid(),
                    type: "firebot:raid",
                    action: "Raid Channel",
                    username: args.username
                }
            ];

            const streamer = accountAccess.getAccounts().streamer;
            const request = {
                trigger: {
                    type: EffectTrigger.QUICK_ACTION,
                    metadata: {
                        username: streamer.username,
                        quickAction: {
                            id: "firebot:raid",
                            action: "Raid Channel",
                            username: args.username,
                            userDisplayName: args.userDisplayName || args.username
                        }
                    }
                },
                effects: {
                    list: effects
                },
            };

            resolve(request);
        });
    }
}

module.exports = new RaidQuickAction().toJson();
