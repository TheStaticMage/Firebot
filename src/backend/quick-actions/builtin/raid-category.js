"use strict";

const QuickAction = require("../quick-action");
const frontendCommunicator = require("../../common/frontend-communicator");

class RaidCategoryQuickAction extends QuickAction {
    constructor() {
        super({
            id: "firebot:raid-category",
            name: "Raid Same Category",
            type: "system",
            icon: "fad fa-rocket-launch"
        });
    }

    onTriggerEvent() {
        frontendCommunicator.send("trigger-quickaction:raid-category");
    }
}

module.exports = new RaidCategoryQuickAction().toJson();
