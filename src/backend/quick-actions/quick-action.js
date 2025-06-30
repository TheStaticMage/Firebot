"use strict";

/** @typedef {import("../../shared/types").QuickActionDefinition} QuickActionDefinition */

class SystemQuickAction {
    /**
     * @param {QuickActionDefinition} definition
     */
    constructor (definition) {
        /** @type {QuickActionDefinition} */
        this.definition = {
            id: definition.id,
            name: definition.name,
            type: definition.type,
            icon: definition.icon,
            customizable: definition.customizable || false,
            modalData: definition.modalData || {},
        };
    }

    /**
     * @abstract
     */
    onTriggerEvent() {
        throw new Error("Please implement this method");
    }

    /**
     * @abstract
     * @param {Object} args
     * @returns {Object} The default request object
     */
    getDefaultRequest(args) {
        throw new Error("Please implement this method");
    }

    /**
     * @protected
     */
    toJson() {
        return {
            definition: this.definition,
            onTriggerEvent: this.onTriggerEvent,
            getDefaultRequest: this.getDefaultRequest
        };
    }
}

module.exports = SystemQuickAction;
