(function() {
    'use strict';

    angular.module('exceptionless.stacks')
        .directive('stacks', function() {
            return {
                bindToController: true,
                restrict: 'E',
                replace: true,
                scope: {
                    settings: "="
                },
                templateUrl: 'components/stacks/stacks-directive.tpl.html',
                controller: ['$window', '$state', 'linkService', 'notificationService', 'stacksActionsService', function ($window, $state, linkService, notificationService, stacksActionsService) {
                    var vm = this;

                    function get(options) {
                        vm.settings.get(options || vm.settings.options).then(function (response) {
                            vm.selectedIds = [];
                            vm.stacks = response.data.plain();

                            var links = linkService.getLinksQueryParameters(response.headers('link'));
                            vm.previous = links['previous'];
                            vm.next = links['next'];
                        });
                    }

                    function hasStacks() {
                        return vm.stacks && vm.stacks.length > 0;
                    }

                    function hasSelection() {
                        return vm.selectedIds.length > 0;
                    }

                    function open(id, event) {
                        if (event.ctrlKey || event.which === 2) {
                            $window.open('/#/app/stack/' + id, '_blank');
                        } else {
                            $state.go('app.stack', { id: id });
                        }
                    }

                    function nextPage() {
                        get(vm.next);
                    }

                    function previousPage() {
                        get(vm.previous);
                    }

                    function updateSelection() {
                        if (!hasStacks())
                            return;

                        if (hasSelection())
                            vm.selectedIds = [];
                        else
                            vm.selectedIds = vm.stacks.map(function(stack) { return stack.id; });
                    }

                    function save() {
                        if (!hasSelection()) {
                            notificationService.info(null, 'Please select one or more stacks');
                            return;
                        }

                        if (!vm.selectedAction) {
                            notificationService.info(null, 'Please select a bulk action');
                            return;
                        }

                        vm.selectedAction.run(vm.selectedIds);
                    }

                    vm.actions = stacksActionsService.getActions();
                    vm.get = get;
                    vm.hasStacks = hasStacks;
                    vm.hasSelection = hasSelection;
                    vm.nextPage = nextPage;
                    vm.open = open;
                    vm.previousPage = previousPage;
                    vm.save = save;
                    vm.selectedIds = [];
                    vm.selectedAction = null;
                    vm.updateSelection = updateSelection;

                    get();
                }],
                controllerAs: 'vm'
            };
        });
}());
