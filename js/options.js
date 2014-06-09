angular.module('custom.jlau.kloutScore.options', [])
.controller('OptionsController', function($scope) {
	$scope.user = {
			twitterHandle: '',
			kloutApiKey: '',
			debug:false
	};
	chrome.storage.sync.get({
			twitterHandle: '',
			kloutApiKey: '',
			debug:false
		}, function(items){
			$scope.$apply(function(){
				if ( items.twitterHandle && items.kloutApiKey )
				{
					$scope.user.twitterHandle = items.twitterHandle;
					$scope.user.kloutApiKey = items.kloutApiKey;
					$scope.user.debug = items.debug;
					$scope.statusMessage = "";
				}
				else
				{
					$scope.statusMessage = "Please enter values above and click on SAVE button";
				}
			});
	});
	
	$scope.update = function(user) {
		$scope.statusMessage = "";
		var userTwitterHandle = $scope.user.twitterHandle;
		var userKloutApiKey = $scope.user.kloutApiKey;
		var userDebug = $scope.user.debug;
		chrome.storage.sync.set({
			twitterHandle: userTwitterHandle,
			kloutApiKey: userKloutApiKey,
			debug: userDebug
		}, function() {
			$scope.$apply(function(){
				$scope.statusMessage = "Option settings saved!";
			});
		});	
	};
	
});