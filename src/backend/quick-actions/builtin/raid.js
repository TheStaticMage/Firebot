"use strict";

const SystemQuickAction = require("../quick-action");
const accountAccess = require("../../common/account-access");
const frontendCommunicator = require("../../common/frontend-communicator");
const { EffectTrigger } = require("../../../shared/effect-constants");

class RaidQuickAction extends SystemQuickAction {
    constructor() {
        super({
            id: "firebot:raid",
            name: "Raid",
            type: "system-editable",
            icon: "fad fa-rocket-launch",
            modalData: {
                helpText: "Use the variables '$raidQuickActionTargetUsername' and '$raidQuickActionTargetUserDisplayName' to access the username and display name of the selected raid target."
            }
        });
    }

    onTriggerEvent() {
        frontendCommunicator.send("trigger-quickaction:raid");
    }

    onDefaultTriggerEvent(effectRunner, args) {
        const effects = [
            {
                effect: "firebot:raid",
                action: "Raid Channel",
                username: args.username || ""
            }
        ];

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

        effectRunner.processEffects(request);
    }
}

module.exports = new RaidQuickAction().toJson();
