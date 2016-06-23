// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state('tab.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'templates/tab-search.html',
        controller: 'SearchCtrl'
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
  .state('tab.playing', {
      url: '/playing',
      views: {
        'tab-playing': {
          templateUrl: 'templates/tab-playing.html',
          controller: 'PlayingCtrl'
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
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

})

.directive('ionSearchBar', function($timeout, VideoService) {
  return {
    restrict: 'E',
    replace: true,
    scope: { search: '=?filter' },
    link: function(scope, element, attrs) {
      scope.placeholder = attrs.placeholder || '';
      scope.search = {value: '', focus: false};
      if (attrs.class) {
        element.addClass(attrs.class);
      }

      // We need the actual input field to detect focus and blur
      var inputElement = element.find('input')[0];

      // This function is triggered when the user presses the `Cancel` button
      scope.cancelSearch = function() {
        // Manually trigger blur
        inputElement.blur();
        scope.search.value = '';
      };

      scope.doSearch = function() {
        VideoService.search(scope.search.value).then(function (result) {
           console.log(result);
           scope.result = result;
        });
      };

      // When the user focuses the search bar
      angular.element(inputElement).bind('focus', function () {
        // We store the focus status in the model to show/hide the Cancel button
        scope.search.focus = 1;
        // Add a class to indicate focus to the search bar and the content area
        element.addClass('search-bar-focused');
        angular.element(document.querySelector('.has-search-bar')).addClass('search-bar-focused');
        // We need to call `$digest()` because we manually changed the model
        scope.$digest();
      });
      // When the user leaves the search bar
      angular.element(inputElement).bind('blur', function() {
        scope.search.focus = 0;
        element.removeClass('search-bar-focused');
        angular.element(document.querySelector('.has-search-bar')).removeClass('search-bar-focused');
      });
    },
    template: '<form ng-submit="doSearch()" ><div class="search-bar bar bar-header item-input-inset">' +
                '<label class="item-input-wrapper">' +
                  '<i class="icon ion-ios-search placeholder-icon"></i>' +
                  '<input type="search" placeholder="" ng-model="search.value" ng-enter="doSearch()">' +
                '</label>' +
                '<button type="button" class="button button-clear button-positive" ng-show="search.focus" ng-click="cancelSearch()">' +
                  'Cancel' +
                '</button>' +
              '</div></form>'
  };
});
