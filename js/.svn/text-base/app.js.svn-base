// Ionic Starter App

angular.module('starter', ['ionic','starter.controllers', 'starter.services','gmap'])

    .run(function($ionicPlatform) {

        $ionicPlatform.registerBackButtonAction(function(e){
            //do your stuff
            e.preventDefault();
            return false;
        },101);

        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })

    .config(function($stateProvider, $urlRouterProvider)
    {
        $stateProvider

            //***************************************************************************************
            // Modal Find Cab
            //***************************************************************************************

            //*******************************
            // From Address
            //*******************************
            .state('home',
            {
                url: '/home',
                views:
                {
                    '': { templateUrl: 'templates/home.html'},
                    'navable-modal@': { templateUrl: 'templates/from-address.html' },
                    'navable-modal-menu@': { templateUrl: 'templates/sign-in-modal.html', controller: 'SignInCtrl' },
                    'navable-modal-perfil@': { templateUrl: 'templates/perfil.html', controller:'PerfilCtrl'}
                }
            })

            //*******************************
            // Login
            //*******************************
            .state('home.sign-in',
            {
                url: '/sign-in',
                views:
                {
                    '': { templateUrl: 'templates/home.html' },
                    'navable-modal@': { templateUrl: 'templates/sign-in-modal.html', controller: 'SignInCtrl' }
                }
            })

            //*******************************
            // Create Account
            //*******************************
            .state('home.create-account',
            {
                url: '/create-account',
                views:
                {
                    '': { templateUrl: 'templates/home.html' },
                    'navable-modal@': { templateUrl: 'templates/create-account-modal.html', controller: 'SignUpCtrl' },
                    'navable-modal-menu@': { templateUrl: 'templates/create-account-modal.html', controller: 'SignUpCtrl' }
                }
            })

            //*******************************
            // Recover Password
            //*******************************
            .state('home.recover-password',
            {
                url: '/recover-password',
                views:
                {
                    '': { templateUrl: 'templates/home.html' },
                    'navable-modal@': { templateUrl: 'templates/recover-password.html', controller: 'PassCtrl' },
                    'navable-modal-menu@': { templateUrl: 'templates/recover-password.html', controller: 'PassCtrl' }
                }
            })

            //*******************************
            // Edit Profile
            //*******************************
            .state('home.edit-perfil',
            {
                url: '/edit-perfil',
                views:
                {
                    '': { templateUrl: 'templates/home.html' },
                    'navable-modal-perfil@': { templateUrl: 'templates/edit-profile.html', controller: 'PerfilCtrl' }
                }
            })

            //*******************************
            // Delete Profile
            //*******************************
            .state('home.delete-perfil',
            {
                url: '/delete-perfil',
                views:
                {
                    '': { templateUrl: 'templates/home.html' },
                    'navable-modal-perfil@': { templateUrl: 'templates/delete-account.html', controller: 'DeletePerfilCtrl' }
                }
            })

            //*******************************
            // Change Password
            //*******************************
            .state('home.change-password',
            {
                url: '/change-password',
                views:
                {
                    '': { templateUrl: 'templates/home.html' },
                    'navable-modal-perfil@': { templateUrl: 'templates/change-password.html', controller: 'PassCtrl' }
                }
            })

            //*******************************
            // Fing Cab
            //*******************************
            .state('home.find-cab',
            {
                url: '/find-cab',
                views:
                {
                    '': { templateUrl: 'templates/home.html' },
                    'navable-modal@': { templateUrl: 'templates/find-cab.html' , controller:'FindCab'}
                }
            })

            //*******************************eaglegranlin@gmail.com
            // Cab Found
            //*******************************
            .state('home.cab-found',
            {
                url: '/cab-found',
                views:
                {
                    '': { templateUrl: 'templates/home.html' },
                    'navable-modal@': { templateUrl: 'templates/cab-found.html' ,controller:'CabFound'}
                }
            })

            //*******************************
            // Rate Driver
            //*******************************
            .state('home.rate-driver',
            {
                url: '/rate-driver',
                views:
                {
                    '': { templateUrl: 'templates/home.html' },
                    'navable-modal@': { templateUrl: 'templates/rate-driver.html' }
                }
            })

            .state('search', {
                url: '/search',
                templateUrl: 'templates/search.html'
            })

            .state('recover-password', {
                url: '/recover-password',
                templateUrl: 'templates/recover-password.html'/*,
                 controller: 'ListCtrl'*/
            });

        $urlRouterProvider.otherwise('/home');
    })

    //Services
    .service('sharedVariables', function() {
        this.showSecondMap = {};  //Used by gmaps
    });