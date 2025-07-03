"use strict";

/** @typedef {import("../../shared/types").QuickActionDefinition} QuickActionDefinition */
/** @typedef {import("../../shared/types").QuickActionTriggerEvent} QuickActionTriggerEvent */

class SystemQuickAction {
    /**
     * @param {QuickActionDefinition} definition
     */
    constructor (definition, properties = {}) {
        /** @type {QuickActionDefinition} */
        this.definition = {
            id: definition.id,
            name: definition.name,
            type: definition.type,
            icon: definition.icon
        };
        this.properties = properties;
    }

    /**
     * @abstract
     * @param {QuickActionTriggerEvent} [_event]
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onTriggerEvent(_event = undefined) {
        throw new Error("Please implement this method");
    }

    /**
     * @protected
     */
    toJson() {
        return {
            definition: this.definition,
            properties: this.properties,
            onTriggerEvent: this.onTriggerEvent
        };
    }
}

module.exports = SystemQuickAction;
