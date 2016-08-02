// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
      'ionic',  
      'starter.controllers', 
      'starter.services', 
      "ngCordova", 
      "ngStorage", 
      "angularMoment", 
      "ionic-audio", 
      "ngResource", 
      "ngSanitize",
      "com.2fdevs.videogular",
      "com.2fdevs.videogular.plugins.controls",
      "com.2fdevs.videogular.plugins.overlayplay",
      "com.2fdevs.videogular.plugins.poster"
])

.run(function($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: 'No Internet Connection',
          content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
        })
        .then(function(result) {
          if(!result) {
            ionic.Platform.exitApp();
          }
        });
      }
    }

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $httpProvider, $urlRouterProvider) {
 

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    
    url: '/tab', 
    cache:true,
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.search', {
    url: '/search?q',
    params: {
      q: null
    },
    views: {
      'tab-search': {
        templateUrl: 'templates/tab-search.html',
        controller: 'SearchCtrl'
      }
    }
  })

  .state('tab.favorites', {
    url: '/favorites',
    views: {
      'tab-favorites': {
        templateUrl: 'templates/tab-favorites.html',
        controller: 'FavoritesCtrl'
      }
    }
  })

  .state('tab.video', {
    url: '/video/:videoId',
    views: {
      'tab-video': {
        templateUrl: 'templates/tab-video.html',
        controller: 'VideoCtrl'
      }
    }
  })

  .state('tab.playlists', {
      url: '/playlists',
      views: {
        'tab-playlists': {
          templateUrl: 'templates/tab-playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
  })
  .state('tab.playlists.playlist', {
      url: '/playlist/:playlist',
      views: {
        'tab-playlists@tab': {
          templateUrl: 'templates/tab-playlist.html',
          controller: 'PlaylistCtrl'
        }
      }
  })

  .state('tab.history', {
    url: '/history',
    views: {
      'tab-history': {
        templateUrl: 'templates/tab-history.html',
        controller: 'HistoryCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/search');

})

.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {

      if(event.which === 13) {
        scope.$apply(function (){
            scope.$eval(attrs.ngEnter, {$event:event});
        });
        event.preventDefault();
      }
    });
  };
})
.directive('ionSearchBar', function($timeout, $stateParams) {
  return {
    restrict: 'E',
    scope: false,
    link: function($scope, element, attrs) {

      if (attrs.class) {
        element.addClass(attrs.class);
      } 
        
      var inputElement = element.find('input')[0];

      if (attrs.placeholder) {
        inputElement.setAttribute("placeholder", attrs.placeholder);
      }
  

      $scope.suggestions = [];
      $scope.selectedTags = [];
      $scope.selectedIndex = -1; 

      //scope.removeTag = function(index) {
      //  scope.selectedTags.splice(index, 1);
      //}

      $scope.clearResults = function() {
        $scope.suggestions = [];
      }

      $scope.selectSearchTerm = function(index) {
        if ($scope.selectedTags.indexOf($scope.suggestions[index]) === -1) {
          $scope.search.value = $scope.suggestions[index];
          $scope.clearResults();
        }
      }

      $scope.checkKeyDown = function(event) {
        if (event.keyCode === 13) { //enter pressed
          $scope.selectSearchTerm(scope.selectedIndex);
        } else if (event.keyCode === 40) { //down key, increment selectedIndex
          event.preventDefault();
          if ($scope.selectedIndex + 1 !== $scope.suggestions.length) {
            $scope.selectedIndex++;
          }
        } else if (event.keyCode === 38) { //up key, decrement selectedIndex
          event.preventDefault();
          if ($scope.selectedIndex - 1 !== -1) {
            $scope.selectedIndex--;
          }
        }
        //else scope.search();
      };
      $scope.checkKeyup = function(event) {
        if (event.keyCode === 13 || event.keyCode === 40 || event.keyCode === 38)
          return;
        if($scope.suggest) $scope.suggest();
      };
      $scope.$watch('selectedIndex', function (val) {
        if (val !== -1) {
          $scope.search.value = $scope.suggestions[scope.selectedIndex];
          $scope.doSearch();
        }
      });
      element.bind('blur', $scope.clearResults);
      element.bind('keyup', $scope.checkKeyup);
      angular.element(inputElement).bind('focus', function () {
        if($scope.search) $scope.search.focus = true;
      });
      angular.element(inputElement).bind('blur', function() {
        if($scope.search) $scope.search.focus = false;
      });
    },
    template: ' '+
                '<div class="search-bar item-input-inset">' +
                '<label class="item-input-wrapper">' +
                  '<i class="icon ion-ios-search placeholder-icon"></i>' +
                  '<input type="search" ng-model="search.value" style="width:100%">' +
                  '<button right class="button button-clear button-small button-dark ng-hide" ng-show="search.value.length" on-touch="resetSearch(); ">' +
                    '<i class="icon ion-ios-close placeholder-icon"></i>' +
                  '</button>' + 
                '</label>' + 
              '</div> '
  };
})

.directive('ionFilterBar', function($timeout, $stateParams) {
  return {
    restrict: 'E',
    scope: false,
     
    link: function($scope, element, attrs) {

      if (attrs.class) {
        element.addClass(attrs.class);
      } 

      var inputElement = element.find('input')[0];

      if (attrs.placeholder) {
        inputElement.setAttribute("placeholder", attrs.placeholder);
      }

      $scope.resetSearch = function () {
        $scope.searchText = '';
      }
    },
    template: ' '+
                '<div class="search-bar item-input-inset">' +
                '<label class="item-input-wrapper">' +
                  '<i class="icon ion-ios-search placeholder-icon"></i>' +
                  '<input type="search" ng-model="searchText" style="width:100%">' +
                  '<button right class="button button-clear button-small button-dark ng-hide" ng-show="searchText.length" on-touch="resetSearch(); ">' +
                    '<i class="icon ion-ios-close placeholder-icon"></i>' +
                  '</button>' + 
                '</label>' + 
              '</div> '
  };
})
 
 
.filter("timeAgo", function() {
  return function(date) {
    return jQuery.timeago(date); 
  };
});
 