"use strict";

(function() {
    angular.module("firebotApp").component("aboutModal", {
        template: `
            <style>
                #aboutModalHeaderDismissButton {
                    z-index: 10;
                }

                #aboutModalBody > section + section {
                    margin-top: 2em;
                }

                #aboutModalSocialButtons {
                    width: 150px;
                    margin: auto;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 28px;
                }

                #aboutModalSocialButtons .bluesky {
                    display: inline-block;
                    height: 27px;
                    width: 30px;
                    line-height: 28px;
                    background-color: #12d0ff;
                    mask-image: url('../images/icons/bluesky.png');
                    mask-position: center;
                    mask-size: 100% 100%;
                }

                h1 {
                    text-transform: capitalize;
                    font-weight: 900;
                    color: transparent;
                    font-family: "LEMONMILK-Bold", "Inter", sans-serif;
                    -webkit-background-clip: text;
                    background-clip: text;
                    background-image: linear-gradient(to right, #ebb11f, #FFCA05);
                }

                .about-version-list {
                    display: flex;
                    flex-direction: column;
                    width: 250px;
                    margin: auto;
                }

                .version-list-item {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                }

                .version-list-item > div:first-child {
                    font-weight: bold;
                }

                .version-list-item + .version-list-item {
                    margin-top: 10px;
                }
            </style>
            <div class="modal-header" style="text-align: center;">
                <button type="button" id="aboutModalHeaderDismissButton" class="close" ng-click="$ctrl.dismiss()"><span>&times;</span></button>
            </div>
            <div id="aboutModalBody" class="modal-body" style="text-align: center; margin-top: -50px;">
                <section>
                    <p>This is an unsupported and unmaintained fork of Firebot built by <a href ng-click="$root.openLinkExternally('https://github.com/TheStaticMage/firebot-fork-builder')">TheStaticMage</a>.</p>
                    <p>Get the actual version of Firebot from <a href ng-click="$root.openLinkExternally('https://firebot.app')">firebot.app</a></p>
                </section>

                <section>
                    <h5><b>Versions</b></h5>
                    <div class="about-version-list">
                        <div class="version-list-item">
                            <div>Firebot</div>
                            <div>{{$ctrl.version}}</div>
                        </div>
                        <div class="version-list-item">
                            <div>OS</div>
                            <div>{{$ctrl.osType}} {{$ctrl.osVersion}}</div>
                        </div>
                    </div>
                </section>

                <section>
                    <h5><b>License</b></h5>
                    <p>
                        Firebot is licensed under GPLv3<br/>
                        <a href ng-click="$root.openLinkExternally('https://github.com/crowbartools/Firebot/blob/master/license.txt')">View License</a>
                    </p>
                </section>

                <section>
                    <h5><b>Support</b></h5>
                    <p>This fork is unsupported and unmaintained. Only the <a href ng-click="$root.openLinkExternally('https://firebot.app')">original Firebot</a> is actively maintained and supported. Please do not ask for help with this fork in the Firebot discord or GitHub.</p>
                </section>

                <section>
                    <h5><b>Support Firebot</b></h5>
                    <p>Support firebot development by visiting the links below:</p>
                    <p>
                        <a href ng-click="$root.openLinkExternally('https://opencollective.com/crowbartools')">Donate</a> |
                        <a href ng-click="$root.openLinkExternally('https://crowbar-tools.myspreadshop.com')">Merch Store</a> |
                        <a href ng-click="$root.openLinkExternally('https://firebot.app/testimonial-submission')">Submit a Testimonial</a>
                    </p>
                </section>
                <section>
                    <button class="btn btn-sm btn-default-outlined" style="width: 100%;" ng-click="$ctrl.copyDebugInfoToClipboard()">Copy Debug Info</button>
                </button>
            </div>
            `,
        bindings: {
            resolve: "<",
            close: "&",
            dismiss: "&"
        },
        controller: function(backendCommunicator) {
            const $ctrl = this;
            // Load baked-in patch version
            let patchVersion = "";
            try {
                patchVersion = require("../../shared/patch-version.js");
            } catch (e) {
                console.error("Failed to load patch version:", e);
                patchVersion = "unknown";
            }

            $ctrl.$onInit = function() {
                $ctrl.version = patchVersion;
                $ctrl.osType = firebotAppDetails.os.type;
                $ctrl.osVersion = firebotAppDetails.os.release;
            };

            $ctrl.copyDebugInfoToClipboard = function() {
                backendCommunicator.send("copy-debug-info-to-clipboard");
            };
        }
    });
}());
