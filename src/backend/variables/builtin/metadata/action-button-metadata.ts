import type { ReplaceVariable, Trigger } from "../../../../types/variables";

type ActionButtonMetadata = {
    clicked?: boolean;
    uuid?: string;
    buttonName?: string;
    extraMetadata?: unknown;
};

const model: ReplaceVariable = {
    definition: {
        handle: "actionButton",
        description: "Returns metadata about the action button if the current effect was triggered by an action button click",
        usage: "actionButton[clicked|uuid|buttonName|extraMetadata]",
        possibleDataOutput: ["text"],
        categories: ["trigger based"]
    },
    evaluator: async (trigger: Trigger, property: "clicked" | "uuid" | "buttonName" | "extraMetadata") => {
        const metadata = (trigger.metadata as Trigger["metadata"] & { actionButton?: ActionButtonMetadata }).actionButton;

        if (!metadata) {
            return "[Not triggered by action button]";
        }

        if (property === "clicked") {
            return metadata.clicked ? "true" : "false";
        }

        if (property === "uuid") {
            return metadata.uuid || "";
        }

        if (property === "buttonName") {
            return metadata.buttonName || "";
        }

        if (property === "extraMetadata") {
            return metadata.extraMetadata ? JSON.stringify(metadata.extraMetadata) : "";
        }

        return "[Invalid property]";
    }
};

export default model;
