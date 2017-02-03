var app = angular.module('loginApp',['ngRoute','ngCookies']);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/', {
		template:''
	})
	.when('/register',{
		templateUrl:'register.html',
		controller:'loginCtrl'
	})
	.when('/register/success',{
		template:'<div class="container text-warning col-sm-10"><h3> Your account has been created! <br><br> Please login :)</h3></div>'
	});
	// .when('/404',{
	// 	template:'<div class="container"><h3 class="text-danger"> Whoops! Cannot find that page.</h3></div>'
	// })
	// .otherwise({
	// 	redirectTo : '/404'
	// });
	$locationProvider.html5Mode(true);
});

app.run(function($rootScope, $cookies, $http, $window) {
	$rootScope.invalidUser = null;
	if($cookies.get('token')){
		token = $cookies.get('token');
		$rootScope.token = token;
		$http({
			method : 'post',
			url : 'user/verify',
			data : {token : token}
		})
		.then(function(res){
			$rootScope.currentUser = res.data.username;
			$window.location.href = '/message.html';
		}
		,function(err){
			console.log('No authenticated user!');
		});
	}
});

app.controller('loginCtrl', function ($scope, $http, $cookies, $rootScope, $window) {

	$scope.submitLoginInfo = function(){

  		$http.post('user/login', 
		{username: $scope.login_username, password: $scope.login_password})
		.then (function(res){
			$cookies.put('token', res.data.token);
			$rootScope.token = res.data.token;
			$rootScope.currentUser = $scope.login_username;
			console.log('successfully signed in');
			$rootScope.invalidUser = null;
			$window.location.href = '/message.html';
		},function(err){
			console.log('bad login credentials : '+ err.data.message);
			$rootScope.invalidUser = {username: $scope.login_username, password: $scope.login_password};
			$scope.login_username = "";
			$scope.login_password = "";
		});
		
	};
	
	$scope.submitRegisInfo = function(){

		$scope.login_username = "";
		$scope.login_password = "";
		$rootScope.invalidUser = null;

		var register_data = {
			"username" : $scope.register_username,
			"password" : $scope.register_password,
			"firstname" : $scope.register_firstname,
			"lastname" : $scope.register_lastname,
			"email" : $scope.register_email,
			"phone" : $scope.register_phone,
			"location" : $scope.register_location,
		};
		
		console.log(register_data);

		$http.post('user/register', register_data)
		.then(function(){
			console.log('successfully submitted!');
			$window.location.href = '/register/success'
		})
		.catch(function(){
			console.log('fail!');
		});
	};

	$scope.resetRegisInfo = function(){

		$scope.register_username = '' ;
		$scope.register_password = '' ;
		$scope.register_firstname = '' ;
		$scope.register_lastname = '' ;
		$scope.register_email = '' ;
		$scope.register_phone = '' ;
		$scope.register_location = '' ;

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


