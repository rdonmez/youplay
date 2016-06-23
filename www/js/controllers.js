angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope) {
    
})

.controller('SearchCtrl', function($scope, $ionicLoading, VideoService) {

    $scope.show = function() {
      $ionicLoading.show({
        template: 'Loading...'
      }).then(function(){
         
      });
    };
    $scope.hide = function(){
      $ionicLoading.hide().then(function(){
         
      });
    };

    $scope.search = {value: '', focus: false, nextPageToken: ""};
    
    $scope.cancelSearch = function() {
      inputElement.blur();
      scope.search.value = '';
    };

    $scope.doSearch = function() {
      $scope.show();
      VideoService.search($scope.search.value).then(function (result) {
         $scope.result = result;
         $scope.search.nextPageToken = result.nextPageToken;
         $scope.hide()
      });
    };

    $scope.searcMore = function() {
      VideoService.search($scope.search.value, $scope.search.nextPageToken).then(function (result) {
        $scope.result = result;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.hide(); 
      });
    };

    //$scope.$on('$stateChangeSuccess', function() {
    //  $scope.loadMore();
    //});

})

.controller('VideoCtrl', function($scope, $routeParams, VideoService) {
  
    console.log($routeParams.param)
    
    VideoService.get($$routeParams.param).then(function (result) {
       $scope.result = result;
    });
  
})

.controller('PlayingCtrl', function($scope) {

})

.controller('PlaylistsCtrl', function($scope, VideoService) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  
})

.controller('MainController', function ($scope) {
     
})
 

