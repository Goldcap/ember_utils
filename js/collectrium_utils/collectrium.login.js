// JavaScript Document
var collectrium = collectrium || {};
collectrium.login = function( options ){
  this.options = $.extend({
    userid: 0,
    username: null,
    email: null,
    loginValidator: null,
    signupValidator: null,
    newsletterValidator: null
	}, options);
	this.init();
}

collectrium.login.prototype = {

  init: function() {
    var scope = this;
    this.attatchEvents();

    if (window.location.pathname.match(/galleries/)) {
        this.page = "Galleries";
        this.myColor = "green";
    } else if (window.location.pathname.match(/artfairs/)) {
        this.page = "Artfairs";
        this.myColor = "wine";
    } else if (window.location.pathname.match(/collectors/)) {
        this.page = "Collectors";
        this.myColor = "bronze";
    } else if (window.location.pathname.match(/customers/)) {
        this.page = "Customers";
        this.myColor = "blue";
    } else {
        this.page = "Homepage";
    }
    /*
    var pmatch =  !!window.location.hash && window.location.hash.match(/pu=(\d+)/) ? window.location.hash.match(/pu=(\d+)/,'') : 0;
	if (pmatch.length > 0) {
       scope.showDialog();  
	}
    */
  },
  
  attatchEvents: function() {
    this.unlockInput();
    
    var scope = this;
    
    $("#reserve_signup_link").click(function(e){
        e.preventDefault();
        scope.showSignup();
    });
    
    $("#reserve_login_link").click(function(e){
        e.preventDefault();
        scope.showLogin();
    });
    
    $("input[name='role']").click(function(e){
       //console.log("Clicked Artfair");
       scope.checkRole(e);
       //scope.showSignupTwo();
    });
    
    this.options.loginValidator = $("#login").validate({
      submitHandler: function(form) {
        //console.log("submitting log in form");
        //scope.lockInput();
        this.connection = new collectrium.apiConnection( {} );
        $(this.connection).bind("login_success", _.bind(scope.loginResult,scope));
        $(this.connection).bind("login_failure", _.bind(scope.loginResult,scope));
        this.connection.postForm( '/services/v1/login/', form, "login" );
        //form.submit();
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
    
    this.options.signupValidator = $("#signup").validate({
      submitHandler: function(form) {
        if ($("#login_action").val() == "Continue") {
          scope.showSignupTwo();
        } else {
          //console.log("submitting sign up form");
          //scope.lockInput();
          this.connection = new collectrium.apiConnection( {} );
          $(this.connection).bind("signup_success", _.bind(scope.loginResult,scope));
          $(this.connection).bind("signup_failure", _.bind(scope.loginResult,scope));
          this.connection.postForm( '/services/v1/signup/', form, "signup" );
          //form.submit();
        }
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
        organization: {
            required: true
        },
        organization_message: {
            required: true
        },
        user_event_content: {
            required: true
        }
      }
    });

    this.options.newsletterValidator = $("#newsletter").validate({
      submitHandler: function(form) {
        scope.lockInput();
        this.connection = new collectrium.apiConnection( {} );
        $(this.connection).bind("newsletter_success", _.bind(scope.newsletterResult, scope));
        $(this.connection).bind("newsletter_failure", _.bind(scope.newsletterResult, scope));
        this.connection.postForm('/services/v1/newsletter/', form, 'newsletter');
      },
      errorElement: "small",
      rules: {
        email_subscribe: {
            required: true,
            email: true
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
    
    //error.showError(result.response.result,result.response.title,result.response.message);
    if (result.response.result == 'success') {
        if (result.meta.action == 'signup') {
            // Google Analytics tracking code
            _gaq.push(
                ['_setCustomVar', 1, 'User', 'HasAccount', 1],
                ['_trackPageview']
            );
            // Mixpanel signup tracking
            mixpanel.register({account_type: result.objects[0].role, medium: "web"});

            $(this).trigger('signupComplete',result);
        } else if (result.meta.action == 'login') {
            // Google Analytics tracking code
            _gaq.push(
                ['_setCustomVar', 1, 'User', 'HasAccount', 1],
                ['_trackPageview']
            );
            $(this).trigger('loginComplete',result);
        }
    } else {
        this.unlockInput();
        var razzle = {};
        razzle[result.response.title] = result.response.message;
        if (result.meta.action == 'signup') {
            this.options.signupValidator.showErrors(razzle);
        } else if (result.meta.action == 'login') {
            this.options.loginValidator.showErrors(razzle);
        }
    }
  },

  newsletterResult: function(event, result) {
    this.unlockInput();
    if (result.response.success) {
      $('#newsletter').parents('ul').find('p').text(result.response.message);
      $("#newsletter").remove();
    } else {
      this.options.newsletterValidator.showErrors({"email_subscribe": result.response.message});
    }
  },
  
  lockInput: function() {  
    console.log("Lockin!");
    $("input[type='submit']").attr("disabled", "true");
    $("#process_login").fadeIn(500);
  },
  
  unlockInput: function() {
    $("input[type='submit']").removeAttr("disabled");
    $("#process_login").fadeOut(500);
  },
  
  showLogin: function( event ) {
    this.unlockInput();
    // Google Analytics tracking code
    _gaq.push(
        ['_setCustomVar', 3, 'Section', 'signin', 3],
        ['_trackEvent', 'Login', 'Start', 'Header Button Link'],
        ['_trackPageview', '/login']
    );
    $("#modal_signup").fadeOut(500).queue(function(){
        $("#modal_signup").hide();
        $("#modal_login").fadeIn(500);
        $(this).dequeue();    
    });
  },
  
  showSignup: function( event ) {
    this.unlockInput();
    // Google Analytics tracking code
    _gaq.push(
        ['_setCustomVar', 3, 'Section', 'signin', 3],
        ['_trackEvent', 'Trial Signup', 'Start', this.page],
        ['_trackPageview', '/signup']
    );
    $("#modal_login").fadeOut(500).queue(function(){
        $("#modal_login").hide();
        $("#modal_signup").fadeIn(500);
        $(this).dequeue();    
    });
    
  },
  
  showSignupTwo: function( event ) {
    this.swapSignupAction("Create account");
    // Google Analytics tracking code
    _gaq.push(
        ['_setCustomVar', 3, 'Section', 'signin', 3],
        ['_trackPageview', '/signup/organization']
    );
    $("#page_one").fadeOut(500).queue(function(){
        $("#page_one").hide();
        $("#page_two").fadeIn(500);
        $(this).dequeue();    
    });
    
  },
  
  checkRole: function( event ) {
    if (($("input[name='role']:checked").val() == 'artfair') ||
        ($("input[name='role']:checked").val() == 'museum') ||
        ($("input[name='role']:checked").val() == 'consultant')){
        this.swapSignupAction("Continue");
    } else {
        this.swapSignupAction("Create account");
    }
  },
  
  swapSignupAction: function( value ) {
    $("#login_action").val(value);  
  }
  
}