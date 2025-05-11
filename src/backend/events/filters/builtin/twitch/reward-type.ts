import { createPresetFilter } from "../../filter-factory";
import { PresetValue } from "../../../../../types/events";

const filter = createPresetFilter({
    id: "firebot:reward-type",
    name: "Reward Type",
    description: "Filter by the reward type of an automatic reward redemption",
    eventMetaKey: "rewardType",
    events: [
        { eventSourceId: "twitch", eventId: "channel-automatic-reward-redemption" }
    ],
    allowIsNot: true,
    presetValues: async (): Promise<PresetValue[]> => {
        return [
            { value: "single_message_bypass_sub_mode", display: "Single Message Bypass Sub Mode" },
            { value: "send_highlighted_message", display: "Send Highlighted Message" },
            { value: "random_sub_emote_unlock", display: "Unlock Random Sub Emote" },
            { value: "chosen_sub_emote_unlock", display: "Unlock Chosen Sub Emote" },
            { value: "chosen_modified_sub_emote_unlock", display: "Unlock Chosen Modified Sub Emote" },
            { value: "message_effect", display: "Message Effect" },
            { value: "gigantify_an_emote", display: "Gigantify an Emote" },
            { value: "celebration", display: "On-Screen Celebration" },
        ];
    },
});

export default filter;
