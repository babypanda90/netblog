$(function () {
    var login = $("#users-login");
    var logout = $("#users-info");

    $("#signup").on("click", function () {
        $("#repw").show();
        $("#signup").hide();
        $("#signin").show();
        login.find("h3").html("Register");
        $("#login-warning").html("");
    })

    $("#signin").on("click", function () {
        $("#repw").hide();
        $("#signup").show();
        $("#signin").hide();
        login.find("h3").html("Login");
        $("#login-warning").html("");
    })

    $("#login-submit").on("click", function () {
        var ourl = null;
        var odata = null;
        var osuccess = null;

        if ( $("#repw").is(":visible") ) {
            ourl = '/api/user/register';
            odata = {
                username: login.find("[name='username']").val(),
                password: login.find("[name='password']").val(),
                repassword: login.find("[name='repassword']").val()
            };
            osuccess = function(result) {
                $("#login-warning").html(result.message);
                if (result.code == 0) {
                    setTimeout(function () {
                        $("#repw").hide();
                        $("#signup").show();
                        $("#signin").hide();
                        login.find("h3").html("Login");
                        $("#login-warning").html("");
                    }, 1000);
                }
            }
        }

        else {
            ourl = '/api/user/login';
            odata = {
                username: login.find("[name='username']").val(),
                password: login.find("[name='password']").val(),
            }
            osuccess = function(result) {
                $("#login-warning").html(result.message);
                if (result.code == 0) {
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                }
            }
        }

        $.ajax({
            type: "post",
            url: ourl,
            data: odata,
            dataType: "json",
            success: osuccess
        })
    })

    $("#info-logout").on("click", function () {
        $.ajax({
            type: "get",
            url: "/api/user/logout",
            success: function(result) {
                if (result.code == 0) {
                    window.location.reload();
                }
            }
        });
    })


})