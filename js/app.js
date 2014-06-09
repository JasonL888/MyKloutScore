angular.module('custom.jlau.kloutScore', ['ngRoute'])
.provider('KloutSvc', function() {
	var debug = false;
	this.getServerErrorMsg = function(status, headers, config) {
		if (debug == true )
		{
			console.log("getServerErrorMsg:status:" + JSON.stringify(status) );
			console.log("getServerErrorMsg:headers:" + JSON.stringify(headers) );
			console.log("getServerErrorMsg:config:" + JSON.stringify(config) );
		}
		var errorMessage = {};
		if ( status )
		{ 
			switch ( status )
			{
				case 404:
					errorMessage = "not found";
					break;
				case 403:
					errorMessage = "invalid app key";
					break;
				case 500:
				case 503:
					errorMessage = "server error";
					break;
				default:
					errorMessage = "error status[" + status + "]";
			}
		}
		else
		{
			errorMessage = "no server response";
		}
		return errorMessage;

	};
	this.$get = function($q, $http) {
		var self = this;
		return {
			getOptionsConfig: function() {
				var d = $q.defer();
				chrome.storage.sync.get({
					twitterHandle: '',
					kloutApiKey: '',
					debug: false
				}, function(options){
					debug = options.debug;
					if ( debug == true )
						console.log("getOptionsConfig options:" + JSON.stringify(options));
					d.resolve(options);
				});
				return d.promise;
			},
			getKloutId: function(twitterHandle,kloutApiKey) {
				var d = $q.defer();
				$http({
					method: 'GET',
					url: 'http://api.klout.com/v2/identity.json/twitter?screenName=' + twitterHandle + '&key=' + kloutApiKey,
					cache: true
				}).success(function(data, status, headers, config) {
					d.resolve(data);
				}).error(function(data, status, headers, config) {
					var err = "Unable to get klout id [" + twitterHandle + "] - " + self.getServerErrorMsg(status,headers,config);
					d.reject(err);
				});
				return d.promise;
			},
			getKloutScore: function(kloutUserId,kloutApiKey) {
				var d = $q.defer();
				$http({
					method: 'GET',
					url: 'http://api.klout.com/v2/user.json/' + kloutUserId + '/score?key=' + kloutApiKey,
					cache: true
				}).success(function(data) {
					d.resolve(data);
				}).error(function(data, status, headers, config) {
					var err = "Unable to get klout score - " + self.getServerErrorMsg(status,headers,config);
					d.reject(err);
				});
				return d.promise;
			}
		};
	};
})
.config(function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'templates/home.html',
		controller: 'MainController'
	})
	.otherwise({redirectTo: '/'});
})
.controller('MainController', function($scope, $window, KloutSvc) {
	var kloutApiKey = '';
	var twitterHandle = '';
	var debug = false;
	$scope.data = '';
	$scope.errorMessage = '';
	$scope.score = '';
	$scope.scoreDelta = '';
	
	KloutSvc.getOptionsConfig()
		.then(function(options){
			if ( debug == true )
				console.log("MainController:options:" + JSON.stringify(options));
			twitterHandle = options.twitterHandle;
			kloutApiKey = options.kloutApiKey;
			debug = options.debug;
			return KloutSvc.getKloutId(twitterHandle,kloutApiKey);
	}, function(err){
		$scope.errorMessage = err;
	}).then(function(data){
			if (debug == true)
				console.log("MainController:getKloutId:data:" + JSON.stringify(data));
			var kloutUserId = data.id;
		return KloutSvc.getKloutScore(kloutUserId,kloutApiKey);
	}, function(err){
		$scope.errorMessage = err;
	}).then(function(data){
		if (data) {
			if (debug == true)
				console.log("MainController:getKloutScore:data:" + JSON.stringify(data));
			$scope.data = data;
			$scope.score = data.score;
			$scope.scoreDelta = data.scoreDelta;
		}
	}, function(err) {
		$scope.errorMessage = err;
	});

});