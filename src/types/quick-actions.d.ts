import { EffectList } from "./effects";
import { Awaitable } from "./util-types";

export type QuickActionDefinition = {
    id: string;
    name: string;
    type: "system" | "custom";
    icon: string;
    presetListId?: string;
    presetArgValues?: Record<string, unknown>;
    promptForArgs?: boolean;
    properties?: QuickActionProperties;
    effectList?: EffectList;
};

export type SystemQuickAction = {
    definition: QuickActionDefinition;
    onTriggerEvent(QuickActionTriggerEvent?): Awaitable<void>;
};

export type QuickActionProperties = {
    customizable?: boolean;
    hasDefaultAction?: boolean;
    customHelpText?: string[];
    defaultHelpText?: string[];
};

export type QuickActionTriggerEvent = {
    config: object;
    params: Record<string, unknown>;
};
