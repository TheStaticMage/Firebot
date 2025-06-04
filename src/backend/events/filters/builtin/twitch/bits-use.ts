import { createNumberFilter, createPresetFilter } from "../../filter-factory";
import { EventFilter } from "../../../../../types/events";
import { ComparisonType } from "../../../../../shared/filter-constants";

type powerUpData = { type: 'message_effect' | 'celebration' | 'gigantify_an_emote', emote?: { id: string, name: string }, message_effect_id?: string | null } | null;

const filter1 = createPresetFilter({
    id: "firebot:bits-use-type",
    name: "Bits Use Type",
    description: "Filter by the tier of bits use (cheer, power-up, combo)",
    events: [
        { eventSourceId: "twitch", eventId: "bits-use" }
    ],
    eventMetaKey: "type",
    allowIsNot: true,
    presetValues: () => [
        {
            value: "cheer",
            display: "Cheer"
        },
        {
            value: "power_up",
            display: "Power-Up"
        },
        {
            value: "combo",
            display: "Combo"
        }
    ]
});

const filter2: EventFilter = {
    id: "firebot:bits-use-power-up-type",
    name: "Power-Up Type",
    description: "Filter by the type of power-up used",
    events: [
        { eventSourceId: "twitch", eventId: "bits-use" }
    ],
    comparisonTypes: [ComparisonType.IS, ComparisonType.IS_NOT],
    valueType: "preset",
    presetValues: () => [
        {
            value: "message_effect",
            display: "Message Effect"
        },
        {
            value: "celebration",
            display: "On-Screen Celebration"
        },
        {
            value: "gigantify_an_emote",
            display: "Gigantify an Emote"
        }
    ],
    getSelectedValueDisplay: (filterSettings) => {
        switch (filterSettings.value) {
            case "message_effect":
                return "Message Effect";
            case "celebration":
                return "On-Screen Celebration";
            case "gigantify_an_emote":
                return "Gigantify an Emote";
            default:
                return "[Not set]";
        }
    },
    predicate: (filterSettings, eventData) => {
        const { value } = filterSettings;
        const { eventMeta } = eventData;

        if (value == null) {
            return true;
        }

        var powerUp = eventMeta.power_up as powerUpData | null;
        if (!powerUp) {
            // Manual metadata
            if (eventMeta.type === "power_up" && (eventMeta.powerUpType === "message_effect" || eventMeta.powerUpType === "celebration" || eventMeta.powerUpType === "gigantify_an_emote")) {
                powerUp = { type: eventMeta.powerUpType, emote: null, message_effect_id: null };
            } else {
                return false; // No power-up data available
            }
        }

        if (filterSettings.comparisonType === ComparisonType.IS && powerUp.type === value) {
            return true;
        }

        if (filterSettings.comparisonType === ComparisonType.IS_NOT && powerUp.type !== value) {
            return true;
        }

        return false;
    }
};

const filter3 = createNumberFilter({
    id: "firebot:bits-use-amount",
    name: "Bits Amount",
    description: "Filter by the amount of bits",
    eventMetaKey: "bits",
    events: [
        { eventSourceId: "twitch", eventId: "cheer" }
    ]
});

export default [filter1, filter2, filter3];
