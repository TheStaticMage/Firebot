import { ReplaceVariable, Trigger } from "../../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../../shared/variable-constants";

import { EffectTrigger } from "../../../../../shared/effect-constants";

const triggers = {};
triggers[EffectTrigger.EVENT] = [
    "twitch:channel-points-redemption-single-message-bypass-sub-mode",
    "twitch:channel-points-redemption-send-highlighted-message",
    "twitch:channel-points-redemption-random-sub-emote-unlock",
    "twitch:channel-points-redemption-chosen-sub-emote-unlock",
    "twitch:channel-points-redemption-chosen-modified-sub-emote-unlock"
];
triggers[EffectTrigger.MANUAL] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "channelPoints",
        description: "The channel point cost of the reward",
        categories: [VariableCategory.COMMON],
        possibleDataOutput: [OutputDataType.NUMBER],
        triggers: triggers
    },
    evaluator: (trigger: Trigger) => trigger.metadata.eventData.channelPoints || 0
};

export default model;
