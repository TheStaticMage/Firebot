import { ReplaceVariable, Trigger } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const { EffectTrigger } = require("../../../../../shared/effect-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:bits-use"];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "usedBitsAmount",
        description: "The amount of bits used in the event.",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.NUMBER]
    },
    evaluator: (trigger: Trigger) => {
        const bits = trigger.metadata.eventData.bits || 0;
        return bits;
    }
};

export default model;
