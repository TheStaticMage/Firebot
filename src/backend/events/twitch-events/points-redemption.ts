import eventManager from "../../events/EventManager";

export function triggerRedemptionSingleMessageBypassSubMode(
    username: string,
    userId: string,
    userDisplayName: string,
    channelPoints: number,
    messageText: string
): void {
    eventManager.triggerEvent("twitch", "channel-points-redemption-single-message-bypass-sub-mode", {
        username,
        userId,
        userDisplayName,
        channelPoints,
        messageText
    });
}

export function triggerRedemptionSendHighlightedMessage(
    username: string,
    userId: string,
    userDisplayName: string,
    channelPoints: number,
    messageText: string
): void {
    eventManager.triggerEvent("twitch", "channel-points-redemption-send-highlighted-message", {
        username,
        userId,
        userDisplayName,
        channelPoints,
        messageText
    });
}

export function triggerRedemptionRandomSubEmoteUnlock(
    username: string,
    userId: string,
    userDisplayName: string,
    channelPoints: number,
    emoteName: string,
    emoteUrl: string
): void {
    eventManager.triggerEvent("twitch", "channel-points-redemption-unlock-random-sub-emote", {
        username,
        userId,
        userDisplayName,
        channelPoints,
        emoteName,
        emoteUrl
    });
}

export function triggerRedemptionChosenSubEmoteUnlock(
    username: string,
    userId: string,
    userDisplayName: string,
    channelPoints: number,
    emoteName: string,
    emoteUrl: string
): void {
    eventManager.triggerEvent("twitch", "channel-points-redemption-chosen-sub-emote-unlock", {
        username,
        userId,
        userDisplayName,
        channelPoints,
        emoteName,
        emoteUrl
    });
}

export function triggerRedemptionChosenModifiedSubEmoteUnlock(
    username: string,
    userId: string,
    userDisplayName: string,
    channelPoints: number,
    emoteName: string,
    emoteUrl: string
): void {
    eventManager.triggerEvent("twitch", "channel-points-redemption-chosen-modified-sub-emote-unlock", {
        username,
        userId,
        userDisplayName,
        channelPoints,
        emoteName,
        emoteUrl
    });
}
