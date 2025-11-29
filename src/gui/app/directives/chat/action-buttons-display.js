"use strict";

(function() {
    angular
        .module('firebotApp')
        .component("actionButtonsDisplay", {
            bindings: {
                messageId: "<",
                actionButtons: "<",
                position: "@?"
            },
            template: `
                <div ng-if="$ctrl.hasButtons" class="action-buttons-wrapper">
                    <div class="action-buttons-row top" ng-if="$ctrl.showTopRow && $ctrl.topButtons.length">
                        <div ng-repeat="group in $ctrl.topButtons"
                             class="action-button-group"
                             ng-class="'action-button-group-' + group.alignment.replace('-', '_')">
                            <div ng-repeat="button in group.buttons"
                                 class="action-button"
                                 ng-click="$ctrl.onButtonClick(button)"
                                 ng-style="{
                                     'background-color': button.backgroundColor,
                                     'color': button.foregroundColor
                                 }">
                                <i ng-class="button.icon"></i>
                                <span>{{button.name}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="action-buttons-row bottom" ng-if="$ctrl.showBottomRow && $ctrl.bottomButtons.length">
                        <div ng-repeat="group in $ctrl.bottomButtons"
                             class="action-button-group"
                             ng-class="'action-button-group-' + group.alignment.replace('-', '_')">
                            <div ng-repeat="button in group.buttons"
                                 class="action-button"
                                 ng-click="$ctrl.onButtonClick(button)"
                                 ng-style="{
                                     'background-color': button.backgroundColor,
                                     'color': button.foregroundColor
                                 }">
                                <i ng-class="button.icon"></i>
                                <span>{{button.name}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            controller: function(chatMessagesService, $scope) {
                const $ctrl = this;

                const topAlignments = ["top-left", "top-center", "top-right"];
                const bottomAlignments = ["bottom-left", "bottom-center", "bottom-right"];

                const groupButtons = () => {
                    const topGroups = [];
                    const bottomGroups = [];
                    const visibleButtons = Array.isArray($ctrl.actionButtons)
                        ? $ctrl.actionButtons.filter(b => b && b.hidden !== true)
                        : [];

                    const addToGroups = (list, alignments, target) => {
                        alignments.forEach((alignment) => {
                            const buttonsForAlignment = list.filter(b => (b.alignment || "top-left") === alignment);
                            if (buttonsForAlignment.length > 0) {
                                target.push({ alignment, buttons: buttonsForAlignment });
                            }
                        });
                    };

                    addToGroups(visibleButtons, topAlignments, topGroups);
                    addToGroups(visibleButtons, bottomAlignments, bottomGroups);

                    $ctrl.topButtons = topGroups;
                    $ctrl.bottomButtons = bottomGroups;
                    $ctrl.hasButtons = topGroups.length > 0 || bottomGroups.length > 0;
                    const pos = ($ctrl.position || "both").toLowerCase();
                    $ctrl.showTopRow = pos === "top" || pos === "both";
                    $ctrl.showBottomRow = pos === "bottom" || pos === "both";
                };

                $ctrl.onButtonClick = function(button) {
                    chatMessagesService.handleActionButtonClick($ctrl.messageId, button.uuid);
                };

                $ctrl.$onInit = groupButtons;
                $ctrl.$onChanges = groupButtons;
                $scope.$watch(() => $ctrl.actionButtons, groupButtons, true);
            }
        });
}());
