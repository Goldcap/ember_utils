// JavaScript Document
Collectrium.Collection = Em.ArrayProxy.extend({

    item:null,
    args: null,
    options: null,

    params: null,

    event: null,
    step: null,
    response: null,
    result: null,
    objects: null,
    meta: null,
    type: null,
    inDom: 0,
    currentReq: null,
    url: null,
    unique: "",

    //If true, his will empty the collection AFTER a successful response,
    //Depending on the clearmethod
    clearpost: false,
    //If "wipe", the collection is set to an empty array AFTER a successful response
    //If "collate", the collection is updated during the assignment
    //Then invalid items removed post collation, using the "clearindex"
    clearmethod: 'wipe',
    clearindex: 'id',
    clearstate: 0,

    pagination: null,
    state: null,
    cancelled: false,
    selected: 0,
    //Set by the assigning method
    //Use to trigger post-assigment methods
    loaded: false,

    //For Filtering Results
    filter:null,
    filter_val:null,

    //Worker Property
    //Used by observable "sum"
    summer: null,

    init: function() {

        this._super();

        this.set('content',[]);
        this.set('unique',"");
        this.set('pagination',Collectrium.Paginator.create());
        this.set('params',Collectrium.Item.create(Collectrium.Serializable,{}));


    },

    content_filtered:function () {
        if ((this.get('filter')) && (this.get('filter_val'))) {
            return this.get('content').filterProperty(this.get('filter'), this.get('filter_val'));
        } else {
            return this.get('content');
        }
    }.property('content.@each','filter_val'),

    readArgs: function() {

        //console.log(this.get('pagination.rpp'));
        this.get('params').set("rpp",this.get('pagination.rpp'));
        this.get('params').set("page",this.get('pagination.page'));
        return this.get('params').serialize();

    },

    refresh: function() {
        //console.log("@refresh");
        if (this.get('pagination.page') == null) return;
        //console.log("@refresh page is: " + this.get('page'));
        //console.log("@refresh canseek is: " + this.get('canseek'));
        //if (! this.get('canseek')) return;
        this.set('canseek',false);
        this.paginate();
    },

    paginate: function( refresh ) {
        //console.log("@paginate page is: " + this.get('pagination.page'));
        //We're changing pages, so clear our content
        //Even if we're using "collate"
        if (this.get('page') != this.get('pagination.page')) {
            this.set('clearstate',this.get('content.length'));
        }

        this.set('page',this.get('pagination.page'));
        this.set('step',null);
        if (! this.get('clearpost')) {
            //console.log("clearing");
            this.set('content',[]);
        }
        this.set('inDom',0);
        this.set('state','init');
        this.set('step',null);
        this.fetch();
    },

    unfetch: function() {
        this.set('content',[]);
        this.pagination.set('page',1);
    },

    fetch: function() {
        //console.log("@fetch:: state is " + this.get('state'));
        //console.log("@fetch:: step is " + this.get('step'));

        if ((this.get('state') != 'eof') && (this.get('step') == null)) {
            //console.log("Reading with " + args);
            this.read(null, this.readArgs(), "get_items" );
        }
    },

    complete: function() {
        //$(".ab_loading").fadeOut();
        if (this.get('step') != 'success') return;
        //console.log(this.get('meta'));
        if (this.get('pagination')) {
    		this.get('pagination').render(this.get('meta'));
    	}
    }.observes('step'),

    //Adds a new element to the collection
    push: function( vals ) {
        var anObj = this.add(vals);
        this.pushObject(anObj);
    },

    pop: function() {
      return this.removeObject(this.get('firstObject'));
    },

    //Adds a new element to the collection
    add: function( vals ) {
        var anObj = this.type.create();
        if (typeof vals != 'undefined') {
            for(var key in vals){
                //console.log("ADDING " + key + " of value " + vals[key]);
                anObj.set(key,vals[key]);
            }
        }
        //console.log(anObj);
        return anObj;
    },

    //Adds a new element to the collection
    update: function( anObj, vals ) {
        if (typeof vals != 'undefined') {
            for(var key in vals){
                // console.log("ADDING " + key + " of value " + vals[key]);
                anObj.set(key,vals[key]);
            }
        }
        return anObj;
    },

    //Adds a new element with vals to the collection
    assign: function() {
        var doprocess = true;
        if (this.step != "success") { return; }
        else if (this.objects === null) { doprocess = false; }
        else if (this.objects.length === 0) { doprocess = false; }
        var removal = [];
        if (this.get('clearpost')) {
            if ((this.get('clearmethod') == 'wipe') || (this.get('clearstate') > 0)) {
                //console.log("WIPE");
                this.set('content',[]);
                this.set('clearstate',0);
            } else if (this.get('clearmethod') == 'collate') {
                //console.log("COLLATE");
                var removalList = this.content.mapProperty(this.get('clearid')).join(',');
                removal = removalList.split(',');
            }
        }

        if (doprocess) {
        //console.log(removal);
        for(var i=0;i<this.objects.length;i++){
            //If we enforce a uniqueness on inbound content, and find a dupe
            //Skip it
            if ((this.get('unique') != '') && (this.findProperty(this.get('unique'),this.objects[i][this.get('unique')]))) {
                //console.log("SKIPPING ADDING " + this.objects[i]);
            } else {
                //console.log("ADDING " + this.objects[i] + " of type " + this.get('type') + " at " + i);
                if ((this.get('clearpost')) && (this.get('clearmethod') == 'collate')) {
                    if (this.findProperty(this.get('clearid'),this.objects[i][this.get('clearid')])) {
                        //console.log("Found " + this.get('clearid') + " with " + this.objects[i][this.get('clearid')])
                        var theItem = this.findProperty(this.get('clearid'),this.objects[i][this.get('clearid')]);
                        this.update(theItem,this.objects[i]);
                        var found = false;
                        for (j=0;j<removal.length;j++) {
                            //console.log(removal[j] + "==" + this.objects[i][this.get('clearid')]);
                            if(removal[j]==this.objects[i][this.get('clearid')]){
                                //console.log("FOUND!");
                                removal.splice(j,1);
                                break;
                            }
                        }
                    } else {
                        //console.log("NOT FOUND SO ADDING!");
                        var anObj = this.add(this.objects[i]);
                        this.pushObject(anObj);
                    }
                } else {
                    //console.log("BASE ADDING NOT FOUND SO ADDING!");
                    var anObj = this.add(this.objects[i]);
                    //console.log(anObj);
                    this.pushObject(anObj);
                }
            }
        }}
        //console.log(this.get('content'));
        //console.log(removal);
        for(var k=0;k<removal.length;k++){
            if (removal[k] == '') break;
            //console.log("REMOVAL FOUND SO REMOVING!");
            var theItem = this.findProperty(this.get('clearid'),parseInt(removal[k]));
            this.removeObject(theItem);
        }
        //console.log(this.get('length'));
        //this.set('item',this.get('firstObject'));

        this.set('loaded',true);
        this.clear();

    }.observes('step'),

    //A Quick Way to Assign Data without AJAX
    populate:function (objects, meta) {
        //This wont' do anything, since objects are already set
        //console.log(objects);
        this.set('loaded',false);
        //If we want to populate collection's meta too
        if (meta) this.set('meta',meta);
        this.set('objects',objects);
        this.set('response',{'result':'success'});
        this.set('step','success');
    },

    getItemByProperty:function (property, value, index) {
        var thitem = this.findProperty(property, value);
        if (thitem) {
            this.set('item', thitem);
            return thitem;
        }
    },

    getListByProperty: function(property,value,index) {
        var thitems = this.filterProperty(property,value);
        if (thitems) {
            return thitems;
        }
    },

    read: function( url, args, event ) {

        this.set('loaded',false);

        if ((url == null) && (this.url != null)) {
            url = this.url;
        }
        if (this.step != null) return;

        this.set('step', 'transit');
        this.event = event;
        this.args = args;

        var data = $.extend(this.args, this.options);

        this.currentReq = $.ajax({
            type:'GET',
            url:url,
            data:$.param(data, true),
            dataType:'json',
            context:this,
            timeout:this.onTimeout,
            complete:this.onComplete,
            success:this.onSuccess,
            error:this.onFailure
        });

    },

    clear: function() {
        this.set('step',null);
        //console.log("@clear:: step is " + this.get('step'));
    },

    cancel:function () {
        if (this.currentReq != null) {
            this.currentReq.abort();
        }
        this.clear();
    },

    onComplete:function (response) {
        //console.log("COLLECTION COMPLETE " + this.type);
        $(this).trigger(this.event + '_complete', response);
    },

    onSuccess:function (response) {
        //console.log("COLLECTION SUCCESS " + this.type);
        this.set('response', response.response);
        this.set('meta', response.meta);
        this.set('objects', response.objects);
        $(this).trigger(this.event + '_success', response);
        this.set('step', response.response.result);
    },

    onFailure:function (response) {
        //console.log("COLLECTION FAILURE " + this.type);
        $(this).trigger(this.event + '_failure', response);
        this.set('step', 'failure');
    },

    onTimeout:function (response) {
        //console.log("COLLECTION TIMEOUT " + this.type);
        $(this).trigger(this.event + '_timeout', response);
        this.set('step', 'failure');
    },

    sum:function () {
        // use reduce function on Ember.Enumerable https://github.com/emberjs/ember.js/blob/master/packages/ember-runtime/lib/mixins/enumerable.js#L497-537
        var sumCounter = this.get('summer');
        var sum = this.collection.reduce(function (prevVal, item) {
            // prevVal is NaN for the first iteration
            //console.log(prevVal);
            //console.log(parseInt(item.get('amount_converted')));
            return (prevVal || 0) + parseInt(item.get(sumCounter));

        });
        // if there are no numbers, sum is undefined
        return (sum || 0);
    }.property('@each')

});
