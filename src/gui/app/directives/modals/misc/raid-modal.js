"use strict";

(function() {
    angular.module("firebotApp")
        .component("raidModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">Raid</h4>
                </div>
                <div class="modal-body">
                    <form name="raidInfo">
                        <div class="form-group">
                            <label for="targetUsername" class="control-label">Raid Target</label>
                            <select
                                id="targetUsername"
                                name="targetUsername"
                                required
                                class="fb-select form-control input-lg"
                                ng-model="$ctrl.raidInfo.username"
                                ng-options="u.id as u.name for u in $ctrl.targetUsernames"
                                ng-init="$ctrl.raidInfo.username = ''">
                                <option value="" disabled selected hidden>Select target...</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">Cancel</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.initiate()">Initiate Raid</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: ['ngToast', 'backendCommunicator', function(ngToast, backendCommunicator) {
                const $ctrl = this;

                $ctrl.targetUsernames = [
                    { id: "akaspudtopped", name: "AKASpudTopped" },
                    { id: "cosmiccowboyyt", name: "CosmicCowboyYT" },
                    { id: "digitallic", name: "digitallic" },
                    { id: "faceless3791", name: "faceless3791" },
                    { id: "gamble_07", name: "gamble_07" },
                    { id: "harlowrisk", name: "HarlowRisk" },
                    { id: "jjbruhh_", name: "JJbruhh_" },
                    { id: "jpizzle925", name: "jpizzle925" },
                    { id: "mallorielynne", name: "mallorielynne" },
                    { id: "nateikustherican", name: "nateikustherican" },
                    { id: "nordic_noob", name: "Nordic_Noob" },
                    { id: "puddle_jam", name: "Puddle_Jam" },
                    { id: "riskyfil", name: "riskyfil" },
                    { id: "spinseeker_risk", name: "spinseeker_risk" },
                    { id: "thekillpetestrategy", name: "TheKillPeteStrategy" },
                    { id: "theorionprime", name: "theorionprime" },
                    { id: "thestaticbrock", name: "TheStaticBrock" },
                    { id: "thestaticmage", name: "TheStaticMage" },
                    { id: "trendywiz23", name: "TrendyWiz23" },
                    { id: "typicalxkiefer", name: "TypicalxKiefer" },
                    { id: "victimofisolationdecay", name: "VictimOfIsolationDecay" },
                    { id: "youthrebellion", name: "YouthRebelLion" },
                    { id: "zango_bango", name: "Zango_Bango" },
                    { id: "zugzug219", name: "ZugZug219" }
                ];
                $ctrl.targetUsernames.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

                $ctrl.targetEffectList = 'e846675b-8929-4998-9ca1-995286df8030';

                $ctrl.raidInfo = {
                    username: ""
                };

                $ctrl.$onInit = () => {};

                $ctrl.initiate = () => {
                    if (!$ctrl.raidInfo.username || $ctrl.raidInfo.username.trim().length < 1) {
                        ngToast.create({
                            className: 'danger',
                            content: `Please select a valid raid target.`
                        });
                        return;
                    }

                    const args = {
                        targetUsername: $ctrl.raidInfo.username,
                        targetUserDisplayName: $ctrl.targetUsernames.find(u => u.id === $ctrl.raidInfo.username).name
                    };

                    backendCommunicator.fireEventAsync("run-preset-effect-list", { presetEffectListId: $ctrl.targetEffectList, args });

                    ngToast.create({
                        className: 'success',
                        content: `Triggered preset event list to raid ${$ctrl.raidInfo.username}!`
                    });

                    $ctrl.dismiss();
                };
            }]
        });
}());
