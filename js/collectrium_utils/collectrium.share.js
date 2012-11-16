// JavaScript Document
var collectrium = collectrium || {};
collectrium.share = function( options ){
  this.options = $.extend({
    userid: 0,
    username: null,
    email: null,
    recipients: null
	}, options);
	this.init();
}

collectrium.share.prototype = {

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
    
    $("#vvr_emaillink").click(function(e){
        e.preventDefault();
        scope.showDialog();
    });
    
    $("#share").validate({
      submitHandler: function(form) {
        this.connection = new collectrium.apiConnection( {} );
        $(this.connection).bind("share_success", _.bind(scope.shareResult,scope));
        $(this.connection).bind("share_failure", _.bind(scope.shareResult,scope));
        this.connection.postForm( '/services/v1/share/', form, "share" );
      },
      errorElement: "small",
      rules: {
    	requestor_email: {
            required: true,
            email: true
        },
        share_recipients: {
            required: true
        },
        share_message: {
            required: true
        },
        tos: {
            required: true
        }
      }
    });
    
  },
  
  showDialog: function() {
	$("#share_message").val("I thought you might be interested in learning more about this artwork.\n\nName: " + $("#share #title").val() + "\nAritst: " + $("#share #artist").val() + "\n\nView this artifact here:\nhttp://www.collectrium.com/vvr/detail/"+$("#share #artifact").val()+"/");

    $('#share_dialog').reveal({
     closeonbackgroundclick: true,              //if you click background will modal close?
     dismissmodalclass: 'close-reveal-modal'
    });
  },
  
  shareResult: function( event, result ) {
    if (result.response.result == 'success') {
        //this.options.userid = result.objects[0].userid;
        //this.options.username = result.objects[0].username;
        //this.options.email = result.objects[0].email;   
    }
    error.showError(result.response.result,result.response.title,result.response.message);
    if (result.response.result == 'success') {  
        $(this).trigger('shareComplete'); 
        $('#share_dialog').trigger('reveal:close');
    }
  }
  
}