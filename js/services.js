angular.module('starter.services', [])
    .factory('API', function ($rootScope, $http, $ionicLoading, $window)
    {
        var base = "http://groupmwt.com/garzablanca/DBOff/Angular/ajax/";

        $rootScope.show = function (text)
        {
            $rootScope.loading = $ionicLoading.show(
                {
                    content: text ? text : '<i class="ion-loading-a" style="font-size: 30px;"></i><br><br> <p>Loading...</p>',
                    template: text,
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 600,
                    showDelay: 0
                });
        };

        $rootScope.hide = function () {
            $ionicLoading.hide();
        };

        $rootScope.logout = function () {
            $rootScope.setToken("","","","","","");
            $('#btn_login').css('display','block');
            $('#btn_logout').css('display','none');
            $('#btn_perfil').css('display','none');
            $window.location.href = '#/auth/signin';

        };

        $rootScope.notify = function(text ){
            $rootScope.show(text);
            $window.setTimeout(function () {
                $rootScope.hide();
            }, 2000);
        };

        $rootScope.doRefresh = function (tab) {
            if(tab == 1)
                $rootScope.$broadcast('fetchAll');
            else
                $rootScope.$broadcast('fetchCompleted');

            $rootScope.$broadcast('scroll.refreshComplete');
        };

        $rootScope.setToken = function (fname, lname, token, phone, utype, uid) {
            $window.localStorage.uname = fname+" "+lname;
            $window.localStorage.ufname = fname;
            $window.localStorage.ulname = lname;
            $window.localStorage.uphone = phone;
            $window.localStorage.utype = utype;
            $window.localStorage.uid = uid;

            return $window.localStorage.utoken = token;
        };

        $rootScope.updateToken = function (fname, lname,token, phone, utype) {
            $window.localStorage.uname = fname+" "+lname;
            $window.localStorage.ufname = fname;
            $window.localStorage.ulname = lname;
            $window.localStorage.uphone = phone;
            $window.localStorage.utype = utype;

            return $window.localStorage.utoken = token;
        };

        $rootScope.getToken = function () {
            return $window.localStorage.utoken;
        };

        $rootScope.getUName = function () {
            return $window.localStorage.uname;
        };

        $rootScope.getUFName = function () {
            return $window.localStorage.ufname;
        }

        $rootScope.getULName = function () {
            return $window.localStorage.ulname;
        }

        $rootScope.getUphone = function () {
            return $window.localStorage.uphone;
        };

        $rootScope.getUType = function () {
            return $window.localStorage.utype;
        };

        $rootScope.getUId = function () {
            return $window.localStorage.uid;
        };

        $rootScope.isSessionActive = function () {
            return $window.localStorage.utoken ? true : false;
        };

        return {
            signin: function (form) {

                var NUEm  = form.email;
                var NUPw1 = form.password;
                var NUPw2 = calcMD5(NUPw1);

                //console.log('Sign In Form (Services.js):', NUEm);

                return $http.post(base+"getUser.php?NUEm="+NUEm+"&NUPw="+NUPw2+"&NUTp=0");
            },
            signup: function (form) {

                var SUFName = form.fname;
                var SULName = form.lname;
                var SUEmail = form.email;
                var SUPhone = form.phone;
                var SUPassw = calcMD5(form.pass1);

                //console.log('Sign Up Form (Services.js):', SUFName);
                //console.log('Password Encrypted Sign Up Form (Services.js):', SUPassw);

                return $http.post(base+"addUser.php?NUFN="+SUFName+"&NULN="+SULName+"&NUEm="+SUEmail+"&NUPh="+SUPhone+"&NUPw="+SUPassw+"&NUTp=0");
            },
            edit_pass: function (form) {

                var U_Id  = form.u_id;
                var U_New_Pass = calcMD5(form.U_new_pass);
                var U_Old_Pass = calcMD5(form.u_old_pass);

                //console.log('Change Pass Form (Services.js):', form);
                //console.log('Old Password Encrypted Change Pass Form (Services.js):', U_Old_Pass);
                //console.log('New Password Encrypted Change Pass Form (Services.js):', U_New_Pass);

                return $http.post(base+"editPass.php?UId="+U_Id+"&UOP="+U_Old_Pass+"&UNP="+U_New_Pass+"&UTp="+0);
            },
            recover_pass: function (form) {

                var U_Email  = form.u_email;
                var U_Pass = form.u_pass;
                var U_Pass_Enc = calcMD5(form.u_pass_enc);

                //console.log('Recover Pass Form (Services.js):', form);

                return $http.post(base+"recoverPass.php?UEm="+U_Email+"&URPE="+U_Pass_Enc+"&URP="+U_Pass+"&UTp="+0);
            },
            edit_user: function (form) {

                var U_Id  = form.u_id;
                var SUFName = form.fname;
                var SULName = form.lname;
                var SUEmail = form.email;
                var SUPhone = form.phone;

                //console.log('Edit Form (Services.js):', form);

                return $http.post(base+"editUser.php?UId="+U_Id+"&UFN="+SUFName+"&ULN="+SULName+"&UEm="+SUEmail+"&UPh="+SUPhone+"&UTp="+0);
            },
            delete_user: function (form) {

                var U_Id  = form.u_id;

                //console.log('Delete ID (Services.js):', U_Id);

                return $http.post(base+"deleteUser.php?UId="+U_Id);
            },
        }
    });
