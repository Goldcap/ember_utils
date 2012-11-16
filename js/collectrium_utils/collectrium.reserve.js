// JavaScript Document
var collectrium = collectrium || {};
collectrium.reserve = function( options ){
  this.options = $.extend({
        item: 0,
        status: null
	}, options);
	this.init();
}

collectrium.reserve.prototype = {

  init: function() {
    var scope = this;
    this.attatchEvents();
    var pmatch =  !!window.location.hash && window.location.hash.match(/pu=(\d+)/) ? window.location.hash.match(/pu=(\d+)/,'') : 0;
	if (pmatch.length > 0) {
       scope.showDialog();  
	}
    $("#request_message").val("I am interested in learning more about this artwork.\n\nName: " + $("#reserve #title").val() + "\nAritst: " + $("#reserve #artist").val() + "\n\nView this artifact here:\nhttp://www.collectrium.com/vvr/detail/"+$("#reserve #artifact").val()+"/");

    this.options.login = new collectrium.login();
    $(this.options.login).bind("signupComplete", _.bind(scope.showReserve,scope));
    $(this.options.login).bind("loginComplete", _.bind(scope.showReserve,scope));    
            
  },
  
  //We want to reload the current page
  showReserve: function() {
    console.log("Showin Reserve");
    console.log(this.options.login.options.userid);
    console.log(this.options.login.options.email);
    
    $("#request_message").val("I am interested in learning more about this artwork.\n\nName: " + $("#reserve #title").val() + "\nAritst: " + $("#reserve #artist").val() + "\n\nView this artifact here:\nhttp://www.collectrium.com/vvr/detail/"+$("#reserve #artifact").val()+"/");
    $("#modal_login").hide();
    $("#modal_signup").hide();
    $("#requestor").val(this.options.login.options.userid);
    $("#requestor_email").val(this.options.login.options.email);
    $("#modal_reserve").show();
    
    //window.location.href = '/vvr/detail/'+this.options.item+'/#pu=1';
  },
  
  showDialog: function() {
	$("#request_message").val("I am interested in learning more about this artwork.\n\nName: " + $("#reserve #title").val() + "\nAritst: " + $("#reserve #artist").val() + "\n\nView this artifact here:\nhttp://www.collectrium.com/vvr/detail/"+$("#reserve #artifact").val()+"/");

    $('#reserve_dialog').reveal({
     closeonbackgroundclick: true,              //if you click background will modal close?
     dismissmodalclass: 'close-reveal-modal'
    });
  },
  
  attatchEvents: function() {
    
    var scope = this;
    $(".artifact-reserve-link p a").click(function(e) {
        e.preventDefault();
        scope.showDialog();    
    });
    
    $("#reserve").submit(function(e) {
        e.preventDefault();
        scope.postStatus();
    });
    
  },
  
  postStatus: function() {
    if (this.options.status == 'posting') return;
    this.options.status = 'posting';
    args = { requestor: $("#requestor").val(), artifact: $("#artifact").val(), message: $("#request_message").val(), requestor_email: $("#requestor_email").val(), opt_in: $("#opt_in").attr("checked") };
    if (typeof(_gaq) != undefined)
        _gaq.push(['_trackEvent', 'Reserve', 'Send', $("#title").val()]);
    var connection = new collectrium.apiConnection( {} );
    $(connection).bind('reserve_success', _.bind(this.reserveResult,this)); 
    $(connection).bind('reserve_failure', _.bind(this.reserveResult,this));
	connection.post( '/services/v1/reserve/'+$("#artifact").val() + '/', args, 'reserve' );
  },
  
  reserveResult: function( event, result ) {
    this.options.status = null;
    error.showError(result.response.result,result.response.title,result.response.message);
    $('#reserve_dialog').trigger('reveal:close'); 
  }
  
}
