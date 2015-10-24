(function(angular) {
	angular.module('store',[]).
	controller('storeCtrl', ['$scope', 'store', function($scope, store) {
		$scope.store = {};
		$scope.storeList = [];
		$scope.add = function() {
			$scope.store.owner = $scope.currentUser.id;
			console.log('store is: %o', $scope.store);
			store.add($scope.store).success(function(store) {
			});
		}
		
		/*store.getUserStores($scope.currentUser).success(function(result) {
			$scope.user_stores = result;
		});*/

	}]).
	service('store',['$http', function($http) {
		this.add = function(store) {
			console.log('add');
			return $http.post('store/new', store).success(function(result) {
				console.log('result: %o',result);
				return result;
			});
		}
		this.getUserStores = function(user) {
			console.log(user);
			return $http.get('store/all/'+user.id).success(function(result) {
				console.log('result: %o',result);
				return result;
			});
		}
	}]);
})(angular);