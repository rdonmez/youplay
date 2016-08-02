var key = "AIzaSyApJqi1SwaVoGSIuIH8qaHARcDNlT_DAM4";

var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

angular.module('starter.services', [])

.factory("VideoService", function($http, $q) {
  $http.defaults.useXDomain = true;

  function onSuccess(response) {
    console.log("ok:")
    console.log(response);
  }

  function onFailure(response) {
    
  }

  return {
    search: function (params) {
      var url = "https://www.googleapis.com/youtube/v3/search";
      params.key = key;
      params.part = 'id,snippet';
      params.type = "video";
      return $http.get(url, { params: params }).then(function (response) {
          result = response.data;
          return result;
      }, onFailure);
    },
    autocomplete: function (q) {
      var url = 'http://suggestqueries.google.com/complete/search?';
      url += 'client=youtube&callback=JSON_CALLBACK&client=firefox&key='+key+'&q=' 
      url += encodeURIComponent(q);
      
      return $http({
        url: url,
        method: 'JSONP',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).then(function (response){
          return response.data[1];
      }, onFailure);
    },
    list: function (params) {
      var url = "https://www.googleapis.com/youtube/v3/videos";
      params.key = key;
      return $http.get(url, { params: params }).then(function (response){
          result = response.data;
          return result;
      }, onFailure);
    },
    get: function (params) {
      var url = "https://www.googleapis.com/youtube/v3/videos";
      params.key = key;
      return $http.get(url, { params: params }).then(function (response){
          result = response.data;
          return result;
      }, onFailure);
    },
    createPlaylist: function(playlistId) {
       return null;
    },
    removePlaylist: function(playlistId) {
       return null;
    },
    getPlaylist: function(playlistId) {
      return null;
    }
  }
})

.factory("VideoInfo", function ($resource, getHeaderFilename){
  return $resource('http://www.youtube.com/get_video_info', { video_id: '@id' }, {
    download: { 
      method: 'GET', 
      responseType: 'arraybuffer',
      headers: {
         
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Accept, Content-Type, Origin',
          'Access-Control-Allow-Credential': true,
           'Accept': 'text/plain'
        },
      transformResponse: function(data, headers) {
        return {
          data: data,
          filename: getHeaderFilename(headers)
        }
      }
    }
  });
})
 
.service('getHeaderFilename', function() {  
  return function(headers) {
    var header = headers('content-disposition');
    var result = header.split(';')[1].trim().split('=')[1];
    return result.replace(/"/g, '');
  }
})
.service('resourceError', function($q) {  
  var arrayBufferToString = function(buff) {
    var charCodeArray = Array.apply(null, new Uint8Array(buff));
    var result = '';
    for (i = 0, len = charCodeArray.length; i < len; i++) {
        code = charCodeArray[i];
       result += String.fromCharCode(code);
    }
    return result;
  }

  return function(error) {
    error.data = angular.fromJson(arrayBufferToString(error.data.data));
    return $q.reject(error);
  }
})

.factory ("HistoryService", function ($localStorage) {
  $localStorage = $localStorage.$default({
    searchHistory: [],
    watchHistory: []
  });

  var getAllSearchHistory = function () {
    return $localStorage.searchHistory;
  };
  var addToSearchHistory = function (item) {
    if(item != undefined && item.trim() != "") {

      if($localStorage.searchHistory.indexOf(item) > -1) 
        $localStorage.searchHistory.splice($localStorage.searchHistory.indexOf(item), 1);

      if($localStorage.searchHistory.length > 1000) $localStorage.searchHistory.pop();

      $localStorage.searchHistory.unshift(item);
    }
  }
  var removeFromSearchHistory = function (item) {
    $localStorage.searchHistory.splice($localStorage.searchHistory.indexOf(item), 1);
  }
  var clearSearchHistory =  function () {
    $localStorage.searchHistory.splice(0, $localStorage.searchHistory.length)
  }

  var getAllWatchHistory = function () {
    return $localStorage.watchHistory;
  };
  var addToWatchHistory = function (item) {
    item.id = item.id.videoId || item.id;
    if( item != undefined && indexOf($localStorage.watchHistory, item.id, "id") == -1) {
      if($localStorage.watchHistory.length > 1000) $localStorage.watchHistory.pop();
      $localStorage.watchHistory.unshift(item);
    } else {
      var index = indexOf($localStorage.watchHistory, item.id, "id")
      $localStorage.watchHistory.splice(index, 1);
      $localStorage.watchHistory.unshift(item);
    }

  }
  var removeFromWatchHistory = function (item) {
    var index = indexOf($localStorage.watchHistory, item.id, "id")
    $localStorage.watchHistory.splice(index, 1);
  }
  var clearWatchHistory =  function () {
    $localStorage.watchHistory.splice(0, $localStorage.watchHistory.length)
  }

  return {
      getAllSearchHistory: getAllSearchHistory,
      addToSearchHistory: addToSearchHistory,
      removeFromSearchHistory: removeFromSearchHistory,
      clearSearchHistory: clearSearchHistory,

      getAllWatchHistory: getAllWatchHistory,
      addToWatchHistory: addToWatchHistory,
      removeFromWatchHistory: removeFromWatchHistory,
      clearWatchHistory: clearWatchHistory
  };

})

.factory ("LocalPlaylistService", function ($localStorage) {

  $localStorage = $localStorage.$default({
    playlists: []
  });

  var all = function () {
    return $localStorage.playlists;
  };

  var get = function (name) {
    var pindex = indexOf($localStorage.playlists, name, "name");
    return $localStorage.playlists[pindex];
  };

  var create = function (name) {
    var playlist = { name: name, videos: [] };
    var index = indexOf($localStorage.playlists, playlist.name, "name");
    if( name != undefined && index == -1) {
      if($localStorage.playlists.length > 1000) 
        $localStorage.playlists.pop();
      $localStorage.playlists.unshift(playlist);
    }
  }
  var remove = function (name) {
    var index = indexOf($localStorage.playlists, name, "name");
    if(index > -1)
      $localStorage.playlists.splice(index, 1);
  }

  var edit = function (old, name) {
    var index = indexOf($localStorage.playlists, old, "name");
    if(old != undefined && old.trim() != "" && name != undefined && name.trim() != "")
      $localStorage.playlists[index].name = name;
  }

  var clear = function () {
    $localStorage.playlists.splice(0, $localStorage.playlists.length)
  }
   
  var addToPlaylist = function(video, playlist) {
    video.vid = video.id.videoId || video.id;
    var pindex = indexOf($localStorage.playlists, playlist.name, "name");
    var playlist = $localStorage.playlists[pindex];
    var vindex = indexOf(playlist.videos, video.vid, "vid");
    if( video != undefined && vindex == -1) {
      playlist.videos.unshift(video);
    } else {
      playlist.videos.splice(vindex, 1);
      playlist.videos.unshift(video);
    }
  } 
   
  var removeFromPlaylist = function(playlist, video) {
    var pindex = indexOf($localStorage.playlists, playlist.name, "name");
    var playlist = $localStorage.playlists[pindex];
    var vindex = indexOf(playlist.videos, video.vid, "vid");
    if( video != undefined && vindex > -1) {
      playlist.videos.splice(vindex, 1);
    }
  }

  var clearPlaylist = function(playlist) {
    var pindex = indexOf($localStorage.playlists, playlist.name, "name");
    var playlist = $localStorage.playlists[pindex];
    playlist.videos.splice(0, playlist.videos.length);
  }
 
  return {
      all: all,
      get: get,
      create: create,
      remove: remove,
      edit: edit,
      clear: clear,
      addToPlaylist: addToPlaylist,
      removeFromPlaylist: removeFromPlaylist,
      clearPlaylist: clearPlaylist
  };

})

.factory ("FavoriteService", function ($localStorage, $window) {

  $localStorage = $localStorage.$default({
    favorites: []
  });

  var getFavorites = function () {
    return $localStorage.favorites;
  }

  var addToFavorites = function (item) {
    item.vid = item.id.videoId || video.vid;
    if( item != undefined && indexOf($localStorage.favorites, item.vid, "vid") == -1) {
      if($localStorage.favorites.length > 1000) $localStorage.favorites.pop();
      $localStorage.favorites.unshift(item);
    }
  }

  var removeFromFavorites = function (item) {
    item.vid = item.id.videoId || video.vid;
    var index = indexOf($localStorage.favorites, item.vid, "vid");
    if(index > -1)
      $localStorage.favorites.splice(index, 1);
  } 

  var clearFavorites =  function () {
    $localStorage.favorites.splice(0, $localStorage.favorites.length)
  }
   
  return {
      getFavorites: getFavorites,
      addToFavorites: addToFavorites,
      removeFromFavorites: removeFromFavorites,
      clearFavorites: clearFavorites,
  };

})


 

function indexOf(arr, term, prop) {
    for(var i = 0, len = arr.length; i < len; i++) {
        if (arr[i][prop] === term) return i;
    }
    return -1;
}
