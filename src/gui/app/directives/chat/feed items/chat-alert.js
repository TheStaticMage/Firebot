"use strict";
(function() {
    const { marked } = require("marked");
    const { sanitize } = require("dompurify");

    angular
        .module('firebotApp')
        .component("chatAlert", {
            bindings: {
                alertId: "<",
                alertMessage: "<",
                alertIcon: "<",
                actionButtons: "<"
            },
            template: `
                <div class="chat-alert-wrapper">
                    <action-buttons-display position="top" message-id="$ctrl.alertId" action-buttons="$ctrl.actionButtons"></action-buttons-display>
                    <div class="chat-alert">
                        <span style="font-size:25px;margin-right: 10px;"><i ng-class="$ctrl.iconClass"></i></span>
                        <span style="margin: auto 0;" ng-bind-html="$ctrl.message"></span>
                    </div>
                    <action-buttons-display position="bottom" message-id="$ctrl.alertId" action-buttons="$ctrl.actionButtons"></action-buttons-display>
                </div>
            `,
            controller: function() {
                const $ctrl = this;

                $ctrl.iconClass = "";
                $ctrl.message = "No message";

                const init = () => {
                    if ($ctrl.alertMessage) {
                        $ctrl.message = sanitize(marked.parseInline($ctrl.alertMessage));
                    }

                    let icon = $ctrl.alertIcon;
                    if (!icon) {
                        icon = "fad fa-exclamation-circle";
                    }

                    const classes = icon.split(" ");
                    if (classes.length === 1) {
                        $ctrl.iconClass = `far ${classes[0]}`;
                    } else {
                        $ctrl.iconClass = classes.join(" ");
                    }
                };

                $ctrl.$onInit = init;
            }
        });
}());
