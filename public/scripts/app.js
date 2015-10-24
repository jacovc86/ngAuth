var APP = {
  NAME: 'Shopen'
}

var app = angular.module(APP.NAME,['ngRoute', 'ngCookies','auth','ui.router']).
controller('mainCtrl',['$scope', 'account', 'message', function($scope, account, message) {
	/*msg hold feedback message to the user, like errors, info etc. */
  $scope.msg = {};

  account.active();
  /*Listeners */

  //When facebook status change event happens, let the scope know.
  $scope.$on('Facebook:statusChange', function(ev, data) {
    $scope.fb_connected = data.status==='connected';
  });

  //Listen when message is reset
  $scope.$on('message:reset',function() {
    $scope.msg = {};
  });

  //Listen when the input feedback change
  $scope.$on('inputFeedback:changed',function() {
    $scope.msg.inputFeedback = message.getInputFeedback();
  });

  //Listen when there is new flash message
  $scope.$on('flashMessage:changed', function() {
    $scope.msg.flashMessage = message.getFlashMessage();
  });
}]).
config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider
  .when('dashboard/profile','profile')
  .otherwise('/');
  $stateProvider
    .state('/dashboard', {
      templateUrl: 'dashboard',
      controller: 'dashboardCtrl',
      resolve: {
        active: ['account', function(account) {
          return account.active();
        }]
      }
    })
    .state('/dashboard/profile', {
      templateUrl: 'dahsboard_partials/profile',
      controller: 'profileCtrl',
      resolve: {
        active: ['account', function(account) {
          return account.active();
        }]
      }
    });
}]);
