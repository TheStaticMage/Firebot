"use strict";
(function() {
    angular
        .module("firebotApp")
        .directive("dynamicComponent", function($compile, logger) {
            return {
                restrict: "E",
                scope: {
                    componentName: "@",
                    componentData: "<"
                },
                replace: true,
                template: `<div></div>`,
                link: function($scope, element) {
                    if (!$scope.componentName) {
                        logger.warn("dynamic-component: no componentName provided");
                        return;
                    }

                    // Convert camelCase to kebab-case for Angular component tags
                    const componentTag = $scope.componentName
                        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                        .toLowerCase();

                    logger.debug(`dynamic-component: Compiling component '${$scope.componentName}' as tag '${componentTag}'`);
                    const html = `<${componentTag} component-data="componentData"></${componentTag}>`;
                    const compiled = $compile(html)($scope);
                    element.replaceWith(compiled);
                }
            };
        });
}());
