"use strict";
(function() {
    angular
        .module('firebotApp')
        .component("customChatPanel", {
            bindings: {
                componentName: "<",
                componentData: "<"
            },
            template: `
                <div class="custom-chat-panel">
                    <dynamic-component
                        ng-if="$ctrl.componentExists"
                        component-name="{{$ctrl.componentName}}"
                        component-data="$ctrl.componentData">
                    </dynamic-component>
                </div>
            `,
            controller: function(logger) {
                const $ctrl = this;

                $ctrl.$onInit = function() {
                    if (!$ctrl.componentName) {
                        logger.error("custom-chat-panel: componentName is required");
                        $ctrl.componentExists = false;
                        return;
                    }

                    $ctrl.componentExists = true;
                    logger.debug(`custom-chat-panel: Rendering component '${$ctrl.componentName}'`);
                };
            }
        });
}());
