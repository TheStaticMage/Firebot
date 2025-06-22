"use strict";

(function() {
    angular.module("firebotApp")
        .component("raidCategoryModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">Raid by Category</h4>
                </div>
                <div class="modal-body">
                    <div class="muted" style="font-size: 13px;text-transform: uppercase;font-weight: 200;">Current Category</div>
                    <div style="font-size: 16px;">{{$ctrl.currentCategory}}</div>
                </div>
                <div class="modal-body">
                    <div class="form-group" style="width: 100%; margin: 0 15px 0 0;">
                        <ui-select ng-model="$ctrl.model" theme="bootstrap" spinner-enabled="true" on-select="$ctrl.onChanges()">
                            <ui-select-match placeholder="{{$ctrl.inputPlaceholder}}">
                                <div>{{$select.selected.displayName}}<span ng-if="$select.selected.displayName.toLowerCase() !== $select.selected.username.toLowerCase()" class="muted" style="vertical-align: bottom;">&nbsp;({{$select.selected.username}})</span></div>
                            </ui-select-match>
                            <ui-select-choices minimum-input-length="1" repeat="channel in $ctrl.channels" style="position:relative;">
                                <div style="height: 35px; display:flex; flex-direction: row; align-items: center;">
                                    <div style="width: 100%">
                                        <div style="float: left; font-weight: 500; font-size: 17px; vertical-align: center;">{{channel.displayName}}</div>
                                        <div style="float: right; font-weight: 200; font-size: 16px; color: #ddd; vertical-align: center;">
                                            <span ng-if="channel.isMature">&#x26A0;&nbsp;</span>
                                            ({{channel.viewers || 0}}) [{{channel.uptimeString || "N/A"}}]
                                        </div>
                                    </div>
                                </div>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" ng-click="$ctrl.dismiss()">Cancel</button>
                    <button type="button" class="btn btn-primary" ng-click="$ctrl.initiate()" ng-disabled="!$ctrl.isActionEnabled">Initiate Raid</button>
                </div>
            `,
            bindings: {
                resolve: "<",
                close: "&",
                dismiss: "&"
            },
            controller: ['ngToast', 'backendCommunicator', function(ngToast, backendCommunicator) {
                const $ctrl = this;

                $ctrl.model = null;
                $ctrl.inputPlaceholder = "Select channel to raid...";
                $ctrl.targetEffectList = 'e846675b-8929-4998-9ca1-995286df8030';
                $ctrl.currentCategoryName = "Loading...";
                $ctrl.currentCategoryId = -1;
                $ctrl.currentCategoryUrl = "";
                $ctrl.channels = [];
                $ctrl.isActionEnabled = false;
                $ctrl.defaultAvatar = "";

                $ctrl.onChanges = function () {
                    if ($ctrl.model && $ctrl.model.username) {
                        $ctrl.isActionEnabled = $ctrl.model.username.trim().length > 0;
                    } else {
                        $ctrl.isActionEnabled = false;
                    }
                };

                $ctrl.$onInit = function () {
                    if ($ctrl.resolve.model) {
                        $ctrl.model = $ctrl.resolve.model;
                    }

                    if ($ctrl.resolve.targetEffectList) {
                        $ctrl.targetEffectList = $ctrl.resolve.targetEffectList;
                    }

                    backendCommunicator.fireEventAsync("get-channel-info")
                        .then((channelInfo) => {
                            if (channelInfo && channelInfo.gameId) {
                                $ctrl.currentCategoryId = channelInfo.gameId;

                                backendCommunicator.fireEventAsync("get-twitch-game", $ctrl.currentCategoryId)
                                    .then((gameInfo) => {
                                        if (gameInfo && gameInfo.name) {
                                            $ctrl.currentCategoryName = gameInfo.name;
                                            $ctrl.currentCategoryUrl = gameInfo.boxArtUrl.replace("{width}", "30").replace("{height}", "30");
                                        } else {
                                            $ctrl.currentCategoryName = `Unknown Category (#${channelInfo.gameId})`;
                                        }
                                        $ctrl.currentCategory = $ctrl.currentCategoryName;
                                    });

                                backendCommunicator.fireEventAsync("search-twitch-channels-in-same-category", $ctrl.currentCategoryId, false)
                                    .then((channels) => {
                                        if (channels != null) {
                                            if (channels.length === 0) {
                                                ngToast.create({
                                                    className: 'danger',
                                                    content: 'No live channels found in the current category.'
                                                });
                                                return;
                                            }

                                            channels.sort((a, b) => a.username.localeCompare(b.username));
                                            channels.forEach((channel) => {
                                                if (typeof channel.uptime === 'number' && channel.uptime > 0) {
                                                    const hours = Math.floor(channel.uptime / 3600);
                                                    const minutes = Math.floor((channel.uptime % 3600) / 60);
                                                    const parts = [];
                                                    if (hours > 0) {
                                                        parts.push(`${hours}h`);
                                                    }
                                                    if (minutes > 0 || hours === 0) {
                                                        parts.push(`${minutes}m`);
                                                    }
                                                    channel.uptimeString = parts.join('');
                                                } else {
                                                    channel.uptimeString = "N/A";
                                                }
                                            });
                                            $ctrl.channels = channels;
                                        }
                                    });
                            } else {
                                ngToast.create({
                                    className: 'danger',
                                    content: `Could not retrieve current category information.`
                                });
                            }
                        });
                };

                $ctrl.initiate = () => {
                    if (!$ctrl.model.username || $ctrl.model.username.trim().length < 1) {
                        ngToast.create({
                            className: 'danger',
                            content: `Please select a valid raid target.`
                        });
                        return;
                    }

                    const channel = $ctrl.channels.find(c => c.username === $ctrl.model.username);
                    const args = {
                        targetUsername: $ctrl.model.username,
                        targetUserDisplayName: channel ? channel.displayName : $ctrl.model.username
                    };

                    backendCommunicator.fireEventAsync("run-preset-effect-list", { presetEffectListId: $ctrl.targetEffectList, args });

                    ngToast.create({
                        className: 'success',
                        content: `Triggered preset event list to raid ${$ctrl.model.username}!`
                    });

                    $ctrl.dismiss();
                };
            }]
        });
}());
