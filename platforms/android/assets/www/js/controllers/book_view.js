angular.module('livrio.controllers')

.controller('book_view_ctrl', function($scope, $rootScope, $stateParams, BOOK, LOAN) {

    var id = $stateParams.id;

    function loadData() {
        $scope.loading = true;
        var book;
        BOOK.view(id)
        .then(function(data) {
            $scope.loading = false;
            book = $rootScope.bookView = data;
        });
    }

    loadData();

    $rootScope.$on("book.view.refresh",function() {
        loadData();
    });


    $scope.onLike = function(book) {
        BOOK.like(book)
        .then(function(data) {
            if (data){
                book.is_like = !book.is_like
            }
        });
    };

    $scope.onRequestLoan = function(book) {
        LOAN.requestLoan(book);
    };

    $scope.onActionBook = function(event, item) {
        $rootScope.tmp_book_update = item;
        BOOK.menuAction(event, item);
    };

});
