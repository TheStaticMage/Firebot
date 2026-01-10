import { ReplaceVariable } from "../../../../../types/variables";
import { getSceneItemVisibilityByName } from "../obs-remote";

const expressionish = require('expressionish');

export const SceneItemVisibleVariable: ReplaceVariable = {
    definition: {
        handle: "obsSceneItemVisible",
        usage: "obsSceneItemVisible[sceneName, itemName]",
        description: "Returns 'true' if the specified OBS scene item is visible, 'false' if hidden, or 'error' if the scene or item cannot be found.",
        examples: [
            {
                usage: "obsSceneItemVisible[Gaming Scene, Webcam]",
                description: "Check if the 'Webcam' source is visible in 'Gaming Scene'"
            },
            {
                usage: "obsSceneItemVisible[Main, Alerts Group]",
                description: "Check if the 'Alerts Group' is visible in the 'Main' scene"
            }
        ],
        possibleDataOutput: ["text"],
        categories: ["advanced", "integrations", "obs"]
    },
    evaluator: async (trigger, sceneName: string, itemName: string) => {
        const visibility = await getSceneItemVisibilityByName(sceneName, itemName);

        if (visibility === null) {
            return "error";
        }

        return visibility ? "true" : "false";
    },
    argsCheck: (sceneName: unknown, itemName: unknown) => {
        if (sceneName == null || sceneName === "") {
            throw new expressionish.ExpressionArgumentsError("Scene name is required", 0);
        }

        if (itemName == null || itemName === "") {
            throw new expressionish.ExpressionArgumentsError("Item name is required", 1);
        }
    }
};
