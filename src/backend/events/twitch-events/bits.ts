import eventManager from "../EventManager";

export function triggerBitsUse(
    username: string,
    userId: string,
    userDisplayName: string,
    bits: number,
    type: 'cheer' | 'power_up' | 'combo',
    messageText: string,
    powerUp: { type: 'message_effect' | 'celebration' | 'gigantify_an_emote', emote?: { id: string, name: string }, message_effect_id?: string | null } | null,
): void {
    // Trigger the generic "bits used" event. This will trigger for all types of
    // bits usage in the channel.
    eventManager.triggerEvent('twitch', 'bits-use', {
        username,
        userId,
        userDisplayName,
        bits,
        type,
        messageText,
        powerUp,
    });

    // If we want to trigger specific events for different types of bits usage,
    // we could do that here. For now we'll see how far using triggers on the
    // generic event gets us.
}
