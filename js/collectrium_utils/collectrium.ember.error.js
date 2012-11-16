//NOT DONE YET...
//MOVING ON!
Collectrium.errorController = Em.Object.extend({
  
  viewable:false,
  view: "Collectrium.errorItemView",
  showing: "alert_invisible",
  errors: null,
  
  fade: 3000,
  error: null,
  
  init: function() {
    this.set('errors',Collectrium.Collection.create({"name":"errors"}));
    this.errors.set('type',Collectrium.errorItem);
  },
  
  visible: function() {
    if (this.viewable) {
        this.set('viewClass','alert-box error_visible ' + this.type);
    } else {
        this.set('type','');
        this.set('viewClass','alert-box error_invisible ' + this.type);
    }
  }.property('viewable'),
  
    //type: success|warning|error|notice
  showError: function( type, title, message, fromQueue ) {
    
    this.set('showing','alert_visible');
    var scope = this;
    
    if (! fromQueue) {
        if (title == undefined) {
          return false;
        }
        
        this.get('errors').push({"type":type, "title":title, "message":message});
    }
	this.get('errors.firstObject').set('viewable',true);
    this.set('errors.item',this.get('errors.firstObject'));
    
    setTimeout(function(){scope.release()},scope.get('fade'));
    
  },
  
  release: function() {
       
    this.get('errors.item').set('viewable',false);
    
  },
  
  processQueue: function() {
   
    if ((this.get('errors.item')) && (this.get('errors.item.finished'))) {
        this.get('errors').pop();
        if (this.get('errors.content.length') == 0) {
            this.set('showing','alert_invisible');
            return;
        }
        this.showError( null, null, null, true );
    }
   
  }.observes('errors.item.finished')
  
});

Collectrium.errorItemView = Ember.View.extend({
    
   classNameBindings: ["content.showing","content.errors.item.type","content.errors.item.viewable"],
   classNames: ['alert-box'],
   isVisible: true,
   
   _toggleView: function() {
    var that = this;
    if (! this.get('content.errors.item.viewable')) {
        this.$().fadeOut("slow", function() {
            that.set('isVisible',false);
            that.set('content.errors.item.finished',true);
        });
    } else {
        that.set('isVisible',true);
        this.$().show();
    }
   }.observes('content.errors.item.viewable'),

});

Collectrium.errorItem = Collectrium.Item.extend({
    
    type: "",
    title:null,
    message:null,
    viewable: true,
    finished: false
      
});

//Create a global error object, in case we aren't picky
Collectrium.Error = Collectrium.errorController.create();