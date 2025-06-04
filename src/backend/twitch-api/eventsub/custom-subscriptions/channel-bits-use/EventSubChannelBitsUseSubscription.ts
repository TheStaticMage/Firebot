import type { HelixEventSubSubscription } from '@twurple/api';
import { rtfm } from '@twurple/common';
import { EventSubSubscription, EventSubBase } from "@twurple/eventsub-base";
import { EventSubChannelBitsUseEvent } from './EventSubChannelBitsUseEvent';
import { type EventSubChannelBitsUseEventData } from './EventSubChannelBitsUseEvent.external';

/** @internal */
@rtfm('eventsub-base', 'EventSubSubscription')
export class EventSubChannelBitsUseSubscription extends EventSubSubscription<EventSubChannelBitsUseEvent> {
	/** @protected */ readonly _cliName = '';

	constructor(
		handler: (data: EventSubChannelBitsUseEvent) => void,
		client: EventSubBase,
		private readonly _broadcasterId: string,
	) {
        // @ts-ignore
		super(handler, client);
	}

	get id(): string {
		return `channel.bits.use.${this._broadcasterId}`;
	}

    get authUserId(): string | null {
        return this._broadcasterId;
    }

	protected transformData(data: EventSubChannelBitsUseEventData): EventSubChannelBitsUseEvent {
		return new EventSubChannelBitsUseEvent(data, this._client._apiClient);
	}

	protected async _subscribe(): Promise<HelixEventSubSubscription> {
        return await this._client._apiClient.eventSub.createSubscription('channel.bits.use',
            '1',
            {
                // eslint-disable-next-line camelcase
                broadcaster_user_id: this._broadcasterId,
            },
            await this._getTransportOptions(),
            this._broadcasterId,
            ['bits:read']
        );
	}
}