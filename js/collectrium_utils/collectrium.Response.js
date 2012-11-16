// JavaScript Document
var collectrium = collectrium || {};
collectrium.Response = Em.ArrayProxy.extend({
 
    item:null,
    content: [],
    args: null,
    options: null,
    event: null,
    state: null,
    response: null,
    objects: null,
    meta: null,
    type: null,
    
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

    onComplete: function(response) {
        $(this).trigger(this.event+'_complete', response);
    },
    
    onSuccess: function(response) {
        this.set('response',response.response);
        this.set('meta',response.meta);
        this.set('objects',response.objects);
        $(this).trigger(this.event+'_success', response);
        this.set('state',response.response.result);
    },
    
    onFailure: function(response) {
        $(this).trigger(this.event+'_failure', response);
        this.set('state','failure');
    },
    
    onTimeout: function(response) {
        $(this).trigger(this.event+'_timeout', response);
        this.set('state','failure');
    }
    
});