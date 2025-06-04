/**
 * The type of bits usage.
 */
export type EventSubChannelBitsUseType = 'cheer' | 'power_up' | 'combo';

/** @private */
export type EventSubChannelBitsUseMessagePart =
	| EventSubChatMessageTextPart
	| EventSubChatMessageCheermotePart
	| EventSubChatMessageEmotePart;

/** @private */
export interface EventSubChannelBitsUseMessageData {
	text: string;
	fragments: EventSubChannelBitsUseMessagePart[];
}

/** @private */
export interface EventSubChannelBitsUseEventData {
	user_id: string;
	user_login: string;
	user_name: string;
	broadcaster_user_id: string;
	broadcaster_user_login: string;
	broadcaster_user_name: string;
	bits: number;
	type: EventSubChannelBitsUseType;
	power_up: EventSubChannelBitsUsePowerUpData | null;
	message: EventSubChannelBitsUseMessageData | null;
    powerUpType?: EventSubChannelBitsUsePowerUpType | null; // Sent by manual trigger
}

/**
 * The type of Power-up.
 */
export type EventSubChannelBitsUsePowerUpType = 'message_effect' | 'celebration' | 'gigantify_an_emote';

/** @private */
export interface EventSubChannelBitsUsePowerUpEmoteData {
	id: string;
	name: string;
}

/** @private */
export interface EventSubChannelBitsUsePowerUpData {
	type: EventSubChannelBitsUsePowerUpType;
	emote: EventSubChannelBitsUsePowerUpEmoteData | null;
	message_effect_id: string | null;
}

export interface EventSubChatMessageTextPart {
    type: 'text';
    text: string;
}

export interface EventSubChatMessageCheermote {
    prefix: string;
    bits: number;
    tier: number;
}

export interface EventSubChatMessageCheermotePart {
    type: 'cheermote';
    text: string;
    cheermote: EventSubChatMessageCheermote;
}

export interface EventSubChatMessageEmote {
    id: string;
    emote_set_id: string;
    owner_id: string;
    format: string[];
}

export interface EventSubChatMessageEmotePart {
    type: 'emote';
    text: string;
    emote: EventSubChatMessageEmote;
}
