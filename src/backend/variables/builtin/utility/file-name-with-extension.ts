import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { OutputDataType, VariableCategory } from "../../../../shared/variable-constants";
import { ReplaceVariable, Trigger } from "../../../../types/variables";

const model : ReplaceVariable = {
    definition: {
        handle: "fileNameWithExtension",
        usage: 'fileNameWithExtension[c:/path/to/directory, filename]',
        description: "Finds the file 'filename' in the provided directory, and returns it with its extension if any (e.g. 'filename.mp3').",
        categories: [VariableCategory.ADVANCED],
        possibleDataOutput: [OutputDataType.TEXT]
    },
    evaluator: (
        trigger: Trigger,
        filePath?: string,
        filename?: string
    ) : string => {
        if (!filePath || !filename) {
            return "";
        }

        const dirFiles = readdirSync(filePath);
        if (dirFiles.includes(filename) && existsSync(join(filePath, filename))) {
            return filename;
        }

        const matches = dirFiles.filter(f => f.startsWith(`${filename}.`));
        for (const match of matches) {
            const candidatePath = join(filePath, match);
            if (existsSync(candidatePath)) {
                return match;
            }
        }

        return "";
    }
};

export default model;
