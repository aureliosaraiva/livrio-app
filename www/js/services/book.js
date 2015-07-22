angular.module('starter.services',[])
.factory('BOOK', ['$rootScope', '$http', '$q', '$ionicPopup',  '$ionicLoading', '$cordovaToast', '$cordovaCamera', '$ionicActionSheet', '$state', '$filter', 'settings', function($rootScope, $http, $q, $ionicPopup, $ionicLoading, $cordovaToast, $cordovaCamera, $ionicActionSheet, $state, $filter, settings) {

    var self = this;

    var trans = $filter('translate');

    


    self.delete = function(book) {
        $ionicPopup.confirm({
            title: trans('book.question_delete'),
            cancelText: trans('book.question_delete_no'),
            okText: trans('book.question_delete_yes'),
            template: book.title
        }).then(function(res) {
            if (res) {
                $ionicLoading.show({
                    template: trans('book.wait_delete')
                });
                book.removed = true;
                $http.delete(settings.URL.BOOK + "/" + book.id)
                .success(function(response) {
                    $ionicLoading.hide();
                    if (!response.errors) {
                        $cordovaToast.showLongBottom(trans('book.toast_delete')).then(function() {});
                        window.location = "#/app/library";
                        $rootScope.$emit("library.refresh");
                    }
                    else {
                        $ionicPopup.alert({
                            template: trans('book.msg_delete_lock')
                        }).then(function() {});
                    }
                })
                .error(function() {
                    $ionicLoading.hide();
                    console.log("TRATAR ERROR");
                    book.removed = false;
                    $rootScope.$emit("error.http");
                });
            }
        });

    };





    self.view = function(id) {
        var deferred = $q.defer();
        $http.get(settings.URL.BOOK + "/" + id)
        .success(function(response) {
            if (!response.errors) {
                response.data.author = response.data.author.join(", ");
                deferred.resolve(response.data);
            }
            else {
                deferred.reject();
            }
        })
        .error(function() {
            deferred.reject();
            console.log("TRATAR ERROR");
        });
        return deferred.promise;
    };

    self.update = function(book) {
        $rootScope.bookUpdate = book;
        window.location = "#/app/book-form/" + book.id;
    };


    self.all = function(params) {
        params = params || {};

        params.sort = 'title';
        params.order = 'asc';
        var deferred = $q.defer();
        $http.get(settings.URL.BOOK, {
            params: params
        })
        .success(function(response) {
            if (!response.errors) {
                var library = [];
                angular.forEach(response.data, function(item) {

                    item.author = item.author.join(", ");
                    library.push(item);
                });
                deferred.resolve(response.data);
            }
            else {
                deferred.resolve([]);
            }
        })
        .error(function() {
            deferred.resolve([]);
            console.log("TRATAR ERROR");
        });
        return deferred.promise;
    };


    self.requestReturn = function(book) {
        var deferred = $q.defer();
        $http.post(settings.URL.BOOK + "/" + book.id + "/request-return")
        .success(function(response) {
            if (!response.errors) {
                $cordovaToast.showLongBottom(trans('book.toast_request_return')).then(function() {});
                deferred.resolve();
            }
            else if (response.errors[0].code === 301) {
                $cordovaToast.showLongBottom(trans('book.toast_request_duplicate')).then(function() {});
            }
            else {
                deferred.reject();
            }
        })
        .error(function() {
            deferred.reject();
        });
        return deferred.promise;
    };


    

    self.persistCover = function(book, cover) {
        var deferred = $q.defer();
        var post = {
            cover_source: cover
        };

        $http.put(settings.URL.BOOK + "/" + book.id, post)
        .success(function(response) {

            if (!response.errors) {
                $cordovaToast.showLongBottom(trans('book.toast_cover_update')).then(function() {});
                $rootScope.$emit("library.refresh");
                deferred.resolve(response.data.thumb);
            }
            else {
                deferred.reject();
            }
        })
        .error(function() {
            deferred.reject();
        });

        return deferred.promise;
    };


    self.changeCover = function(book, autosave) {
        var deferred = $q.defer();
        $ionicActionSheet.show({
            buttons: [
                { text: "<i class=\"icon ion-android-camera\"></i> " + trans('book.sheet_photo') },
                { text: "<i class=\"icon ion-image\"></i> " + trans('book.sheet_picture')}
            ],
            titleText: trans('book.sheet_title') + book.title,
            buttonClicked: function(index) {

                var sourceType = index === 0 ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY;
                var options = {
                    quality: 75,
                    destinationType: Camera.DestinationType.DATA_URL,
                    sourceType: sourceType,
                    allowEdit: true,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 150,
                    targetHeight: 210,
                    correctOrientation: false,
                    saveToPhotoAlbum: false
                };

                $cordovaCamera.getPicture(options).then(function(imageData) {
                    if (autosave) {
                        self.persistCover(book, imageData)
                        .then(function(url) {
                            deferred.resolve(url);
                        },
                        function() {
                            deferred.reject();
                        });
                    }
                    else {
                        deferred.resolve(imageData);
                    }

                }, function(err) {
                    deferred.reject();
                });

                return true;
            }
        });
        return deferred.promise;
    };

    self.menuAction = function(event, book) {
        console.log(arguments);
        event.stopPropagation();

        var options = [
                { text: "<i class=\"icon ion-edit\"></i> " + trans('book.sheet_update') },
                { text: "<i class=\"icon ion-android-image\"></i> " + trans('book.sheet_change_cover') }
            ];

        if (book.loaned) {
            options.push({ text: "<i class=\"icon ion-arrow-swap\"></i> " + trans('book.sheet_request_return') });
        }
        else {
            options.push({ text: "<i class=\"icon ion-arrow-swap\"></i> " + trans('book.sheet_loan') });
        }

        $ionicActionSheet.show({
            buttons: options,
            destructiveText: "<i class=\"icon ion-trash-a\"></i> " + trans('book.sheet_delete'),
            titleText: book.title,
            cancelText: trans('book.sheet_cancel'),
            destructiveButtonClicked: function() {
                self.delete(book);
                return true;
            },
            buttonClicked: function(index) {
                if (index === 0) {
                    self.update(book);
                }
                else if (index === 1) {
                    self.changeCover(book, true)
                    .then(function(url) {
                        book.thumb = url;
                    });
                }
                else if (index === 2) {
                    if (book.loaned) {
                        self.requestReturn(book);
                    }
                    else {
                        $state.go('app.loanAdd',{
                            id: book.id
                        });
                    }
                }
                return true;
            }
        });
    };

    return self;


}]);
