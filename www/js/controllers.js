angular.module('starter.controllers', [ ])

/* Main */
.controller('MainController', function($scope, resourceError) {  
  
})
/* // Main */

/* Search */
.controller('SearchCtrl', function($scope, $timeout, $ionicModal, $cordovaKeyboard, $ionicActionSheet, $ionicLoading, $ionicTabsDelegate, $ionicPopup, $stateParams, VideoService, LocalPlaylistService, HistoryService, FavoriteService) {


    $scope.search = { value: '', value2: '', focus: false  };
    $scope.noMore = false;
    $scope.done = false;
    $scope.pageSize = 25; 
    $scope.items = []; 
    $scope.suggestions = []; 

    $scope.resetSearch = function () {
      $scope.search.value = '';
      $scope.done = false;
      $scope.suggestions = [];
      $scope.items = [];
    }
  
    $scope.suggest = function() {
      if ($scope.search.value == null || $scope.search.value.length < 1) return;
      VideoService.autocomplete($scope.search.value).then(function (result) {
        $scope.suggestions = result;
      });
    }

    $scope.doSearch = function() {
      if ($scope.search.value == null || $scope.search.value.length < 1) return;
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.close();
      } 
      if($scope.search.value) HistoryService.addToSearchHistory($scope.search.value);
      $scope.youtubeParams = {
        maxResults: $scope.pageSize,
        q: $scope.search.value,
        order: 'date'
      };
      VideoService.search($scope.youtubeParams).then(function (result) {
        $scope.search.value2 = $scope.search.value;
        $scope.nextPageToken = result.nextPageToken;
        $scope.items = result.items;
        $scope.done = true;
      });
    };

    $scope.doRefresh = function () {
      $scope.youtubeParams = {
        maxResults: $scope.pageSize,
        q: $scope.search.value,
        order: 'date'
      };
      VideoService.search($scope.youtubeParams).then(function (result) {
        $scope.nextPageToken = result.nextPageToken;
        $scope.items = result.items;
        $scope.done = true;
        $scope.$broadcast('scroll.refreshComplete');
      });
    };

    $scope.doMore = function () {
      $scope.youtubeParams = {
        maxResults: $scope.pageSize,
        pageToken: $scope.nextPageToken,
        q: $scope.search.value,
        order: 'date'
      };
      VideoService.search($scope.youtubeParams).then(function (result) {
        if(result.items.length < 1) $scope.noMore = true; 
        $scope.nextPageToken = result.nextPageToken;
        $scope.items.push.apply($scope.items, result.items);
        $scope.done = true;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
      
    };

    if($stateParams.q) { 
      $scope.search.value = $stateParams.q;
      $scope.history = true;
      $scope.title = "Search: "+ $stateParams.q;
      $scope.doSearch(); 
    }
 
    $scope.searchHistory = HistoryService.getAllSearchHistory();

    $scope.addToSearchHistory = function (item) {
      HistoryService.addToSearchHistory(item);
    };
    $scope.removeFromSearchHistory = function (item) {
      HistoryService.removeFromSearchHistory(item);
    };
    $scope.clearSearchHistory = function () {
       var confirmPopup = $ionicPopup.confirm({
         title: 'Clear Search History?',
         template: 'Are you sure you want to delete all history?',
         buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Clear</b>',
                type: 'button-assertive',
                onTap: function(e) {
                  return true;
                }
            }]
       });

       confirmPopup.then(function (res) {
         if(res) HistoryService.clearSearchHistory();
       });
    };


    $scope.showItemAction = function (a, item) {
      a.stopPropagation(); 
      var hideSheet = $ionicActionSheet.show({
         buttons: [
           { text: 'Add Favorites' },
           { text: 'Add to Playlist' }
         ],
         titleText: item.title,
         cancelText: 'Cancel',
         cancel: function() {
         },
         buttonClicked: function(index) {
           if(index==0) {
            FavoriteService.addToFavorites(item);
           } else if(index == 1) {
            $scope.openPlaylistModal(item);
           }
           return true;
         }
       });
    }

    $ionicModal.fromTemplateUrl('add-to-playlists.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.playlistModal = modal;
    });
    $scope.openPlaylistModal = function(item) {
      $scope.playlists = LocalPlaylistService.all();
      $scope.video = item;
      $scope.playlistModal.show();
    };
    $scope.closePlaylistModal = function() {
      $scope.playlistModal.hide();
    };
    $scope.$on('$destroy', function() {
      $scope.playlistModal.remove();
    });

    $scope.addToFavorites = function (a,item) {
      a.stopPropagation(); 
      FavoriteService.addToFavorites(item);
      $scope.closePlaylistModal();
    };
    $scope.addToPlaylist = function (item, playlist) {
      LocalPlaylistService.addToPlaylist(item, playlist);
      $scope.closePlaylistModal();
    };

    $scope.createNewPlaylist = function() {
        $scope.playlist = {};
        var myPopup = $ionicPopup.show({
            template: '<input type="text" placeholder="Enter Playlist Name" ng-model="playlist.name">',
            title: 'Create Playlist',
            subTitle: '',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.playlist.name) {
                    e.preventDefault();
                  } else {
                    return $scope.playlist.name;
                  }
              }
            }
          ]
        });
        myPopup.then(function (res) {
          LocalPlaylistService.create(res);
        });
    };
    
})

/* // Search */

/* Favorites */

.controller('FavoritesCtrl', function($scope, $timeout, $cordovaKeyboard, $ionicPopup, $ionicLoading, $stateParams, VideoService, FavoriteService) {
 
    $scope.items = [];  
 
    $scope.doRefresh = function () {
      $timeout(function(){
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.items = FavoriteService.getFavorites();
      }, 500)
    }

    $scope.doRefresh();

    $scope.removeFromFavorites = function (item) {
      FavoriteService.removeFromFavorites(item);
    };
    $scope.clearFavorites = function () {
       var confirmPopup = $ionicPopup.confirm({
         title: 'Clear Your Favorites?',
         template: 'Are you sure you want to delete all favorites?',
         buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Clear</b>',
                type: 'button-assertive',
                onTap: function(e) {
                  return true;
                }
            }]
       });

       confirmPopup.then(function (res) {
         if(res) { 
          FavoriteService.clearFavorites(); 
          $scope.favorites = null;
         }
       });
    };
      
})

/* // Favorites */

/* Video */

.controller('VideoCtrl', function($scope, $sce, $ionicLoading, $httpParamSerializer, $cordovaMedia, $resource, $stateParams, $ionicPlatform, $cordovaFile, $cordovaFileTransfer, VideoService, VideoInfo, HistoryService) {

     var onInfoSuccess = function ( result ) {
      $scope.fileName = result.name;
      $scope.nativeURL = result.nativeURL;
      // read info
      $cordovaFile.readAsText(cordova.file.dataDirectory, result.name)
      .then(onInfoReadSuccess, onInfoReadError); 
    } 

    var onInfoError = function ( error ) {
      alert(JSON.stringify(error))
    } 

    var onInfoProgress = function ( progress ) {
        
    }    

    var onInfoReadSuccess = function ( success ) {
      var qs = decodeParams(success);
      
      alert(qs)
      $scope.title = qs.title;

      var streams = String(qs.url_encoded_fmt_stream_map).split(',');

      for(var i = 0; i < streams.length; i++){
            var stream = decodeParams(streams[i]);

            if(stream.quality == "medium") {
 
                var videoUrl = stream.url;
                $scope.video =   $sce.trustAsResourceUrl(videoUrl);
                var targetPath = cordova.file.dataDirectory + '' + id + '.mp4';
                  
            }
      }

      // delete info
      $cordovaFile.removeFile(cordova.file.dataDirectory, $scope.fileName)
      .then(onInfoRemoveSuccess, onInfoRemoveError);
    } 

    var onInfoReadError = function ( error ) {
       
    }

    var onInfoRemoveSuccess = function ( success ) {
       
    } 

    var onInfoRemoveError = function ( error ) {
       
    }
        
    document.addEventListener('deviceready', function () {
 
      var id = $stateParams.videoId;
      var url = "http://www.youtube.com/get_video_info?video_id="+ id
      var targetPath = cordova.file.dataDirectory + 'youplay_video_' + id;
      
       
      // download info
      $cordovaFileTransfer.download(url, targetPath, {}, true)
      .then(onInfoSuccess, onInfoError, onInfoProgress);

    }, false);
        
     

      
})

/* // Video */

/* Playlist */

.controller('PlaylistsCtrl', function($scope, $ionicPopup,$ionicListDelegate,  $ionicModal, $timeout, $cordovaDialogs, LocalPlaylistService, VideoService) {
     
    $scope.data = {
      showDelete: false
    };

    $scope.items = [];  
 
    $scope.doRefresh = function () {
      $timeout(function(){
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.items = LocalPlaylistService.all();
      }, 500)
    };

    $scope.doRefresh();
 
    $scope.removeItem = function (item) {
      var playlist = LocalPlaylistService.get(item.name);
      if(playlist.videos.length > 0) {
        var confirmPopup = $ionicPopup.confirm({
           title: 'Delete Playlist?',
           template: 'Are you sure you want to delete ' + item.name,
           buttons: [
                { text: 'Cancel' },
                {
                  text: '<b>Delete</b>',
                  type: 'button-assertive',
                  onTap: function(e) {
                    return true;
                  }
              }]
         });
         confirmPopup.then(function (res) {
           if(res) LocalPlaylistService.remove(item);
         });
       } else {
          LocalPlaylistService.remove(item);
       }
    };

    $scope.clearAll = function () {
       var confirmPopup = $ionicPopup.confirm({
         title: 'Clear All Playlist?',
         template: 'Are you sure you want to delete all playlist?',
         buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Clear</b>',
                type: 'button-assertive',
                onTap: function(e) {
                  return true;
                }
            }]
       });

       confirmPopup.then(function (res) {
         if(res) LocalPlaylistService.clear();
       });
    };

    $scope.createNew = function() {

        $scope.playlist = {};

        var myPopup = $ionicPopup.show({
            template: '<input type="text" placeholder="Enter Playlist Name" ng-model="playlist.name">',
            title: 'Create Playlist',
            subTitle: '',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.playlist.name) {
                    e.preventDefault();
                  } else {
                    return $scope.playlist.name;
                  }
              }
            }
          ]
        });

        myPopup.then(function (res) {
          LocalPlaylistService.create(res);
        });

    };

    $scope.editItem = function(item) {

        $scope.playlist = { name: item };

        var myPopup = $ionicPopup.show({
            template: '<input type="text" placeholder="Enter Playlist Name" ng-model="playlist.name">',
            title: 'Edit Playlist',
            subTitle: '',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.playlist.name) {
                    e.preventDefault();
                  } else {
                    return $scope.playlist.name;
                  }
              }
            }
          ]
        });

        myPopup.then(function (res) {
           LocalPlaylistService.edit(item, res);
           $ionicListDelegate.closeOptionButtons();
        });

      return false;
    };

})

/* // Playlists */

/* Playlists.Playlist */

.controller('PlaylistCtrl', function($scope, $stateParams, $ionicPopup, $ionicModal, $timeout, $cordovaDialogs, LocalPlaylistService, VideoService) {

    $scope.data = {
      showDelete: false,
      playing: false
    };

    $scope.showEdit = function () {
      $showDeleteButton = true;
      return true;
    }
    
    $scope.doRefresh = function () {
      $scope.$broadcast('scroll.refreshComplete');
      $scope.playlist = LocalPlaylistService.get($stateParams.playlist);
    }

    $scope.doRefresh();

    $scope.removeFromPlaylist = function (playlist, video) {
      return LocalPlaylistService.removeFromPlaylist(playlist, video);
    };
    
    $scope.clearPlaylist = function (playlist) {
       var confirmPopup = $ionicPopup.confirm({
         title: 'Clear This Playlist?',
         template: 'Are you sure you want to delete all videos from the list?',
         buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Clear</b>',
                type: 'button-assertive',
                onTap: function(e) {
                  return true;
                }
            }]
       });

       confirmPopup.then(function (res) {
         if(res) LocalPlaylistService.clearPlaylist(playlist);
       });
    };

})

/* // Playlists.Playlist */

/* History */

.controller('HistoryCtrl', function($scope, $ionicLoading, $cordovaKeyboard, $ionicPopup, $timeout, VideoService, HistoryService) {
     
    $scope.items = [];  
 
    $scope.doRefresh = function () {
      $timeout(function(){
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.items = HistoryService.getAllWatchHistory();
      }, 500)
    }

    $scope.doRefresh();

    
    $scope.removeFromWatchHistory = function (item) {
      HistoryService.removeFromWatchHistory(item);
    };
    $scope.clearWatchHistory = function () {
       var confirmPopup = $ionicPopup.confirm({
         title: 'Clear Watch History?',
         template: 'Are you sure you want to delete all history?',
         buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Clear</b>',
                type: 'button-assertive',
                onTap: function(e) {
                  return true;
                }
            }]
       });
       confirmPopup.then(function (res) {
         if(res) { 
          HistoryService.clearWatchHistory(); 
          $scope.watchHistory = null;
         }
       });
    }; 

})

/* // History */

'use strict';
 
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function decodeParams(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};