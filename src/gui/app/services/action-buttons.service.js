"use strict";
(function() {
    angular
        .module('firebotApp')
        .factory('actionButtonsService', function(logger, backendCommunicator) {
            const service = {};

            // Pending action buttons for messages not yet in the chat queue
            const pendingActionButtons = new Map();
            let pendingCleanupId = null;
            const PENDING_TTL = 30000;

            const schedulePendingCleanup = () => {
                if (pendingCleanupId != null) {
                    return;
                }
                pendingCleanupId = setTimeout(() => {
                    const now = Date.now();
                    for (const [messageId, pending] of pendingActionButtons.entries()) {
                        if (now - pending.timestamp > PENDING_TTL) {
                            logger.debug(`Removing expired pending action buttons for message ${messageId}`);
                            pendingActionButtons.delete(messageId);
                        }
                    }
                    pendingCleanupId = null;
                    if (pendingActionButtons.size > 0) {
                        schedulePendingCleanup();
                    }
                }, PENDING_TTL);
            };

            const findChatItem = (chatQueue, messageId) => chatQueue.find((item) => {
                if (item.type === "alert") {
                    return item.id === messageId;
                } else if (item.type === "message") {
                    return item.data.id === messageId;
                }
                return false;
            });

            const attachActionButtons = (chatItem, actionButtons) => {
                let targetActionButtons;
                if (chatItem.type === "alert") {
                    chatItem.actionButtons = chatItem.actionButtons || [];
                    targetActionButtons = chatItem.actionButtons;
                } else if (chatItem.type === "message") {
                    chatItem.data.actionButtons = chatItem.data.actionButtons || [];
                    targetActionButtons = chatItem.data.actionButtons;
                }

                if (targetActionButtons) {
                    targetActionButtons.push(...actionButtons);
                    return true;
                }
                return false;
            };

            /**
             * Add action buttons to an existing message (alert or chat message)
             * @param {Array} chatQueue - The chat queue array
             * @param {string} messageId - The ID of the message to add buttons to
             * @param {Array} actionButtons - Array of action button definitions
             */
            service.addActionButtonsToMessage = function(chatQueue, messageId, actionButtons) {
                const chatItem = findChatItem(chatQueue, messageId);

                if (!chatItem) {
                    logger.debug(`Message ${messageId} not yet in chat queue, adding action buttons to pending`);
                    pendingActionButtons.set(messageId, {
                        actionButtons: actionButtons,
                        timestamp: Date.now()
                    });
                    schedulePendingCleanup();
                    return;
                }

                attachActionButtons(chatItem, actionButtons);
            };

            /**
             * Apply pending action buttons to a message once it exists in the queue
             * @param {Array} chatQueue - The chat queue array
             * @param {string} messageId - The ID of the message
             */
            service.applyPendingActionButtons = function(chatQueue, messageId) {
                const pending = pendingActionButtons.get(messageId);
                if (!pending) {
                    return;
                }

                const chatItem = findChatItem(chatQueue, messageId);
                if (!chatItem) {
                    return;
                }

                if (attachActionButtons(chatItem, pending.actionButtons)) {
                    pendingActionButtons.delete(messageId);
                }
            };

            /**
             * Hide all action buttons on a message
             * @param {Array} chatQueue - The chat queue array
             * @param {string} messageId - The ID of the message
             */
            service.hideActionButtons = function(chatQueue, messageId) {
                const chatItem = chatQueue.find(item =>
                    item.id === messageId ||
                    (item.type === "message" && item.data && item.data.id === messageId)
                );

                if (!chatItem) {
                    return;
                }

                const actionButtons = chatItem.actionButtons || (chatItem.data ? chatItem.data.actionButtons : null);
                if (actionButtons) {
                    actionButtons.forEach(btn => btn.hidden = true);
                    // Replace arrays to trigger watchers on nested updates
                    if (chatItem.actionButtons) {
                        chatItem.actionButtons = [...actionButtons];
                    }
                    if (chatItem.data && chatItem.data.actionButtons) {
                        chatItem.data.actionButtons = [...actionButtons];
                    }
                }
            };

            /**
             * Handle an action button click - hide buttons and notify backend
             * @param {Array} chatQueue - The chat queue array
             * @param {string} messageId - The ID of the message
             * @param {string} buttonUuid - The UUID of the button that was clicked
             */
            service.handleActionButtonClick = function(chatQueue, messageId, buttonUuid) {
                service.hideActionButtons(chatQueue, messageId);
                backendCommunicator.fireEventAsync("action-button:click", buttonUuid);
            };

            return service;
        });
}());
