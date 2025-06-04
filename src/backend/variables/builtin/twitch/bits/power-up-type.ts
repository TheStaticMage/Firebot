import { ReplaceVariable, Trigger } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const { EffectTrigger } = require("../../../../../shared/effect-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:bits-use"];
triggers[EffectTrigger.MANUAL] = true;

type powerUpData = { type: 'message_effect' | 'celebration' | 'gigantify_an_emote', emote?: { id: string, name: string }, message_effect_id?: string | null; } | null;

const model1 : ReplaceVariable = {
    definition: {
        handle: "powerUpTypeRaw",
        description: "The type of power-up used (raw value: message_effect, celebration, gigantify_an_emote).",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger) => {
        const powerUp = getPowerUpFromEventData(trigger.metadata.eventData);
        if (!powerUp) {
            return "";
        }

        return powerUp.type;
    }
};

const model2 : ReplaceVariable = {
    definition: {
        handle: "powerUpType",
        description: "The type of power-up used (human friendly name).",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger) => {
        const powerUp = getPowerUpFromEventData(trigger.metadata.eventData);
        if (!powerUp) {
            return "";
        }

        switch (powerUp.type) {
            case 'message_effect':
                return 'Message Effect';
            case 'celebration':
                return 'Celebration';
            case 'gigantify_an_emote':
                return 'Gigantify an Emote';
            default:
                return '';
        }
    }
};

function getPowerUpFromEventData(eventData: any): powerUpData {
    if (eventData && eventData.power_up) {
        return eventData.power_up as powerUpData;
    } else if (eventData && eventData.type === "power_up" && typeof eventData.powerUpType === "string") {
        // Manual triggers send the power-up type as a string so we will
        // simulate additional power-up data based on the type.
        if (eventData.powerUpType === "message_effect") {
            return { type: eventData.powerUpType, message_effect_id: 'test_message_effect_id' };
        }

        if (eventData.powerUpType === "celebration") {
            return { type: eventData.powerUpType };
        }

        if (eventData.powerUpType === "gigantify_an_emote") {
            return { type: eventData.powerUpType, emote: { id: 'thesta174Mittens', name: 'Mittens' } };
        }
    }
    return null;
}

export default [model1, model2];
