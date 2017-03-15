var app = angular.module('chatApp',['ngRoute','ngCookies']);
var socket = io();

app.run(function($rootScope, $cookies, $http, $window) {
	$rootScope.invalidUser = null;
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
			console.log($rootScope.currentUser + '--run');
			
		}
		,function(err){
			console.log('No authenticated user!');
			$window.location.href = '/login.html';
		});
	}else{
		$window.location.href = '/login.html';	
	}
});

app.controller('chatCtrl',['$scope', '$http', '$cookies', '$rootScope', '$window', function ($scope, $http, $cookies, $rootScope, $window) {
	$('form').submit(function(){
	    socket.emit('chat message', $rootScope.currentUser+" said: "+ $('#m').val());
	    $('#m').val('');
	    return false;
  	});
  	socket.on('chat message', function(msg){
    	$('#messages').append($('<li>').text(msg));
  	});

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