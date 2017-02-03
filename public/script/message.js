var app = angular.module('msgApp',['ngCookies', 'ngRoute']);

app.config(function($routeProvider, $locationProvider){
	$routeProvider
	.when('/', {
		templateUrl : 'messageList.html',
		controller : 'msgCtrl'
	})
	.when('/newmessage',{
		templateUrl : 'messageNew.html',
		controller : 'newmsgCtrl'
	})
	.when('/newmessage/:recipient',{
		templateUrl : 'messageNew.html',
		controller : 'newmsgCtrl'
	})
	.when('/sentmessage',{
		templateUrl : 'messageList.html',
		controller : 'sentmsgCtrl'
	})
	.when('/impmessage', {
		templateUrl : 'messageList.html',
		controller : 'impmsgCtrl'
	})
	.when('/detail', {
		templateUrl : 'messageDetail.html',
		controller : 'detailCtrl'
	});


	// $locationProvider.html5Mode(true);
});

app.run(function($rootScope, $cookies, $http, $window) {
	$rootScope.invalidUser = null;
	if(!$rootScope.currentUser){
		if($cookies.get('token')){
			token = $cookies.get('token');
			$rootScope.token = token;
			$rootScope.userPromise = $http({
				method : 'post',
				url : 'user/verify',
				data : {token : token}
			})
			.then(function(res){
				$rootScope.currentUser = res.data.username;
			}
			,function(err){
				console.log('No authenticated user!');
				$window.location.href = '/login.html';
			});
		}else{
			$window.location.href = '/login.html';	
		}
	}
	
});

app.controller('msgCtrl', function ($scope, $http, $cookies, $rootScope, $window) {
	$rootScope.user_tag = 'From';
	$rootScope.isRecipient = true;
	if($rootScope.currentUser){
		$http({
			method : 'post',
			url : '/message/received',
			data : {username : $rootScope.currentUser}
		})
		.then(function(response){
			$scope.messages = response.data;
		});
	};
	
	$scope.showDetails = function (message) {
		$rootScope.message = message;
		$window.location.href = '#/detail';
	};

	$scope.setFlag = function () {
		this.message.important = !this.message.important;
		$http({
			method:"post",
			url:"message/setflag",
			data: this.message
		}).then(function(res){
			console.log(res);
		})
	}

	$scope.logout = function(){
		$rootScope.token = null;
		$rootScope.currentUser = null;
		$cookies.remove('token');
		$window.location.href = '/';
	}
})

app.controller("newmsgCtrl", function($scope, $rootScope, $http, $window, $routeParams){
	if($routeParams.recipient != null){
		$scope.recipient = $routeParams.recipient;
		$scope.subject = "Reply to: "+ $scope.message.subject;
		$scope.message = null;
	}
	$scope.message = null;

	$scope.submitNewMsg = function(){
		
		var newMsg = {
			"recipient" : $scope.recipient,
			"sender": $rootScope.currentUser,
			"subject" : $scope.subject,
			"message" : $scope.message
		};
		$http.post('message/new', newMsg)
		.then(function(){
			console.log('successfully submitted!');
			$window.location.href = '/message.html#/'
		})
		.catch(function(){
			console.log('fail!');
		});
	};
});

app.directive("recipientValidate",['$http', function($http) {
   return {
   		require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            function myValidation (toUser) {
            	$http({
            		method : "post",
            		url: "user/exist",
            		data : {username : toUser}
            	}).then(function(req){
            		if(req.data){
            			ctrl.$setValidity('recipientExist', true);
            		}else{
            			ctrl.$setValidity('recipientExist', false);
            		}
            	});
            	return toUser;
            	console.log(toUser);
            };
            ctrl.$parsers.push(myValidation);
        }
    };
}]);

app.controller('sentmsgCtrl', function($scope, $rootScope, $http){
	$rootScope.user_tag = 'To';
	$rootScope.isRecipient = false;

	$http({
		method : 'post',
		url : '/message/sent',
		data : {username : $rootScope.currentUser}
	})
	.then(function(response){
		$scope.messages = response.data;
	});
});

app.controller('impmsgCtrl', function($scope, $rootScope, $http){
	$rootScope.user_tag = 'From';
	$rootScope.isRecipient = true;

	$http({
		method : 'post',
		url : '/message/important',
		data : {username : $rootScope.currentUser}
	})
	.then(function(response){
		$scope.messages = response.data;
	});
});

app.controller('detailCtrl', function($scope, $rootScope, $http, $window){
	$scope.delete = function(){
		var data = $rootScope.message;
		console.log(this);
		console.log(data);
		$http({
			method:"post",
			url:"/message/delete",
			data : data
		}).then(function(res){
			console.log(res);
			$window.location.href = '/message.html#/'
		})
	}

	$scope.back = function(){
		$window.history.back();
	}
});



