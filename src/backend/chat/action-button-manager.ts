import { randomUUID } from "crypto";
import frontendCommunicator from "../common/frontend-communicator";
import logger from "../logwrapper";
import { ActionButtonDefinition, ActionButtonDisplay } from "../../types/action-buttons";

interface ActionButtonConfig {
    uuid: string;
    messageId: string;
    buttonName: string;
    effectList: any;
    trigger: any;
    timestamp: number;
    extraMetadata?: Record<string, any>;
}

class ActionButtonManager {
    private buttonStore: Map<string, ActionButtonConfig> = new Map();

    registerButton(config: ActionButtonConfig): void {
        this.buttonStore.set(config.uuid, config);
        logger.debug(`Registered action button ${config.uuid} for message ${config.messageId}`);
    }

    processActionButtons(
        buttons: ActionButtonDefinition[],
        messageId: string,
        trigger: any
    ): ActionButtonDisplay[] {
        logger.debug(`Processing ${buttons.length} action button(s) for message ${messageId}`);
        const buttonData: ActionButtonDisplay[] = [];

        for (const btn of buttons) {
            const uuid = randomUUID();

            let parsedExtraMetadata;
            if (btn.extraMetadata) {
                try {
                    parsedExtraMetadata = JSON.parse(btn.extraMetadata);
                } catch (e) {
                    logger.warn("Invalid JSON in action button extra metadata", e);
                }
            }

            this.registerButton({
                uuid: uuid,
                messageId: messageId,
                buttonName: btn.name,
                effectList: btn.effectList,
                trigger: trigger,
                timestamp: Date.now(),
                extraMetadata: parsedExtraMetadata
            });

            logger.debug(`Prepared action button display data for ${uuid} (${btn.name}) aligned ${btn.alignment}`);
            buttonData.push({
                uuid: uuid,
                name: btn.name,
                backgroundColor: btn.backgroundColor,
                foregroundColor: btn.foregroundColor,
                icon: btn.icon,
                alignment: btn.alignment
            });
        }

        logger.debug(`Finished processing action buttons for message ${messageId}, total sent: ${buttonData.length}`);
        return buttonData;
    }

    attachActionButtonsToMessage(
        buttons: ActionButtonDefinition[] | undefined,
        messageId: string,
        trigger: any,
        chatUpdateData: any
    ): void {
        if (buttons && buttons.length > 0) {
            const buttonData = this.processActionButtons(buttons, messageId, trigger);
            if (buttonData.length > 0) {
                chatUpdateData.actionButtons = buttonData;
            }
        }
    }

    async executeButton(uuid: string): Promise<void> {
        const config = this.buttonStore.get(uuid);
        if (!config) {
            logger.warn(`Action button ${uuid} not found`);
            return;
        }

        logger.debug(`Executing action button ${uuid}`);

        const actionButtonMetadata: any = {
            clicked: true,
            uuid: uuid,
            buttonName: config.buttonName
        };

        if (config.extraMetadata) {
            actionButtonMetadata.extraMetadata = config.extraMetadata;
        }

        const enhancedTrigger = {
            ...config.trigger,
            metadata: {
                ...config.trigger.metadata,
                actionButton: actionButtonMetadata
            }
        };

        const effectRunner = require("../common/effect-runner");
        await effectRunner.processEffects({
            trigger: enhancedTrigger,
            effects: config.effectList
        });
    }

    removeButton(uuid: string): void {
        this.buttonStore.delete(uuid);
        logger.debug(`Removed action button ${uuid}`);
    }

    setupIpcHandlers(): void {
        frontendCommunicator.onAsync("action-button:click", async (uuid: string) => {
            await this.executeButton(uuid);
        });
    }
}

export const actionButtonManager = new ActionButtonManager();
actionButtonManager.setupIpcHandlers();
