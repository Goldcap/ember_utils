// JavaScript Document
Collectrium.Item = Em.Object.extend({

    item:null,
    args: null,
    options: null,
    event: null,
    state: null,
    response: null,
    objects: null,
    meta: null,
    type: null,
  
  stateChange: function() {
    this.assign();
  }.observes('state'),
  
  assign: function() {
    if ((this.objects == null) || (this.objects.length === 0)) return;
    for(var i=0;i<this.objects.length;i++){
        var obj = this.objects[i];
        for(var key in obj){
            this.set(key,obj[key]);
        }
    }
  },
  
  read: function( url, args, event ) {
    
        this.event = event;
        this.args = args;
        
        var data = $.extend( this.args , this.options );
        
        $.ajax({
			type: 'GET',
			url: url,
			data: data,
			dataType: 'json',
			context: this,
            timeout: this.onTimeout,
			complete: this.onComplete,
			success: this.onSuccess,
			error: this.onFailure
		});
    
    },
    
  write: function( url, args, event ) {
    
    this.event = event;
    
    var data = $.extend( args , this.options);
    
    $.ajax({
			type: 'POST',
			url: url,
			data: data,
			context: this,
            timeout: this.onTimeout,
			complete: this.onComplete,
			success: this.onSuccess,
			error: this.onFailure
		});
  },
  
  writeForm: function( url, form, event ) {
    
    this.event = event;
    
    if (url == null) {
      url = $(form).attr("action");
    }
    
    $.ajax({
			type: 'POST',
			url: url,
			data: $(form).serialize(),
			dataType: 'json',
			context: this,
            timeout: this.onTimeout,
			complete: this.onComplete,
			success: this.onSuccess,
			error: this.onFailure
		});
  },
  
  writeRest: function (url, form, event) {
    
    var values = {};
    
    $.each($(form).serializeArray(), function(i, field) {
      values[field.name] = field.value;
    })
    
    this.send( url, values, $(form).attr("method"), event );

  },
  
  push: function( url, args, method, event ) {
    
    this.event = event;
    
    if (method == undefined)
      method = 'PATCH'
      
    var data = $.extend( args, this.options );
    var postVars = JSON.stringify(data);
     
    $.ajax({
			type: method,
			url: url,
			data: postVars,
			contentType: 'application/json',
			dataType: 'json',
			context: this,
            timeout: this.onTimeout,
			complete: this.onComplete,
			success: this.onSuccess,
			error: this.onFailure
		});
  }
    
});