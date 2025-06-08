import { DataObject, rawDataSymbol, rtfm } from '@twurple/common';
import type {
    EventSubChannelBitsUsePowerUpData,
    EventSubChannelBitsUsePowerUpType,
    EventSubChannelBitsUsePowerUpEmoteData
} from './EventSubChannelBitsUsePowerUp.external';

/**
 * Represents a bits usage Power-up.
 */
@rtfm('eventsub-base', 'EventSubChannelBitsUsePowerUp')
export class EventSubChannelBitsUsePowerUp extends DataObject<EventSubChannelBitsUsePowerUpData> {
    /**
	 * The type of the Power-up.
	 */
    get type(): EventSubChannelBitsUsePowerUpType {
        return this[rawDataSymbol].type;
    }

    /**
	 * Emote associated with the reward.
	 */
    get emote(): EventSubChannelBitsUsePowerUpEmoteData | null {
        return this[rawDataSymbol].emote;
    }

    /**
	 * The ID of the message effect.
	 */
    get message_effect_id(): string | null {
        return this[rawDataSymbol].message_effect_id;
    }
}
