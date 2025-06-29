import { ReplaceVariable, Trigger } from "../../../../types/variables";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";
import { EffectTrigger } from "../../../../shared/effect-constants";
import { TriggersObject } from "../../../../types/triggers";

const triggers: TriggersObject = {
    [EffectTrigger.QUICK_ACTION]: ["firebot:raid"]
};

const model : ReplaceVariable = {
    definition: {
        handle: "raidQuickActionTargetUsername",
        usage: "raidQuickActionTargetUsername",
        description: "Get the username of the target of a raid quick action.",
        possibleDataOutput: [OutputDataType.TEXT],
        triggers: triggers,
        categories: [VariableCategory.TRIGGER]
    },
    evaluator: (trigger: Trigger) => {
        const quickActionData = trigger.metadata.quickAction;
        const args = quickActionData?.args as { username?: string } | undefined;
        return args?.username || "";
    }
};

export default model;