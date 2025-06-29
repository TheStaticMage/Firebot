import { FirebotChatMessage } from "./chat";
import { CommandDefinition } from "./commands";

export type TriggerType =
    | "command"
    | "custom_script"
    | "startup_script"
    | "api"
    | "event"
    | "hotkey"
    | "timer"
    | "counter"
    | "preset"
    | "quick_action"
    | "manual";

export type Trigger = {
    type: TriggerType;
    metadata: {
        username: string;
        hotkey?: unknown;
        command?: CommandDefinition;
        userCommand?: {
            trigger: string;
            args: string[],
            triggeredArg?: string,
            triggeredSubcmd?: CommandDefinition,
            subcommandId?: string
        };
        chatMessage?: FirebotChatMessage;
        event?: { id: string; name: string };
        eventSource?: { id: string; name: string };
        eventData?: {
            chatMessage?: FirebotChatMessage;
            [x: string]: unknown
        };
        counter?: {
            id: string;
            name: string;
            previousValue: number;
            value: number;
            minimum?: number;
            maximum?: number;
        };
        quickAction?: {
            id: string;
            [x: string]: unknown;
        };
        [x: string]: unknown;
    };
};

type TriggerValueType<T extends TriggerType> = T extends "event" | "quick_action" ? string[] | boolean : boolean;

export type TriggersObject = {
    [T in TriggerType]?: TriggerValueType<T>;
};