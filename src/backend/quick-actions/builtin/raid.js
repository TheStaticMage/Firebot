"use strict";

const QuickAction = require("../quick-action");
const frontendCommunicator = require("../../common/frontend-communicator");

class RaidQuickAction extends QuickAction {
    constructor() {
        super({
            id: "firebot:raid",
            name: "Raid",
            type: "system-editable",
            icon: "fad fa-rocket-launch",
            helpText: "Raid target is available in '$raidTargetUsername' and '$raidTargetUserDisplayName' variables.",
            defaultEvent: "initiate-raid",
            defaultEventData: {
                raidTargetUsername: "$raidTargetUsername",
                raidTargetUserDisplayName: "$raidTargetUserDisplayName"
            }
        });
    }

    onTriggerEvent() {
        frontendCommunicator.send("trigger-quickaction:raid");
    }
}

module.exports = new RaidQuickAction().toJson();
