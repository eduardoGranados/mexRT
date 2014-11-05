angular.module('starter.controllers', ['starter.services'])

    //***************************************************************************************************************************
    // Home Controller
    //***************************************************************************************************************************
    .controller('HomeCtrl', function($rootScope, $scope, API, $ionicModal, $state)
    {
        if ($rootScope.isSessionActive())
        {
            $('#btn_login').css('display','none');
            $('#btn_logout').css('display','block');
            $('#btn_perfil').css('display','block');
        }

        //**************************************************************************************************************
        // Modales
        //**************************************************************************************************************
        // Find Cab
        $ionicModal.fromTemplateUrl('get-from-address.html', { scope: $scope, animation: 'slide-in-left' , backdropClickToClose: false, hardwareBackButtonClose : false})
            .then(function (modal)
            {
                $scope.modal = modal;
            });

        // Menu Login
        $ionicModal.fromTemplateUrl('get-menu-login.html', { scope: $scope, animation: 'slide-in-left' })
            .then(function (modal_menu)
            {
                $scope.modal_menu = modal_menu;
            });

        // Menu Perfil
        $ionicModal.fromTemplateUrl('get-menu-perfil.html', { scope: $scope, animation: 'slide-in-left' })
            .then(function (modal_perfil)
            {
                $scope.modal_perfil = modal_perfil;
            });
        $rootScope.showNewTask = function() {
            $('#locating').css('display','none');
            $('#not-locating').css('display','block');
            navigator.geolocation.clearWatch($rootScope.watch_location);
            $scope.modal.show();
        };

        $rootScope.cancelFindTaxi= function() {
            $rootScope.closeNewTask();
            $scope.cabArray = [];
            if($rootScope.req != ''){
                $rootScope.socket.emit('cancelled', $rootScope.req );
            }
        };
        // Close the modals
        $rootScope.closeNewTask = function() {
            $scope.modal.hide();
            $scope.modal_menu.hide();
            $scope.modal_perfil.hide();
            $state.go('home');
        };

        $scope.goState = function (state) {
            $state.go(state);
        };

        $rootScope.hideNewTask = function() {
            $scope.modal.hide();
            $scope.modal_menu.hide();
        };

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
            $scope.modal_menu.remove();
        });

        $scope.rate = 0;
        $scope.max = 5;

        $rootScope.getCurrentAddress =   function(){
            return $('#address-label').html();
        };
        $rootScope.setPointOfRef =   function(){

            $rootScope.por = $('#reference-point').val();
            if($rootScope.por == ''){
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Please provide a reference point near to your place...</p>');
            }else{
                $rootScope.goState('home.sign-in');
            }


        };


    })
    //***************************************************************************************************************************
    // findCab Controller
    //***************************************************************************************************************************
    .controller('FindCab', function ($rootScope, $scope, API, $window, $state,$http,$timeout) {

        var userPosition = $rootScope.map.getCenter();
        var auxPosition;
        var request;
        var directionsService = new google.maps.DirectionsService();
        var resp = [];
        var i;  //index

        var base = "http://groupmwt.com/garzablanca/DBOff/Angular/ajax/";

        $http.post(base+"getAllDrivers.php")
            .success(function(data){
                $scope.cabArray=[];
                //If there is no taxi right now
                if(data==''){

                    $timeout(function() {
                        $rootScope.notify('There is no Taxi available at the moment, please try again later');
                        $rootScope.closeNewTask();
                        return;
                    }, 6000);
                }
                //If client gets rejected
                $rootScope.socket.on('reject_client', function (msg) {
                    //Sorted array of taxis
                    $scope.cabArray.splice(0,1);
                    if($scope.cabArray!=''){
                        $rootScope.req = {'clientId':$rootScope.getUId(), 'cabId':$scope.cabArray[0].id, 'address':$rootScope.getCurrentAddress(), 'ref': $rootScope.por};
                        $rootScope.socket.emit('search_cab', $rootScope.req );
                    }else{
                        $rootScope.notify('There is no Taxi available at the moment, please try again later');
                        $rootScope.closeNewTask();
                        return;
                    }
                });

                var counter = 1;

                for (i = 0; i < data.length; ++i) {
                    auxPosition = new google.maps.LatLng(data[i].latitude, data[i].longitude);
                    request = {
                        origin: auxPosition,
                        destination: userPosition,
                        travelMode: google.maps.TravelMode['DRIVING'],
                        region: data[i].id
                    };
                    directionsService.route(request, function(response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {

                            $scope.cabArray[counter-1]={'id':response.mc.region, 'distance':response.routes[0].legs[0].distance.value};

                            if(resp == ''){
                                resp.push(response.mc.region);
                                resp.push(response.routes[0].legs[0].distance.value);
                            }else if(resp[1] > response.routes[0].legs[0].distance.value){  //Finding the closest cab
                                resp = [];
                                resp.push(response.mc.region);
                                resp.push(response.routes[0].legs[0].distance.value);
                            }
                            // Find closest taxi then we create a socket to communicate
                            if(counter++ == data.length){

                                $scope.cabArray.sort(function(a, b){
                                    if(a.distance < b.distance) return -1;
                                    if(a.distance >= b.distance) return 1;
                                    return 0;
                                });
                                $rootScope.req = {'clientId':$rootScope.getUId(), 'cabId':resp[0], 'address':$rootScope.getCurrentAddress(), 'ref': $rootScope.por};
                                $rootScope.socket.emit('search_cab', $rootScope.req );

                            }
                        }
                    })
                }

            }).error(function(data){
                console.log("error>"+data);
            });

    })

    .controller('CabFound', function ($rootScope, $scope, $window, $state,$ionicPopup) {
        $rootScope.finishRide = function()
        {
            var finishRidePopup = $ionicPopup.confirm(
                {
                    title: 'Ride Finished',
                    template: 'Are you sure?',
                    okText: 'Yes',
                    cancelText: 'No'
                });
            finishRidePopup.then(function(res) {
                if(res)
                {
                    finishRidePopup.close();
                    $rootScope.setMainMap();
                    $rootScope.closeNewTask();
                }else
                {
                    finishRidePopup.close();
                }
            });
        }
    })


    //***************************************************************************************************************************
    // Sign In Controller
    //***************************************************************************************************************************
    .controller('SignInCtrl', function ($rootScope, $scope, API, $window, $state) {


        //Init Socket
        $rootScope.init_socket = function() {

            var info = [];
            $rootScope.socketCreated = 1;
            $rootScope.socket = io.connect('http://206.190.152.224:3001', {'transports': [ 'polling', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']});

            $rootScope.socket.on('connect', function () {

                info.push($rootScope.getUId());
                info.push('user');
                $rootScope.socket.emit('new_client', info);

                info = [];
            });

            $rootScope.socket.on('taxi_found', function (msg) {
                $rootScope.taxiID= msg.cabId;
                $rootScope.taxiDriver= msg.info.name;
                $rootScope.taxiPhone= msg.info.phone;
                $rootScope.taxiModel= msg.info.model;
                $rootScope.taxiPlate= msg.info.plate;
                $rootScope.taxiNumber= msg.info.number;
                $state.go('home.cab-found');
            });
            $rootScope.socket.on('alert_client', function (msg) {
                window.plugin.notification.local.add({
                    id:      1,
                    title:   'Taxi has Arrived',
                    message: 'Taxi no.'+msg.cabNumber+' has Arrived.'
                });
                $rootScope.notify('Taxi no.'+msg.cabNumber+' has Arrived.');
            });

            //$rootScope.socket.on('disconnect', function () {
            //});
        };


        //Token Password: "7z%*-+W-"

        // Se Realiza el Check para Validar si el Usuario ya esta Logeado...
        if ($rootScope.isSessionActive()) {
            //Create socket

            if($rootScope.socketCreated != 1){
                $rootScope.init_socket();
            }


            if($state.current.name=="home.sign-in")
            {
                //console.log("Band:", $state.current.name);
                $('#btn_login').css('display','none');
                $('#btn_logout').css('display','block');
                $('#btn_perfil').css('display','block');
                $state.go('home.find-cab');

            }
        }
        else
        {
            $rootScope.ifValue = true;
        }

        // limpiamos las Variables Email y Password con las que Vamos a Trabajar
        $scope.user = {
            email: "",
            password: ""
        };

         // Close the new task modal
        $rootScope.closeNewTask = function() {
            $scope.modal.hide();
            $scope.modal_menu.hide();
            $scope.modal_perfil.hide();
            $state.go('home');
        };

        // Validamos los Datos del Usuario
        $scope.validateUser = function ()
        {
            var email = this.user.email;
            var password = this.user.password;

            if(!email || !password)
            {
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Please fill in all the required fields...</p>');
                return false;
            }

            $rootScope.show('<i class="ion-loading-a" style="font-size: 30px;"></i><br><br><p>Please wait...</p>');

            API.signin({
                email: email,
                password: calcMD5(password+"ZrX@s5AF*7zu")
            })
                .success(function (data)
                {
                    // Datos del Usuario Retornados desde El Servidor
                    // console.log('Data in Controller Signin:', data);

                    if(!data)
                    {
                        $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Error caused by:<br>1.- Wrong information.<br>2.- Unverified account.</p>');
                        return false;
                    }

                    // Creamos la Sesion
                    $rootScope.setToken(data[0].first_name, data[0].last_name, data[0].email, data[0].phone, data[0].type, data[0].id);

                    // Ocultamos el Aviso de Conectando y redireccionamos a la Pagina de Inicio
                    $rootScope.hide();
                    if($state.current.name=="home.sign-in")
                    {
                        //console.log("Band:", $state.current.name);
                        $('#btn_login').css('display','none');
                        $('#btn_logout').css('display','block');
                        $('#btn_perfil').css('display','block');
                        $state.go('home.find-cab');
                    }
                    else
                    {
                        $('#btn_login').css('display','none');
                        $('#btn_logout').css('display','block');
                        $('#btn_perfil').css('display','block');
                        //console.log("Band:", $state.current.name);
                        $state.go('home');
                        $scope.modal_menu.hide();


                        if($rootScope.socketCreated != 1){
                            $rootScope.init_socket();
                        }

                    }
                    //$window.location.href = ('#/home.find-cab');
                })
                .error(function (error)
                {
                    $rootScope.hide();
                    $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Wrong information, please try again.</p>');
                });
        }
    })

    //***************************************************************************************************************************
    // Sign Up Controller
    //***************************************************************************************************************************
    .controller('SignUpCtrl', function ($rootScope, $scope, API, $window, $state) {
        $scope.user = {
            first_name: "",
            last_name:"",
            email: "",
            phone:"",
            password1: "",
            password2: ""
        };

        $scope.createUser = function () {
            var su_fname = this.user.first_name;
            var su_lname = this.user.last_name;
            var su_email = this.user.email;
            var su_phone = this.user.phone;
            var su_pass1 = this.user.password1;
            var su_pass2 = this.user.password2;

            if( !su_fname || !su_email || !su_pass1 || !su_pass2 || !su_phone ) {
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Please fill in all the required fields. (*)</p>');
                return false;
            }

            if(su_pass1 != su_pass2) {
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Passwords must match.</p>');
                return false;
            }

            $rootScope.show('<i class="ion-loading-a" style="font-size: 30px;"></i><br><br><p>Please wait....</p>');

            API.signup({
                fname: su_fname,
                lname: su_lname,
                email: su_email,
                phone: su_phone,
                pass1: calcMD5(su_pass1+"ZrX@s5AF*7zu")
            })
                .success(function (data)
                {
                    // Valor que Valido el Servidor (Registro o No al Nuevo Usuario)
                    //console.log('Data in Controller Signup:', data);

                    if(data == 0)
                    {
                        $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>This email has already been used</p>');
                        return false;
                    }
                    else
                    {
                        // Creamos la Sesion
                        //$rootScope.setToken(su_fname, su_lname, su_email, su_phone, '0', data[0].id);

                        // Ocultamos el Aviso de Conectando y redireccionamos a la Pagina de Inicio
                        $rootScope.hide();

                        $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>A confirmation mail has been sent to your e-mail. Please validate your account...</p>');
                        $state.go('home');
                        $scope.modal_menu.hide();
                        /*if($state.current.name=="home.sign-in")
                        {
                            //console.log("Band:", $state.current.name);
                            $('#btn_login').css('display','none');
                            $('#btn_logout').css('display','block');
                            $state.go('home.find-cab');
                        }
                        else
                        {
                            $('#btn_login').css('display','none');
                            $('#btn_logout').css('display','block');
                            //console.log("Band:", $state.current.name);
                            $state.go('home');
                            $scope.modal_menu.hide();
                        }*/
                    }
                })
                .error(function (error)
                {
                    $rootScope.hide();
                    $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Connection error, please try again</p>');
                });
        }
    })

    //***************************************************************************************************************************
    // Perfil Controller
    //***************************************************************************************************************************
    .controller('PerfilCtrl', function ($rootScope, $scope, API, $window, $state){
        $scope.user = {
            email: "",
            phone:""
        };

        $rootScope.goState = function (state) {
            $state.go(state);
        };

        $scope.Edituser = function ()
        {
            var usr_fname = this.user.first_name;
            var usr_lname = this.user.last_name;
            var usr_email = this.user.email;
            var usr_phone = this.user.phone;
            var usr_id    = $rootScope.getUId();

            if(!usr_fname && !usr_lname && !usr_email && !usr_phone)
            {
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>No change required.</p>');
                return false;
            }
            else
            {
                if(!usr_fname) { usr_fname = $rootScope.getUFName() }
                if(!usr_lname) { usr_lname = $rootScope.getULName() }
                if(!usr_email) { usr_email = $rootScope.getToken()  }
                if(!usr_phone) { usr_phone = $rootScope.getUphone() }
            }

            $rootScope.show('<i class="ion-loading-a" style="font-size: 30px;"></i><br><br><p>Updating your information...</p>');

            API.edit_user({
                u_id: usr_id,
                fname: usr_fname,
                lname: usr_lname,
                email: usr_email,
                phone: usr_phone
            })
            .success(function (data)
            {
                // Valor que Valido el Servidor (Registro o No al Nuevo Usuario)
                //console.log('Data in Controller Edit Driver:', data);

                // Actualizamos la Sesion
                $rootScope.updateToken(usr_fname, usr_lname, usr_email, usr_phone, '0');

                // Ocultamos el Aviso de Conectando y redireccionamos a la Pagina de Inicio
                $rootScope.hide();

                $rootScope.notify('<i class="ion-checkmark-circled" style="font-size: 30px;"></i><br><br><p>Your profile has been successfully updated...</p>');
                $state.go('home');
            })
            .error(function (error)
            {
                $rootScope.hide();
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Connection error. Please try again later...</p>');
            });
        }
    })

    //***************************************************************************************************************************
    // Delete Perfil Controller
    //***************************************************************************************************************************
    .controller('DeletePerfilCtrl', function ($rootScope, $scope, API, $window, $state){
        $scope.user = {
            id: ""
        };

        $scope.goState = function (state) {
            $state.go(state);
        };

        $scope.Deleteuser = function (usr_id)
        {
            $rootScope.show('<i class="ion-loading-a" style="font-size: 30px;"></i><br><br><p>Delete Account...</p>');

            API.delete_user({
                u_id: usr_id
            })
            .success(function (data)
            {
                // Valor que Valido el Servidor (Registro o No al Nuevo Usuario)
                //console.log('Data in Controller Delete Perfil:', data);

                // Borramos la Sesion
                $rootScope.setToken("","","","","","");
                $('#btn_login').css('display','block');
                $('#btn_logout').css('display','none');
                $('#btn_perfil').css('display','none');

                // Ocultamos el Aviso de Conectando y redireccionamos a la Pagina de Inicio
                $scope.modal_perfil.hide();
                $rootScope.hide();

                $rootScope.notify('<i class="ion-checkmark-circled" style="font-size: 30px;"></i><br><br><p>Your profile has been successfully eliminated...</p>');
                $state.go('home');
            })
            .error(function (error)
            {
                $rootScope.hide();
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Connection error. Please try again later...</p>');
            });
        }
    })


    //***************************************************************************************************************************
    // Password Controller
    //***************************************************************************************************************************
    .controller('PassCtrl', function ($rootScope, $scope, API, $window, $state){
        $scope.upass = {
            old_pwd: "",
            password1:"",
            password2:""
        };

        $scope.goState = function (state) {
            $state.go(state);
        };

        $scope.Editpassword = function ()
        {
            var usr_old_pass  = this.upass.old_pwd;
            var usr_new_pass1 = this.upass.password1;
            var usr_new_pass2 = this.upass.password2;
            var usr_id = $rootScope.getUId();

            if(!usr_old_pass || !usr_new_pass1 || !usr_new_pass2)
            {
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Please fill in all the required fields. (*)</p>');
                return false;
            }
        
            if(usr_new_pass1 != usr_new_pass2)
            {
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Passwords do not match.</p>');
                return false;
            }

            $rootScope.show('<i class="ion-loading-a" style="font-size: 30px;"></i><br><br><p>Updating your information...</p>');

            API.edit_pass({
                u_id: usr_id,
                u_old_pass: calcMD5(usr_old_pass+"ZrX@s5AF*7zu"),
                U_new_pass: calcMD5(usr_new_pass1+"ZrX@s5AF*7zu") 
            })
            .success(function (data)
            {
                //console.log('Data in Controller Edit Password:', data);

                if(data == 0)
                {
                    $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Wrong password...</p>');
                    return false;
                }
                else
                {
                    // Ocultamos el Aviso de Conectando y redireccionamos a la Pagina de Inicio
                    $rootScope.hide();

                    $rootScope.notify('<i class="ion-checkmark-circled" style="font-size: 30px;"></i><br><br><p>Your Password has been successfully changed...</p>');
                    $state.go('home');
                }
            })
            .error(function (error)
            {
                $rootScope.hide();
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Connection error. Please try again later...</p>');
            });
        };

        $scope.Recoverpass = function ()
        {
            var usr_email  = this.user.email;
            var usr_pass= Math.round((Math.random() * 100000));

            if(!usr_email)
            {
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Write your email.</p>');
                return false;
            }

            $rootScope.show('<i class="ion-loading-a" style="font-size: 30px;"></i><br><br><p>Loading your information...</p>');

            API.recover_pass({
                u_email: usr_email,
                u_pass: usr_pass,
                u_pass_enc: calcMD5(usr_pass+"ZrX@s5AF*7zu")
            })
            .success(function (data)
            {
                // Valor que Valido el Servidor (Registro o No al Nuevo Usuario)
                //console.log('Data in Controller Recover Password:', data);

                if(data == 0)
                {
                    $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>This email address is not registered...</p>');
                    return false;
                }
                else
                {
                    // Ocultamos el Aviso de Conectando y redireccionamos a la Pagina de Inicio
                    $rootScope.hide();

                    $rootScope.notify('<i class="ion-checkmark-circled" style="font-size: 30px;"></i><br><br><p>An email with the information to reset your account has been sent.</p>');
                    $state.go('home');
                }
            })
            .error(function (error)
            {
                $rootScope.hide();
                $rootScope.notify('<i class="ion-alert-circled" style="font-size: 30px;"></i><br><br><p>Connection error. Please try again later...</p>');
            });
        }     
    });




