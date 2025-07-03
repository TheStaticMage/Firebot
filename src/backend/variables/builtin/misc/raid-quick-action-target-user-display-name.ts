import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";
import { EffectTrigger } from "../../../../shared/effect-constants";
import { TriggersObject } from "../../../../types/triggers";

const triggers: TriggersObject = {
    [EffectTrigger.QUICK_ACTION]: ["firebot:raid"]
};

const model : ReplaceVariable = {
    definition: {
        handle: "raidQuickActionTargetUserDisplayName",
        usage: "raidQuickActionTargetUserDisplayName",
        description: "Get the user display name of the target of a raid quick action.",
        possibleDataOutput: [OutputDataType.TEXT],
        triggers: triggers,
        categories: [VariableCategory.TRIGGER]
    },
    evaluator: (trigger: Trigger) => {
        const quickActionData = trigger.metadata.quickAction;
        const args = quickActionData as { userDisplayName?: string } | undefined;
        return args?.userDisplayName || "";
    }
};

export default model;