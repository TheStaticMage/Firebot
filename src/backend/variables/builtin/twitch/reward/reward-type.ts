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
        handle: "rewardType",
        description: "The type of the automatic channel reward",
        triggers: triggers,
        categories: [VariableCategory.COMMON, VariableCategory.TRIGGER],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (trigger) => {
        const rewardType = trigger.metadata?.eventData?.rewardType;
        if (!rewardType) {
            return "";
        }
        return rewardType;
    }
};

export default model;
