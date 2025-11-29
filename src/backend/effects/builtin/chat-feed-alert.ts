import { EffectType } from '../../../types/effects';
import frontendCommunicator from '../../common/frontend-communicator';
import { randomUUID } from 'crypto';
import { actionButtonManager } from '../../chat/action-button-manager';
import { ActionButtonDefinition } from '../../../types/action-buttons';

const effect: EffectType<{
    message: string;
    icon: string;
    addActionButtons?: boolean;
    actionButtons?: ActionButtonDefinition[];
}> = {
    definition: {
        id: "firebot:chat-feed-alert",
        name: "Chat Feed Alert",
        description: "Display an alert in Firebot's chat feed",
        icon: "fad fa-exclamation-circle",
        categories: ["common", "dashboard", "chat based"],
        dependencies: []
    },
    optionsTemplate: `
    <eos-container>
        <p>Use this effect to send yourself alerts in Firebot's chat feed without using actual chat messages. This means the alerts are only visible to you.</p>
    </eos-container>
    <eos-container header="Alert Message" pad-top="true">
        <firebot-input
            model="effect.message"
            use-text-area="true"
            placeholder-text="Enter message"
            rows="4"
            cols="40"
            menu-position="under"
        />
    </eos-container>
    <eos-container header="Icon" pad-top="true">
        <input
			maxlength="2"
			type="text"
			class="form-control"
			ng-model="effect.icon"
			icon-picker required
		/>
    </eos-container>

    <eos-container header="Action Buttons" pad-top="true">
        <label class="control-fb control--checkbox"> Add Action Buttons to this Alert
            <input type="checkbox" ng-model="effect.addActionButtons">
            <div class="control__indicator"></div>
        </label>

        <div ng-if="effect.addActionButtons" style="margin-top: 15px;">
            <action-button-list
                model="effect.actionButtons"
                trigger="{{trigger}}"
                trigger-meta="triggerMeta"
                modal-id="{{modalId}}">
            </action-button-list>
        </div>
    </eos-container>
    `,
    optionsController: ($scope) => {
        // Backward compatibility from when the icon was hard-coded
        if ($scope.effect.icon == null || $scope.effect.icon === "") {
            $scope.effect.icon = "fad fa-exclamation-circle";
        }
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.message == null || effect.message === "") {
            errors.push("Alert message can't be blank.");
        }
        if (effect.icon == null || effect.icon === "") {
            errors.push("Icon can't be blank.");
        }
        return errors;
    },
    onTriggerEvent: async (event) => {
        const { effect, trigger } = event;

        const messageId = randomUUID();
        const chatUpdateData: any = {
            fbEvent: "ChatAlert",
            message: effect.message,
            icon: effect.icon,
            messageId: messageId
        };

        if (effect.addActionButtons) {
            actionButtonManager.attachActionButtonsToMessage(
                effect.actionButtons,
                messageId,
                trigger,
                chatUpdateData
            );
        }

        frontendCommunicator.send("chatUpdate", chatUpdateData);
        return true;
    }
};

export = effect;
