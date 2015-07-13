angular.module('starter.controllers')

.controller('loanAddCtrl', function($scope, $rootScope, $ionicHistory, $http, $ionicPopup, FRIEND, LOAN, settings) {


    var book = $rootScope.bookView;
    $scope.loading = true;

    $scope.loadText = 'Carregando';

    $scope.friends = [];

    $scope.onRefresh = function() {
        FRIEND.all()
        .then(function(data) {
            $scope.friends = data;
            $scope.loading = false;
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.doLoan = function(user) {

        var values = [];

        for (var i = 1;i <= 10;i++) {
            values.push("<option value=\"" + i + "\">" + i + "</option>");
        }

        $scope.day = 1;
        $scope.type = 1;

        var tpl = [
            "<div class=\"duration\"><select ng-model=\"type\">",
                "<option value=\"1\">Dia",
                "<option value=\"7\">Semana",
                "<option value=\"30\">Mês",
            "</select>",

            "<select ng-model=\"day\">",
                values.join(''),
            "</select></div>"

        ];

        // An elaborate, custom popup
        $ionicPopup.show({
            title: "Duração do emprestimo",
            template: tpl.join(''),
            cssClass: 'popup-loan',
            scope: $scope,
            buttons: [
                { text: "não" },
                {
                    text: "Emprestar",
                    onTap: function(e) {
                        var days = parseInt($scope.day,10) * parseInt($scope.type,10);


                        $scope.loadText = 'Emprestando';
                        $scope.loading = true;
                        LOAN.add(book.id, user.id, days,'sent')
                        .then(function(book) {
                            $scope.loading = false;
                            $scope.loadText = 'Carregando';
                            $rootScope.bookView.loaned = book.loaned;
                            window.location = '#/app/book/' + book.id;
                        },
                        function() {
                            $scope.loading = false;
                            $scope.loadText = 'Carregando';
                        });
                    }
                }
            ]
        }).then(function(res) {});
    };

    $scope.onRefresh();
});
