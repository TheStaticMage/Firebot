import { EffectCategory } from '../../../shared/effect-constants';
import { EffectType } from "../../../types/effects";
import { EffectDependency } from '../../../shared/effect-constants';
import { EffectTrigger } from '../../../shared/effect-constants';
import frontendCommunicator from "../../common/frontend-communicator";
import logger from "../../logwrapper";

const triggers = {};
triggers[EffectTrigger.COMMAND] = true;
triggers[EffectTrigger.EVENT] = ["twitch:chat-message"];

const model: EffectType<{
    hidden: boolean;
}> = {
    definition: {
        id: "firebot:chat-feed-message-hidden",
        name: "Chat Feed Message Hidden",
        description: "Hide or show a chat message in Firebot's chat feed",
        icon: "fad fa-eye-slash",
        categories: [EffectCategory.COMMON, EffectCategory.CHAT_BASED],
        dependencies: [EffectDependency.CHAT],
        triggers: triggers
    },
    optionsTemplate: `
    <eos-container header="Message Visibility" pad-top="true">
        <p class="muted">This effect acts on the Firebot chat feed only. It does NOT change anything in the Twitch feed.</p>
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span class="chat-feed-message-hidden-effect-visibility">{{effect.hidden ? "Hidden" : "Visible"}}</span> <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
            <li ng-click="effect.hidden = false"><a href>Visible</a></li>
            <li ng-click="effect.hidden = true"><a href>Hidden</a></li>
        </ul>
    </eos-container>
    `,
    getDefaultLabel: (effect) => {
        return effect.hidden == true ? "Hide Message" : "Show Message";
    },
    optionsController: ($scope) => {
        $scope.effect.hidden = $scope.effect.hidden ?? true;
    },
    optionsValidator: (effect) => {
        const errors = [];
        if (effect.hidden == null) {
            errors.push("Please select visible or hidden.");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { trigger } = event;

        try {
            let messageId = null;
            if (trigger.type === EffectTrigger.COMMAND) {
                messageId = trigger.metadata.chatMessage.id;
            } else if (trigger.type === EffectTrigger.EVENT) {
                messageId = trigger.metadata.eventData.chatMessage.id;
            }

            if (messageId) {
                logger.debug("Setting chat feed message hidden: messageId:", messageId, "hidden:", event.effect.hidden);
                frontendCommunicator.send("chat-feed-message-hidden", { messageId: messageId, isHidden: event.effect.hidden});
            } else {
                logger.debug("No messageId found in trigger");
            }
        } catch (error) {
            logger.error("Error setting chat feed message hidden: ", error);
        }
    }
};

export = model;