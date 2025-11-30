import { randomUUID } from "crypto";
import frontendCommunicator from "../common/frontend-communicator";
import logger from "../logwrapper";

interface InjectPanelData {
    componentName: string;
    componentData?: unknown;
    position?: string | { afterMessageId: string } | { beforeMessageId: string };
    panelId?: string;
    hidden?: boolean;
}

interface UpdatePanelData {
    panelId: string;
    updates: {
        hidden?: boolean;
        componentData?: unknown;
    };
}

class CustomChatPanelManager {
    injectPanel(data: InjectPanelData): void {
        if (!data.componentName) {
            logger.warn("Cannot inject chat panel: componentName is required");
            return;
        }

        const panelId = data.panelId || randomUUID();

        const payload = {
            fbEvent: "InjectCustomPanel",
            componentName: data.componentName,
            componentData: data.componentData,
            position: data.position || "append",
            panelId: panelId,
            hidden: data.hidden
        };

        logger.debug("Injecting custom chat panel", { componentName: data.componentName, panelId });
        frontendCommunicator.send("chatUpdate", payload);
    }

    updatePanel(data: UpdatePanelData): void {
        if (!data.panelId) {
            logger.warn("Cannot update chat panel: panelId is required");
            return;
        }

        if (!data.updates || (data.updates.hidden === undefined && data.updates.componentData === undefined)) {
            logger.warn("Cannot update chat panel: no updates provided");
            return;
        }

        const payload = {
            fbEvent: "UpdateCustomPanel",
            panelId: data.panelId,
            updates: data.updates
        };

        logger.debug("Updating custom chat panel", { panelId: data.panelId, updates: data.updates });
        frontendCommunicator.send("chatUpdate", payload);
    }

    removePanel(panelId: string): void {
        if (!panelId) {
            logger.warn("Cannot remove chat panel: panelId is required");
            return;
        }

        logger.debug("Removing custom chat panel", { panelId });
        frontendCommunicator.send("chatUpdate", {
            fbEvent: "RemoveCustomPanel",
            panelId: panelId
        });
    }

    setupListeners(): void {
        logger.debug("Setting up custom chat panel IPC listeners");

        // eslint-disable-next-line @typescript-eslint/require-await
        frontendCommunicator.onAsync("firebot:inject-chat-panel", async (data: InjectPanelData) => {
            this.injectPanel(data);
        });

        // eslint-disable-next-line @typescript-eslint/require-await
        frontendCommunicator.onAsync("firebot:remove-chat-panel", async (panelId: string) => {
            this.removePanel(panelId);
        });

        // eslint-disable-next-line @typescript-eslint/require-await
        frontendCommunicator.onAsync("firebot:update-chat-panel", async (data: UpdatePanelData) => {
            this.updatePanel(data);
        });
    }
}

const customChatPanelManager = new CustomChatPanelManager();

export default customChatPanelManager;
