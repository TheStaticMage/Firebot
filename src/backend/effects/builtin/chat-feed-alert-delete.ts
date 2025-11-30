import { EffectType } from "../../../types/effects";
import frontendCommunicator from "../../common/frontend-communicator";
import logger from "../../logwrapper";

const effect: EffectType<{
    messageId: string;
}> = {
    definition: {
        id: "firebot:chat-feed-alert-delete",
        name: "Delete Chat Feed Alert",
        description: "Delete a chat feed alert by its message ID",
        icon: "fad fa-trash-alt",
        categories: ["common", "dashboard", "chat based"],
        dependencies: []
    },
    optionsTemplate: `
    <eos-container header="Explanation" pad-top="true">
        <p class="muted">This effect deletes a chat feed alert by its message ID.</p>
        <p class="muted">Use the Message ID output from the Chat Feed Alert effect (e.g., $effectOutput[messageId]).</p>
    </eos-container>
    <eos-container header="Alert Message ID" pad-top="true">
        <firebot-input
            model="effect.messageId"
            placeholder-text="Enter alert message ID (e.g., $effectOutput[messageId])"
        />
    </eos-container>
    `,
    optionsController: () => {
        // No options controller needed for this effect
    },
    optionsValidator: (effect) => {
        const errors: string[] = [];
        if (effect.messageId == null || effect.messageId === "") {
            errors.push("Alert message ID can't be blank.");
        }
        return errors;
    },
    onTriggerEvent: (event) => {
        const { effect } = event;

        try {
            const messageId = effect.messageId;

            if (typeof messageId !== "string" || messageId.length === 0) {
                logger.warn("chat-feed-alert-delete: No messageId provided. Cannot delete alert.");
                return;
            }

            logger.debug("chat-feed-alert-delete: Deleting alert from chat feed: messageId=", messageId);
            frontendCommunicator.send("chatUpdate", {
                fbEvent: "DeleteChatAlert",
                messageId: messageId
            });
        } catch (error) {
            logger.error("chat-feed-alert-delete: Error deleting alert from chat feed: ", error);
        }

        return true;
    }
};

export = effect;
