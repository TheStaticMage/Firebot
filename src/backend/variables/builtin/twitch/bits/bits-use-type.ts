import { ReplaceVariable, Trigger } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const { EffectTrigger } = require("../../../../../shared/effect-constants");

const triggers = {};
triggers[EffectTrigger.EVENT] = ["twitch:bits-use"];
triggers[EffectTrigger.MANUAL] = true;

const model1 : ReplaceVariable = {
    definition: {
        handle: "bitsUseTypeId",
        description: "The type of bits usage (ID: cheer, power_up, combo).",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger) => {
        return trigger.metadata.eventData?.type || '';
    }
};

const model2 : ReplaceVariable = {
    definition: {
        handle: "bitsUseType",
        description: "The type of bits usage (human friendly name).",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger: Trigger) => {
        const type = trigger.metadata.eventData?.type;
        if (!type) {
            return '';
        }

        switch (type) {
            case 'cheer':
                return 'Cheer';
            case 'power_up':
                return 'Power Up';
            case 'combo':
                return 'Combo';
            default:
                return '';
        }
    }
};

export default [model1, model2];
