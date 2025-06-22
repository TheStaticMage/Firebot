"use strict";

const QuickAction = require("../quick-action");
const frontendCommunicator = require("../../common/frontend-communicator");

class RaidQuickAction extends QuickAction {
    constructor() {
        super({
            id: "firebot:raid",
            name: "Raid",
            type: "system",
            icon: "fad fa-rocket-launch"
        });
    }

    onTriggerEvent() {
        frontendCommunicator.send("trigger-quickaction:raid");
    }
}

module.exports = new RaidQuickAction().toJson();
