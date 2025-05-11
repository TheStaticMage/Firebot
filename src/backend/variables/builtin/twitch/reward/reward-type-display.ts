import { ReplaceVariable } from "../../../../../types/variables";
import { EffectTrigger } from "../../../../../shared/effect-constants";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = [
    "twitch:channel-automatic-reward-redemption"
];
triggers[EffectTrigger.CHANNEL_AUTOMATIC_REWARD] = true;
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "rewardTypeDisplay",
        description: "The display type of the automatic channel reward",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        const result = trigger.metadata?.eventData?.rewardTypeDisplay;
        if (!result) {
            return "";
        }
        return result;
    }
};

export default model;
