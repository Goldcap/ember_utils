// JavaScript Document
var collectrium = collectrium || {};
collectrium.login = function( options ){
  this.options = $.extend({
    userid: 0,
    username: null,
    email: null
	}, options);
	this.init();
}

collectrium.login.prototype = {

  init: function() {
    var scope = this;
    this.attatchEvents();
    /*
    var pmatch =  !!window.location.hash && window.location.hash.match(/pu=(\d+)/) ? window.location.hash.match(/pu=(\d+)/,'') : 0;
	if (pmatch.length > 0) {
       scope.showDialog();  
	}
    */
  },
  
  attatchEvents: function() {
    
    var scope = this;
    
    $("#reserve_signup_link").click(function(e){
        e.preventDefault();
        scope.showSignup();
    });
    
    $("#reserve_login_link").click(function(e){
        e.preventDefault();
        scope.showLogin();
    });
    
    $("#login").validate({
      submitHandler: function(form) {
        this.connection = new collectrium.apiConnection( {} );
        $(this.connection).bind("login_success", _.bind(scope.loginResult,scope));
        $(this.connection).bind("login_failure", _.bind(scope.loginResult,scope));
        this.connection.postForm( '/services/v1/login/', form, "login" );
      },
      errorElement: "small",
      rules: {
    	email: {
            required: true
            /*email: true*/
        },
        password: {
            required: true
        }
      }
    });
    
    $("#signup").validate({
      submitHandler: function(form) {
        this.connection = new collectrium.apiConnection( {} );
        $(this.connection).bind("signup_success", _.bind(scope.loginResult,scope));
        $(this.connection).bind("signup_failure", _.bind(scope.loginResult,scope));
        this.connection.postForm( '/services/v1/signup/', form, "signup" );
      },
      errorElement: "small",
      rules: {
    	email: {
            required: true,
            email: true
        },
        username: {
            required: true
        },
    	first_name: {
    	   required: true
    	},
        last_name: {
            required: true
        },
        password: {
            required: true
        },
        password_confirm: {
            required: true,
            equalTo: "#signup #password"
        },
        tos: {
            required: true
        },
        user_event_content: {
            required: true
        },
        term: {
            required: false
        }
      }
    });
    
  },
  
  loginResult: function( event, result ) {
    if (result.response.result == 'success') {
        this.options.userid = result.objects[0].userid;
        this.options.username = result.objects[0].username;
        this.options.email = result.objects[0].email;   
    }
    
    error.showError(result.response.result,result.response.title,result.response.message);
    if (result.response.result == 'success') {
        if (result.meta.action == 'signup') {
            $(this).trigger('signupComplete');
        } else if (result.meta.action == 'login') {
            $(this).trigger('loginComplete');
        }
    }
  },
  
  showLogin: function( event ) {
    if(jQuery.browser.safari) {
        $("#modal_signup").hide();
        $("#modal_login").show();
    } else {
        $("#modal_signup").fadeOut(500).queue(function(){
            $("#modal_login").fadeIn(500);
            $("#modal_signup").clearQueue();    
        });
    }  
  },
  
  showSignup: function( event ) {
    if(jQuery.browser.safari) {
        $("#modal_login").hide();
        $("#modal_signup").show();
    } else {
        $("#modal_login").fadeOut(500).queue(function(){
            $("#modal_signup").fadeIn(500);
            $("#modal_login").clearQueue();    
        });
    }
    
  }
  
}
