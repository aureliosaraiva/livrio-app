"use strict";

angular.module('livrio.controllers')
.controller('config_ctrl', function( $scope, $rootScope, $http, settings) {

    var user = $rootScope.user;

    $scope.config = user.config || {};

    $scope.onChangeField = function() {
        var post = {
            config: $scope.config
        };

        console.log(post)
        $http.patch(toRouter('/accounts/update'), post)
        .success(function(response) {
            // window.localStorage.user = JSON.stringify(response.data);
            // $rootScope.user = response.data;
        });
    };
});
