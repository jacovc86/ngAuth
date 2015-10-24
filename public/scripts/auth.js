(function(angular) {
  'use strict';
  var settings = {
    'FacebookID'    :     '418678161654216'
  };
  /**
  Module
  *name auth
  *purpose handle all auth related issues
  *author Kobi Cohen ykvcohen@gmail.com
  */
  angular.module('auth', ['facebook']).value('settings', settings).
  config(function(FacebookProvider) {
    FacebookProvider.init(settings.FacebookID);
  }).
  controller('authCtrl', ['$scope', 'account', 'message',
      function($scope, account, message) {

        /*user object hold user registration info */
        $scope.user = {};
        /*Login uses the credentials that the user gave and login to system using the "account" service */
        $scope.login = function(credentials) {
          account.login(credentials).then(function(res) {
            if(res.err) setFlashMessage('warning', res.err);
            if(!res.user) message.setInputFeedback('danger', res.message);
          });
        }

        /*Logout function invoke when user press on "Logout" button */
        $scope.logout = function() {
          account.logout();
        }

        /*Signup function uses the user object that hold all user info */
        $scope.signup = function() {
          $scope.loading = true;
          account.signup($scope.user).success(function(res) {
            $scope.loading = false;
            if(res.err) message.setInputFeedback('danger',res.err.message);
            else {$scope.user = {}; message.reset(); }
          });
        }

        /* @@@@   FOR TEST MODE ONLY!!!!  @@@@  */
        /*This mehtod automatically create user for registration, taken from: filltext.com*/
        $scope.mockReg = function() {
          account.createMockData().success(function(response) {
            $scope.user = response[0];
            $scope.user.password2 = response[0].password;
          });

        }

        /*Connect with Facebook */
        $scope.fb_connect = function() {
          account.facebook_login();
        }

        
      }]).
/**
*Service: Account
*Purpose: Handle account data and functions
*/
  service('account', ['$rootScope', '$http', '$cookieStore', 'Facebook', '$q', '$location',
      function($rootScope, $http, $cookieStore, Facebook, $q, $location) {
        this.login = function(user) {
          return $http.post('/auth/login', user).then(
            function(response) {
              var res = response.data;
              if(res.err) return { err: res.err }
              if(res.user) {
                $cookieStore.put('session-id',res.user.id);
                $rootScope.currentUser = res.user;
                $location.path('/dashboard');
                return { user: $rootScope.currentUser }
              }
              else return { message: res.message }
            });
        }
        this.logout = function() {
          $cookieStore.remove('session-id');
          $rootScope.currentUser = null;
          if($rootScope.fb_connected) Facebook.logout();
          $location.path('/');
          return $http.post('auth/logout');
        }
        this.signup = function(user) {
          return $http.post('/auth/register',user).success(function(res) {
            if(res.err) {
              return res.err;
            }
            else {
              $rootScope.currentUser = res.user;
              $cookieStore.put('session-id',$rootScope.currentUser.id);
              $location.path('/dashboard');
              return res.user;
            }
          });
        }
        this.active = function() {
          return $q(function(resolve, reject) {
            if($cookieStore.get('session-id')) {
              $rootScope.currentUser = {};
              $http.post('/auth/user', {by: 'id', q: $cookieStore.get('session-id')}).success(function(res) {
                if(res.err || !res.user)
                  {
                    $cookieStore.remove('session-id');
                    reject(res.err || 'User Not Found');
                  }
                else {
                  $rootScope.currentUser = res.user;
                  resolve(res.user);
                }
              });
            }
            else {
              reject('No Active User');
            }
          });
        }
        this.getUser = function(query) {
          return $http.post('/auth/user', query).then(function(response) {
            return response.data;
          }); 
        } 
        this.facebook_login = function() {
          Facebook.login(function(response) {
            if(response.authResponse) {
              Facebook.api('/me?fields=name,email,id,gender,picture,first_name,last_name', function(response) {
                $http.post('/auth/facebook_login',response).success(function(res) {
                  if(res.err) console.error('Facebook Login Error: '+res.err);
                  else {
                    $rootScope.currentUser = res.user;
                    $cookieStore.put('session-id', $rootScope.currentUser.id);
                    if(res.action==='login') $location.path('/dashboard');
                    else if(res.action==='register') $location.path('/profile');
                    /*TODO 
                    * Make Facebook first timers to change password */
                  }
                }).error(function(err) {
                  console.error('Facebook Login Error: '+err);
                });
              });
            }
          },{scope: 'email,user_photos'});
        }
        /*Should be deleted in production */
        this.createMockData = function() {
          return $http.get('http://www.filltext.com/?rows=1&username={username}&email={email}&fname={firstName}&lname={lastName}&password={password}');
        }
    }]).
/**
*Service: Message
*Purpose: Handle messages for the user
*/
  service('message', ['$rootScope', function($rootScope) {
        var m = {};
        this.setInputFeedback = function(status, text) {
          m.inputFeedback = {status: status, text: text};
          $rootScope.$broadcast('inputFeedback:changed');
        }
        this.getInputFeedback = function() {
          return m.inputFeedback ? m.inputFeedback : false;
        }
        this.setFlashMessage = function(status, text) {
          m.flashMessage = {status: status, text: text};
          $rootScope.$broadcast('flashMessage:changed');
        }
        this.getFlashMessage = function() {
          return m.flashMessage ? m.flashMessage : false;
        }
        this.reset = function() {
          m = {};
          $rootScope.$broadcast('message:reset');
        }
      }]).
  //Directive "Login" - : - Create the Login element
  directive('login',function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'auth_partials/login.jade'
    }
  }).
  //Directive "Register" - : - Create the Register element
  directive('register', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'auth_partials/register.jade'
    }
  }).
  directive('waiting', function() {
    return {
      restrict: 'A',
      link: function(scope, el, attr) {
        scope.$watch(attr.waiting, function(value) {

        })
      }
    }
  }).
  //Directive "Match" - : - Check if 2 input elements are equal
  directive('match', ['$parse', function($parse) {
      return {
          require: 'ngModel',
          restrict: 'A',
          link: function(scope, elem, attr, ctrl) {
              var matchGetter = $parse(attr.match);
              var caselessGetter = $parse(attr.matchCaseless);
              var noMatchGetter = $parse(attr.notMatch);

              scope.$watch(getMatchValue, function(){
                  ctrl.$$parseAndValidate();
              });

              ctrl.$validators.match = function(){
                var match = getMatchValue();
                var notMatch = noMatchGetter(scope);
                var value;

                if(caselessGetter(scope)){
                  value = angular.lowercase(ctrl.$viewValue) === angular.lowercase(match);
                }else{
                  value = ctrl.$viewValue === match;
                }
                value ^= notMatch;
                return !!value;
              }
              function getMatchValue(){
                  var match = matchGetter(scope);
                  if(angular.isObject(match) && match.hasOwnProperty('$viewValue')){
                      match = match.$viewValue;
                  }
                  return match;
              }
          }
      };
  }]).
  //Tobe deleted! "Check Duplicity" would be use instead
  directive('feedback', ['message', function(message) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function(scope, el, attr, ctrl) {
        if(!ctrl) return;
        /*el.on('blur', function() {
          var err = ctrl.$error, pending = ctrl.$pending, field = attr.placeholder;
          if((pending? pending.duplicate : false) || err.duplicate) { output(field + ' already taken, try Login'); return; }
          if(err.pattern || err.email) {output(field +' "'+ ctrl.$viewValue + '" is invalid'); return;}
          if(err.minlength) {output(field + ' must contain at least ' + attr.minlength + ' characters'); return;}
          if(err.maxlength) {output(field + ' must contain maximum of ' + attr.maxlength + ' characters'); return;}
          if(err.required) {output(field + ' is Required'); return;}
          if(err.match) {output('Passwords do not match'); return;}
        })
        function output(text) {
          message.setInputFeedback('danger',text);
          el.attr('title', text);
        }*/
      } 
    }
  }]).
  //Check if unique fields in the registration form already exists in the database
  directive('checkDuplicity', ['account', 'message', '$q', function(account, message, $q) {
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function(scope,el,attr,ctrl) {
        if(!ctrl) return;
        ctrl.$asyncValidators.duplicate = function(v) {
          return account.getUser({by: attr.name, q: v}).then(function(res) {
            if(res.user) {
              console.log(res.user.email);
              return $q.reject(res.message);
            }
            return true;
          });
        }
      }
    }
  }]);

})(angular);