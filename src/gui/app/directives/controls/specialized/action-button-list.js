"use strict";

(function() {
    angular
        .module('firebotApp')
        .component("actionButtonList", {
            bindings: {
                model: "=",
                trigger: "@",
                triggerMeta: "<",
                modalId: "@",
                onUpdate: "&"
            },
            template: `
                <div ui-sortable="$ctrl.sortableOptions" ng-model="$ctrl.model">
                    <div ng-repeat="button in $ctrl.model track by $index" class="list-item" style="margin-bottom: 10px;">
                        <div style="display: flex; align-items: flex-start;">
                            <span class="dragHandle" style="height: 38px; width: 15px; align-items: center; justify-content: center; display: flex">
                                <i class="fal fa-bars" aria-hidden="true"></i>
                            </span>
                            <div style="flex: 1; margin-left: 10px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <b>Button {{$index + 1}}: {{button.name || 'Unnamed'}}</b>
                                    <div>
                                        <button class="btn btn-sm btn-default" ng-click="$ctrl.duplicateActionButton($index)" style="margin-right: 5px;">
                                            <i class="far fa-clone"></i> Duplicate
                                        </button>
                                        <button class="btn btn-sm btn-danger" ng-click="$ctrl.removeActionButton($index)">
                                            <i class="far fa-trash-alt"></i> Remove
                                        </button>
                                    </div>
                                </div>

                                <firebot-input
                                    input-title="Button Name"
                                    model="button.name"
                                    placeholder-text="Enter button text"
                                />

                                <div style="margin-top: 10px;">
                                    <label style="font-weight: 600; margin-bottom: 5px;">Icon</label>
                                    <input
                                        maxlength="2"
                                        type="text"
                                        class="form-control"
                                        ng-model="button.icon"
                                        icon-picker
                                    />
                                </div>

                                <div style="margin-top: 10px;">
                                    <label style="font-weight: 600; margin-bottom: 5px;">Alignment</label>
                                    <dropdown-select options="['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']" selected="button.alignment"></dropdown-select>
                                </div>

                                <div style="margin-top: 10px;">
                                    <color-picker-input model="button.backgroundColor" label="Background Color" alpha="true"></color-picker-input>
                                </div>

                                <div style="margin-top: 10px;">
                                    <color-picker-input model="button.foregroundColor" label="Foreground Color" alpha="true"></color-picker-input>
                                </div>

                                <div style="margin-top: 10px;">
                                    <firebot-input
                                        input-title="Extra Metadata (JSON)"
                                        model="button.extraMetadata"
                                        use-text-area="true"
                                        placeholder-text='{"key": "value"}'
                                        rows="3"
                                    />
                                </div>

                                <div style="margin-top: 10px;">
                                    <label style="font-weight: 600; margin-bottom: 5px;">Effects to Run When Clicked</label>
                                    <effect-list effects="button.effectList"
                                        trigger="{{$ctrl.trigger}}"
                                        trigger-meta="$ctrl.triggerMeta"
                                        update="$ctrl.buttonEffectListUpdated(effects, $index)"
                                        modalId="{{$ctrl.modalId}}"></effect-list>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="muted" ng-show="$ctrl.model.length < 1">No action buttons added.</p>
                <button class="btn btn-link" ng-click="$ctrl.addActionButton()"><i class="far fa-plus-circle"></i> Add Action Button</button>
            `,
            controller: function() {
                const $ctrl = this;

                $ctrl.$onInit = () => {
                    if ($ctrl.model == null) {
                        $ctrl.model = [];
                    }

                    $ctrl.sortableOptions = {
                        handle: ".dragHandle",
                        stop: () => {}
                    };
                };

                $ctrl.addActionButton = () => {
                    const { randomUUID } = require('crypto');
                    $ctrl.model.push({
                        name: "",
                        backgroundColor: "#3b82f6",
                        foregroundColor: "#ffffff",
                        icon: "fad fa-hand-pointer",
                        alignment: "top-left",
                        effectList: {
                            id: randomUUID(),
                            list: [],
                            queue: null,
                            queueDuration: null,
                            runMode: "sequential"
                        },
                        extraMetadata: ""
                    });
                };

                $ctrl.removeActionButton = (index) => {
                    $ctrl.model.splice(index, 1);
                };

                $ctrl.duplicateActionButton = (index) => {
                    const { randomUUID } = require('crypto');
                    const original = $ctrl.model[index];
                    const duplicate = JSON.parse(JSON.stringify(original));
                    if (duplicate.effectList) {
                        duplicate.effectList.id = randomUUID();
                    }
                    $ctrl.model.splice(index + 1, 0, duplicate);
                };

                $ctrl.buttonEffectListUpdated = (effects, index) => {
                    $ctrl.model[index].effectList = effects;
                };
            }
        });
}());
