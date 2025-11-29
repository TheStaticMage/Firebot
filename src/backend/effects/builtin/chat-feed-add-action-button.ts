import { ActionButtonDefinition } from '../../../types/action-buttons';
import { EffectType } from '../../../types/effects';
import { actionButtonManager } from '../../chat/action-button-manager';
import frontendCommunicator from '../../common/frontend-communicator';
import logger from '../../logwrapper';

const effect: EffectType<{
    useCustomMessageId: boolean;
    messageId?: string;
    actionButtons: ActionButtonDefinition[];
}> = {
    definition: {
        id: "firebot:chat-feed-add-action-button",
        name: "Add Action Buttons to Message",
        description: "Add action buttons to an existing message in Firebot's chat feed",
        icon: "fad fa-hand-pointer",
        categories: ["chat based"],
        dependencies: []
    },
    optionsTemplate: `
    <eos-container header="Message Selection">
        <p class="muted">Choose whether to use the automatic message ID or specify a custom one</p>
        <label class="control-fb control--radio">Use automatic message ID (from trigger)
            <input type="radio" ng-model="effect.useCustomMessageId" ng-value="false"/>
            <div class="control__indicator"></div>
        </label>
        <label class="control-fb control--radio">Use custom message ID
            <input type="radio" ng-model="effect.useCustomMessageId" ng-value="true"/>
            <div class="control__indicator"></div>
        </label>

        <div ng-if="effect.useCustomMessageId" style="margin-top: 10px;">
            <firebot-input
                model="effect.messageId"
                placeholder-text="Custom Message ID"
            />
        </div>
    </eos-container>

    <eos-container header="Action Buttons" pad-top="true">
        <action-button-list
            model="effect.actionButtons"
            trigger="{{trigger}}"
            trigger-meta="triggerMeta"
            modal-id="{{modalId}}">
        </action-button-list>
    </eos-container>
    `,
    optionsController: ($scope) => {
        if ($scope.effect.useCustomMessageId == null) {
            $scope.effect.useCustomMessageId = false;
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];

        if (effect.useCustomMessageId && (!effect.messageId || effect.messageId.trim() === "")) {
            errors.push("Custom Message ID cannot be empty when 'Use custom message ID' is selected.");
        }

        if (!effect.actionButtons || effect.actionButtons.length === 0) {
            errors.push("At least one action button must be added.");
        } else {
            effect.actionButtons.forEach((button, index) => {
                if (!button.name || button.name.trim() === "") {
                    errors.push(`Action Button ${index + 1}: Button text cannot be empty.`);
                }

                if (!button.backgroundColor || button.backgroundColor.trim() === "") {
                    errors.push(`Action Button ${index + 1}: Background color must be selected.`);
                }

                if (!button.foregroundColor || button.foregroundColor.trim() === "") {
                    errors.push(`Action Button ${index + 1}: Foreground color must be selected.`);
                }

                if (!button.effectList || !button.effectList.list || button.effectList.list.length === 0) {
                    errors.push(`Action Button ${index + 1}: At least one effect must be added.`);
                }
            });
        }

        return errors;
    },
    onTriggerEvent: (event) => {
        const { effect, trigger } = event;

        let messageId: string;
        if (effect.useCustomMessageId) {
            messageId = effect.messageId;
        } else if (trigger.metadata && trigger.metadata.chatMessage) {
            messageId = trigger.metadata.chatMessage.id;
        }

        if (!messageId) {
            logger.warn("No message ID available for action button");
            return false;
        }

        const buttonData = actionButtonManager.processActionButtons(
            effect.actionButtons,
            messageId,
            trigger
        );

        logger.debug(`Sending AddActionButtons update for message ${messageId} with ${buttonData.length} button(s)`);
        frontendCommunicator.send("chatUpdate", {
            fbEvent: "AddActionButtons",
            messageId: messageId,
            actionButtons: buttonData
        });

        return true;
    }
};

export = effect;
