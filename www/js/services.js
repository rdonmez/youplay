var key = "AIzaSyApJqi1SwaVoGSIuIH8qaHARcDNlT_DAM4";

angular.module('starter.services', [])

.factory("VideoService", function($http) {
  return {
    search: function (q) {
      var url = "https://www.googleapis.com/youtube/v3/search?q="+ q +"&part=snippet&maxResults=25&type=video&key="+ key;
      return $http.get(url).then(function (response){
          result = response.data;
          return result;
      });
    },
    searchMore: function (q, nextPageToken) {
      var url = "https://www.googleapis.com/youtube/v3/search?q="+ q +"&part=snippet&maxResults=25&&type=video&key="+ key +"&nextPageToken="+ nextPageToken;
      return $http.get(url).then(function (response){
          result = response.data;
          return result;
      });
    },
    get: function (id) {
      return $http.get("https://www.googleapis.com/youtube/v3/videos?id="+ id +"&part=id,snippet,contentDetails,statistics&key="+ key).then(function (response){
          result = response.data;
          return result;
      });
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
