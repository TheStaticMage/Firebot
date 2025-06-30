"use strict";

const SystemQuickAction = require("../quick-action");
const accountAccess = require("../../common/account-access");
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
        const effects = [
            {
                id: uuid(),
                type: "firebot:raid",
                action: "Raid Channel",
                username: args.username || ""
            }
        ];

        // Uncomment for testing
        effects[0] = {
            id: uuid(),
            type: "firebot:chat-feed-alert",
            action: "Chat Feed Alert",
            message: `[Testing] Raid Quick Action would have triggered a raid to ${args.username || "unknown user"}.`,
        };

        const request = {
            trigger: {
                type: EffectTrigger.QUICK_ACTION,
                metadata: {
                    username: accountAccess.getAccounts().streamer.username,
                    quickAction: {
                        id: "firebot:raid",
                        action: "Raid Channel",
                        username: args.username,
                        userDisplayName: args.userDisplayName || args.username || ""
                    }
                }
            },
            effects: {
                list: effects
            },
        };

        return request;
    }
}

module.exports = new RaidQuickAction().toJson();
