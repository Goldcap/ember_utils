var error = {
  
  showing: false,
  queue: new Array(),
  opts: null,
  basenodename: "#alert",
  titlenodename: "#alert_title",
  messagenodename: "#alert_message",
  fade: 3000,
  
	//type: success|warning|error|notice
  showError: function( type, title, message, opts, fromQueue ) {
    
    error.opts = opts;
    
    if (fromQueue == undefined) {
      fromQueue = false;
    }
    
    if (title == undefined) {
      return false;
    }
    
    //We're already showing an error, so add this baby to the queue;
    if ((error.showing) && (! fromQueue))  {
	   //error.queue[error.queueIndex] = {"type":type, "title":title, "message":message, "arg":arg, "callback":callback};
      var item = {"type":type, "title":title, "message":message};
      error.queue.push(item);
    }
    
    if (error.showing) {
		return false;
	}
		
	//console.log("Error Type " + type);
    error.showing = true;
    
    $(error.titlenodename).html(title);
    if (message != undefined) {
      $(error.messagenodename).html(message);
      $(error.messagenodename).show();
    }
    
    error.release(type,opts);
    
  },
  
  release: function(type,opts) {
    //console.log("Error Release");
    var dofade = true;
    
    if (error.opts != undefined)
      dofade = error.opts.fade;
    $(error.basenodename).attr("class","alert-box");
    
    if (dofade) {
      $(error.basenodename).addClass(type).show().delay(error.fade).fadeOut();
    } else {
      $(error.basenodename).addClass(type).show();
    }
    error.showing = false;
    if (error.queue.length == 0) {
      return;
    }
    error.processQueue();
  },
  
  processQueue: function() {
  	//console.log("PROCESS QUEUE");
    if (error.queue == undefined)
        return;
    var theerror = error.queue.shift();
    error.showError( theerror.type, theerror.title, theerror.message, theerror.opts, true );
    
  },
  
  hide: function() {
   $(error.basenodename).hide(); 
  }
  
}

function showError( type, title, message, opts ) {
  error.showError( type, title, message, opts );
}