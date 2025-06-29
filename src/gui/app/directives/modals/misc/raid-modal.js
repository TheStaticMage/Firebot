"use strict";

(function() {
    angular.module("firebotApp")
        .component("raidModal", {
            template: `
                <div class="modal-header">
                    <button type="button" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
                    <h4 class="modal-title">Raid</h4>
                </div>
                <div class="modal-body" style="display: flex; flex-direction: column;">
                    <h3>Select Target</h3>
                    <dropdown-select options="$ctrl.targetTypeOptions" selected="$ctrl.selectTargetType" on-update="$ctrl.onTargetTypeChange()"></dropdown-select>

                    <div ng-if="$ctrl.selectTargetType === 'category'" class="mt-8" style="width: 100%; display: block;">
                        <div>
                            <div class="muted" style="font-size: 13px; text-transform: uppercase; font-weight: 200;">Current Category</div>
                            <div style="font-size: 16px;">{{$ctrl.currentCategoryName}}</div>
                        </div>
                    </div>

                    <div class="form-group" ng-class="{'has-error': $ctrl.hasValidationError}" style="width: 100%; margin-top: 15px;" ng-if="$ctrl.selectTargetType === 'username'">
                        <ui-select ng-model="$ctrl.model" theme="bootstrap" spinner-enabled="true" on-select="$ctrl.viewerSelected()">
                            <ui-select-match placeholder="{{$ctrl.inputPlaceholder}}">
                                <div>{{$select.selected.displayName}}<span ng-if="$select.selected.displayName.toLowerCase() !== $select.selected.username.toLowerCase()" class="muted" style="vertical-align: bottom;">&nbsp;({{$select.selected.username}})</span></div>
                            </ui-select-match>
                            <ui-select-choices minimum-input-length="1" repeat="channel in $ctrl.channels | filter: $select.search" refresh="$ctrl.searchForChannels($select.search)" refresh-delay="400" style="position:relative;">
                                <div style="height: 35px; display:flex; flex-direction: row; align-items: center;">
                                    <img style="height: 30px; width: 30px; border-radius: 5px; margin-right:10px;" ng-src="{{channel.avatarUrl || $ctrl.defaultAvatar}}">
                                    <div ng-style="channel.isLive && {'font-weight': 500} || {'font-weight': 100, 'text-decoration': 'line-through'}" style="font-size: 17px;">
                                        {{channel.displayName}}
                                        <span ng-if="channel.displayName.toLowerCase() !== channel.username.toLowerCase()" class="muted"> ({{channel.username}})</span>
                                    </div>
                                </div>
                            </ui-select-choices>
                        </ui-select>
                        <span id="helpBlock" class="help-block" ng-show="$ctrl.hasValidationError">{{$ctrl.validationText}}</span>
                    </div>

                    <div class="form-group" style="width: 100%; margin-top: 15px; display: block;" ng-if="$ctrl.selectTargetType === 'category' || $ctrl.selectTargetType === 'followed'">
                        <ui-select ng-model="$ctrl.model" theme="bootstrap" spinner-enabled="true" on-select="$ctrl.viewerSelected()">
                            <ui-select-match placeholder="{{$ctrl.channels.length == 0 ? 'Loading channels...' : $ctrl.inputPlaceholder}}">
                                <div>{{$select.selected.displayName}}<span ng-if="$select.selected.displayName.toLowerCase() !== $select.selected.username.toLowerCase()" class="muted" style="vertical-align: bottom;">&nbsp;({{$select.selected.username}})</span></div>
                            </ui-select-match>
                            <ui-select-choices minimum-input-length="1" repeat="channel in $ctrl.channels" style="position:relative;">
                                <div style="padding: 5px; border-bottom: 1px solid #ddd; cursor: pointer; width: 100%; display: block; box-sizing: border-box;">
                                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                                        <div style="font-weight: 500; font-size: 17px;">
                                            {{channel.displayName}}
                                        </div>
                                        <div style="font-weight: 200; font-size: 16px; color: #ddd;">
                                            <span ng-if="channel.isMature">&#x26A0;&nbsp;</span>
                                            ({{channel.viewers || 0}}) [{{channel.uptimeString || "N/A"}}]
                                        </div>
                                    </div>
                                    <div style="width: 100%; display: flex; justify-content: space-between; align-items: center;">
                                        <div style="font-weight: 200; font-size: 14px; color: #aaa;">
                                            <span ng-if="channel.gameName">{{channel.gameName}}</span>
                                            <span ng-if="!channel.gameName">No Game</span>
                                        </div>
                                        <div style="font-weight: 200; font-size: 14px; color: #aaa;">
                                            <span ng-if="channel.language">{{channel.language}}</span>
                                            <span ng-if="!channel.language">No Language</span>
                                        </div>
                                    </div>
                                </div>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; justify-content: flex-end;">
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
                $ctrl.inputPlaceholder = "Start typing the username...";
                $ctrl.currentCategoryName = "Loading...";
                $ctrl.currentCategoryId = -1;
                $ctrl.currentCategoryUrl = "";
                $ctrl.channels = [];
                $ctrl.hasValidationError = false;
                $ctrl.validationText = "";
                $ctrl.isActionEnabled = false;
                $ctrl.selectTargetType = "category";
                $ctrl.targetTypeOptions = { category: 'Same Category', followed: 'Followed Channels', username: 'Username' };

                $ctrl.viewerSelected = function () {
                    $ctrl.isActionEnabled = false;

                    if (!$ctrl.model || !$ctrl.model.username) {
                        return;
                    }

                    const channel = $ctrl.channels.find(c => c.username === $ctrl.model.username);
                    if (!channel) {
                        $ctrl.hasValidationError = true;
                        $ctrl.validationText = `The selected channel is not valid.`;
                        return;
                    }

                    if (!channel.isLive) {
                        $ctrl.hasValidationError = true;
                        $ctrl.validationText = `The channel ${channel.displayName} is not currently live.`;
                        return;
                    }

                    $ctrl.isActionEnabled = true;
                    $ctrl.hasValidationError = false;
                };

                $ctrl.onTargetTypeChange = function () {
                    $ctrl.channels = [];
                    $ctrl.isActionEnabled = false;
                    $ctrl.model = null;

                    switch ($ctrl.selectTargetType) {
                        case "username":
                            $ctrl.inputPlaceholder = "Start typing the username...";
                            break;
                        case "category":
                            $ctrl.inputPlaceholder = "Select channel to raid...";
                            $ctrl.populateChannelsByCategory();
                            break;
                        case "followed":
                            $ctrl.inputPlaceholder = "Select channel to raid...";
                            $ctrl.populateChannelsByFollowed();
                            break;
                        default:
                            ngToast.create({
                                className: 'danger',
                                content: `Invalid target type selected.`
                            });
                            break;
                    }
                };

                $ctrl.formatUptime = function(uptime) {
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    const parts = [];
                    if (hours > 0) {
                        parts.push(`${hours}h`);
                    }
                    if (minutes > 0 || hours === 0) {
                        parts.push(`${minutes}m`);
                    }
                    return parts.join('');
                };

                $ctrl.sortAndFormatChannels = function (channels) {
                    if (!channels || channels.length === 0) {
                        ngToast.create({
                            className: 'danger',
                            content: 'No channels found.'
                        });
                        return [];
                    }

                    channels.sort((a, b) => {
                        if (a.isLive === b.isLive) {
                            return a.username.localeCompare(b.username);
                        }
                        return a.isLive ? -1 : 1;
                    });

                    channels.forEach((channel) => {
                        if (typeof channel.uptime === 'number' && channel.uptime > 0) {
                            channel.uptimeString = $ctrl.formatUptime(channel.uptime);
                        } else {
                            channel.uptimeString = "N/A";
                        }
                    });

                    return channels;
                };

                $ctrl.searchForChannels = function(query) {
                    if (query == null || query.trim() === "" || query.trim().length < 3) {
                        return;
                    }
                    backendCommunicator.fireEventAsync("search-twitch-channels", query)
                        .then(channels => {
                            $ctrl.channels = $ctrl.sortAndFormatChannels(channels);
                        });
                };

                $ctrl.populateChannelsByCategory = function () {
                    if ($ctrl.currentCategoryId === -1) {
                        ngToast.create({
                            className: 'danger',
                            content: 'Your current category is not known. Raid by category not possible.'
                        });
                        return;
                    }

                    $ctrl.channels = [];
                    $ctrl.isActionEnabled = false;
                    const filter = { game: $ctrl.currentCategoryId.toString() };

                    backendCommunicator.fireEventAsync("get-streams", filter, false)
                        .then((channels) => {
                            $ctrl.channels = $ctrl.sortAndFormatChannels(channels);
                            if ($ctrl.channels.length > 0) {
                                $ctrl.inputPlaceholder = "Select channel to raid...";
                            } else {
                                $ctrl.inputPlaceholder = "No channels found in this category.";
                            }
                        });
                };

                $ctrl.populateChannelsByFollowed = function () {
                    $ctrl.channels = [];
                    $ctrl.isActionEnabled = false;

                    backendCommunicator.fireEventAsync("get-followed-streams")
                        .then((channels) => {
                            $ctrl.channels = $ctrl.sortAndFormatChannels(channels);
                            if ($ctrl.channels.length > 0) {
                                $ctrl.inputPlaceholder = "Select channel to raid...";
                            } else {
                                $ctrl.inputPlaceholder = "No followed channels are online.";
                            }
                        });
                };

                $ctrl.$onInit = function () {
                    if ($ctrl.resolve.model) {
                        $ctrl.model = $ctrl.resolve.model;
                    }

                    // Prefetch the category and game information
                    backendCommunicator.fireEventAsync("get-channel-info")
                        .then((channelInfo) => {
                            if (channelInfo && channelInfo.gameId) {
                                $ctrl.currentCategoryId = channelInfo.gameId;
                                $ctrl.onTargetTypeChange(); // To load by category

                                backendCommunicator.fireEventAsync("get-twitch-game", $ctrl.currentCategoryId)
                                    .then((gameInfo) => {
                                        if (gameInfo && gameInfo.name) {
                                            $ctrl.currentCategoryName = gameInfo.name;
                                        } else {
                                            $ctrl.currentCategoryName = `Unknown Category (#${channelInfo.gameId})`;
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

                    const channel = $ctrl.channels.find(c => c.username === $ctrl.model.username.trim());
                    if (!channel || !channel.isLive) {
                        ngToast.create({
                            className: 'danger',
                            content: `The selected channel is not valid or not live.`
                        });
                        return;
                    }

                    backendCommunicator.fireEventAsync("triggerQuickAction", {
                        quickActionId: "firebot:raid",
                        isInitialClick: false,
                        args: { username: channel.username, userDisplayName: channel.displayName }
                    })
                        .then(() => {
                            ngToast.create({
                                className: 'success',
                                content: `Raid initiated to ${channel.displayName}!`
                            });
                        })
                        .catch((error) => {
                            ngToast.create({
                                className: 'danger',
                                content: `Failed to initiate raid: ${error.message || error}`
                            });
                        });

                    $ctrl.dismiss();
                };
            }]
        });
}());
