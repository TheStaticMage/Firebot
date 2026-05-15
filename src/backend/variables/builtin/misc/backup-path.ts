import type { ReplaceVariable, TriggersObject } from "../../../../types/variables";

const triggers: TriggersObject = {};
triggers["event"] = [
    "firebot:viewer-database-compacted"
];
triggers["manual"] = true;

const model : ReplaceVariable = {
    definition: {
        handle: "backupPath",
        description: "Get backup path when the viewer-database-compacted event is triggered.",
        possibleDataOutput: ["text"],
        examples: [
            {
                usage: "backupPath",
                description: "Outputs the backup path when the viewer-database-compacted event is triggered."
            }
        ]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData?.backupPath || "";
    }
};

export default model;
