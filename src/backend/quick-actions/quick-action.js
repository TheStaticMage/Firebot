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
     * @param {import("../../shared/effect-runner").EffectRunner} effectRunner
     * @param {Object} args
     */
    onDefaultTriggerEvent(effectRunner, args) {
        throw new Error("Please implement this method");
    }

    /**
     * @protected
     */
    toJson() {
        return {
            definition: this.definition,
            onTriggerEvent: this.onTriggerEvent,
            onDefaultTriggerEvent: this.onDefaultTriggerEvent
        };
    }
}

module.exports = SystemQuickAction;
