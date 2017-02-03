var app = angular.module('profileApp',['ngRoute','ngCookies']);

app.config(function($routeProvider, $locationProvider){
	$routeProvider
	.when('/', {
		templateUrl : 'profileList.html',
		controller : 'profileCtrl'
	})
	.when('/update', {
		templateUrl : 'profileUpdate.html',
		controller : 'subCtrl'
	})
	.when('/verify', {
		templateUrl : 'profileVerify.html',
		controller : 'subCtrl'
	})
	.when('/success',{
		template :'<div class="success-div">Update successfully! Please <a href="/">login</a>. </div>'
	});


	// $locationProvider.html5Mode(true);
});

app.run(function($rootScope, $cookies, $http, $window) {
	$rootScope.invalidUser = null;
	if($cookies.get('token')){
		token = $cookies.get('token');
		$rootScope.token = token;
		$rootScope.userPromise = $http({
			method : 'post',
			url : 'user/verify',
			data : {token : token}
		});
		/*.then(function(res){
			$rootScope.currentUser = res.data.username;
			console.log($rootScope.currentUser + '--run');
			
		}
		,function(err){
			console.log('No authenticated user!');
			$window.location.href = '/login.html';
		});*/
	}else{
		$window.location.href = '/login.html';	
	}
});

app.controller('profileCtrl',['$scope', '$http', '$cookies', '$rootScope', '$window', function ($scope, $http, $cookies, $rootScope, $window) {
	$scope.editable = false;
	$scope.updateclicked = false;
	
	$rootScope.userPromise.then(function(res){
		$rootScope.currentUser = res.data.username;
		$http({
			method:'post',
			url:'profile/getuserdata',
			data : {username : $rootScope.currentUser}
		}).then(function(res){
			$scope.user = res.data;
			console.log($scope.user + '---profile.js');
		}
		,function(err){
			console.log('No authenticated user!');
			$window.location.href = '/login.html';
		});
	})

	$scope.update = function(){
		$scope.updateclicked = true;
		$window.location.href = '/profile.html#/verify';
	};
	
	$scope.submitCurrentPsw = function () {
		console.log($scope);
		$scope.verify_password=$scope.$$childTail.verify_password;
		$scope.$$childTail.verify_password=null;
		$http({
			method : 'post',
			url: 'profile/verify',
			data: {username : $rootScope.currentUser, password: $scope.verify_password}
		}).then(function (res) {
			$scope.invalidPassword = !res.data;
			if (res.data) {
				$scope.editable = true;
				$window.location.href = '/profile.html#/update';
			}
		});
	}

	$scope.logout = function(){
		$rootScope.token = null;
		$rootScope.currentUser = null;
		$cookies.remove('token');
		$window.location.href = '/';
	}
}]);

app.controller('subCtrl', function($scope, $http, $window, $cookies){
	$scope.$parent.updateclicked = true;
	console.log($scope);
	$scope.submitUpdate=function(){
		if($scope.user.password_new==$scope.user.password_confirm){
			var user_update = {
				username : $scope.user.username,
				password_verify : $scope.verify_password,
				password: $scope.user.password_new,
				firstname : $scope.user.firstname,
				lastname : $scope.user.lastname,
				email : $scope.user.email,
				phone : $scope.user.phone,
				location : $scope.user.location,
				avatar_url : $scope.user.avatar_url
			}
			$scope.verify_password = null;

			var data = {};
			console.log(data);
			for(var key in user_update){
				if(user_update[key]){
					data[key]=user_update[key];
				}
			};
			console.log(data);

			$http({
				method : 'post',
				url : 'profile/update',
				data : data
			}).then(function(res){
				console.log(res);
				$cookies.remove('token');
				$window.location.href = '/profile.html#/success';
			}
			,function(err) {
				console.log(err);
			});
		}
	}
});

app.directive('passwordValidate', function() {


    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {

                scope.pwdValidLength = (viewValue && viewValue.length >= 8 ? 'valid' : undefined);
                scope.pwdHasLetter = (viewValue && /[A-z]/.test(viewValue)) ? 'valid' : undefined;
                scope.pwdHasNumber = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;

                if(scope.pwdValidLength && scope.pwdHasLetter && scope.pwdHasNumber) {
                    ctrl.$setValidity('pwd', true);
                    return viewValue;
                } else {
                    ctrl.$setValidity('pwd', false);                    
                    return undefined;
                }
            });
        }
    };
});

app.directive("passwordVerify", function() {
   return {
      require: "ngModel",
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(function() {
            var combined;

            if (scope.passwordVerify || ctrl.$viewValue) {
               combined = scope.passwordVerify + '_' + ctrl.$viewValue; 
            }                 
            return combined;
            console.log(combined);
        }, function(value) {
            if (value) {
                ctrl.$parsers.unshift(function(viewValue) {
                    var origin = scope.passwordVerify;
                    if (origin !== viewValue) {
                        ctrl.$setValidity("passwordVerify", false);
                        return undefined;
                    } else {
                        ctrl.$setValidity("passwordVerify", true);
                        return viewValue;
                    }
                });
            }
        });
     }
   };
});

