//********************************
//  CONTROLLERS
//********************************
//This is the simple TODO Example
//http://addyosmani.github.com/todomvc/architecture-examples/emberjs/index.html

App.addressbookList = Em.Object.create({
    
    type: Collectrium.addressbookContact,
    item:null,
    collection:null,
    connection: null,
    page: 1,
    process: null,
    state: null,
    cancelled: false,
    view: null,
    urlSource: null,
    reserve: null,
    share: null,
    loadTimeout: null,
    pageNode: null,
    pagination:  null,
    error: null,
    filter: null,
    size: null,
    
    init: function() {
        
        //Set the initial property values
        this.set('error',error);
        this.error.basenode = $("#ab_alert");
        this.error.titlenode = $("#ab_alert_title");
        this.error.messagenode = $("#ab_alert_message");
        
        this.form = new collectrium_addressbook.forms( {} );
        
        this.pageNode = $('.ab_pages');
	    this.pagination = new collectrium.pagination({}, this.pageNode);
	    $(this.pagination).bind('paginate', _.bind(this.paginate, this));
        
        this.set('process','init');
        this.set('state','init');
        this.set('view','list');
        this.set('size','large');
        
        this.set('urlSource',"/services/api/v1/address_book/list/");
        this.set('collection',Collectrium.Collection.create());
        this.collection.set('type',this.type);
        
        //Grab Page One
        $(this.collection).bind("get_contacts_failure",this.noPage);
        
        this.list();
        
        this.initUploader();
        
    },
    
    initUploader: function() {
        var scope = this;
        
        this.importer = $('#addressbook_import').fileupload(
                {url: '/services/api/v1/address_book/upload/',
                maxNumberOfFiles: false,
                autoUpload: true,
                parentnode: '#addressbook_import',
                dropZone: $("#addressbookUploadView"),
                title: 'Select an Excel spreadsheet or csv file, or drag and drop one or more files into the grey area. <a href="/_resources/static/contact_spreadsheet.xls">Download a spreadsheet template here</a>...',
                acceptFileTypes: /(\.|\/)(csv|xls|xlsx)$/i,
                completed:_.bind( scope.importResult, scope),
                failed:_.bind(scope.importResult, scope),
                });
    },
    
    importResult: function() {
        this.set('view','list');
        this.list();
    },
    
    setItem: function(id) {
        //console.log("@setItem");
        this.collection.getItemByProperty('id',id);
        this.form.item = this.collection.get('item');
    },
    
    clearItem: function() {
        this.form.item = null;
        this.form.assignItem();    
    },
    
    searchArgs: function() {
        var args = {};
        
        if (this.get('filter')) {
            args.filter = this.get('filter');
        }
        if (this.get('term')) {
            args.term = this.get('term');
        }
        args.size = this.get('size');
        args.page = this.get('page');
        return args;
    },
    
    //This checks to see if the DOM is populated
    //If not, it will trigger a search.
    relist: function() {
        //console.log("@presearch");
        if (this.collection.get('inDom') == 0) {
            this.prelist();
        }
    },
    
    prelist: function() {
        //console.log("@presearch");
        this.collection.cancel();
        this.set('view','list');
        this.list();
    },
    
    list: function() {
        //console.log('@search');
        this.collection.set('content',[]);
        this.collection.set('inDom',0);
        this.set('page',1);
        this.set('state','init');
        this.set('step',null);
        this.read();
    },
    
    paginate: function(e, page) {
        //console.log("@paginate:: page is " + this.get('page'));
		this.collection.set('step',null);
        //console.log("@paginate:: step is " + this.collection.get('step'));
        this.collection.set('content',[]);
        this.collection.set('inDom',0);
        this.set('page',page);
        this.set('state','init');
        this.set('step',null);
        this.read();
    },
    
    cancel: function() {
        //console.log("cancel");
        this.collection.cancel();
        this.set('cancelled',true);
        this.set('state',null);
        $("#loading").fadeOut();
    },
    
    read: function() {
      var scope=this;
      //console.log("@read");
      //console.log("@read:: state is " + this.get('state'));
      //console.log("@read:: step is " + this.collection.get('step'));
      if ((this.get('state') != 'eof') && (this.collection.get('step') == null)) {
        
        clearTimeout(this.loadTimeout);
        var scope = this;
        
        $(".ab_nocontacts").hide();
        $(".ab_loading").show();
        $(this.collection).bind('get_contacts_success', _.bind(this.complete,this));
        //Note, the searchArgs method sets the urlSource, so need to call prior to read
        args = this.searchArgs();
        //console.log(args);
        this.collection.read(this.get('urlSource'), args, "get_contacts" );
        //this.collection.read("/images"+this.get('page')+".json", this.searchArgs(), "get_images" );
      }
    },
    
    complete: function( event, result ) {
        //console.log("complete");
        $(".ab_loading").fadeOut();
        if (result.meta.current_results == 0) {
            //console.log("none");
            $(".ab_nocontacts").show();
        } else {
            if (this.pagination) {
    			this.pagination.render(result.meta);
    		}
        }
        this.collection.clear();
    },
    
    noPage: function( event, result ) {
        if (App.addressbookList.get('state') === 'eof') return;
        //console.log("@noPage:: 'process' set to 'eof'");
        App.addressbookList.set('state','eof');
    },
    
    toggleView: function(id) {
       if (this.get('view') === 'list') {
         this.clearItem();
         this.set('view','detail');
       } else {
         this.set('view','list');
       }  
    },
    
    setView: function() {
        //console.log("Set");
        this.form.action = this.get('view');
        this.form.assignItem();
        
        if (this.get('view') == 'list') {
            $("#addressbookListView").queue(function() {
                $("#addressbookUploadView").hide();
                $("#addressbookDeleteView").hide();
                $("#addressbookDetailView").hide();
                $(this).fadeIn();
                $(".address_actions .action").html("Add a Contact");
                $(".address_actions .upload").show();
                $(this).dequeue();
            });
        } else if ((this.get('view') == 'detail') || (this.get('view') == 'edit'))  {
            $("#addressbookDetailView").queue(function() {
                $("#addressbookUploadView").hide();
                $("#addressbookDeleteView").hide();
                $("#addressbookListView").hide();
                $(this).fadeIn();
                $(".address_actions .action").html("View Contacts");
                $(".address_actions .upload").hide();
                $(this).dequeue();
            });
        } else if (this.get('view') == 'delete') {
            $("#addressbookDeleteView").queue(function() {
                $("#addressbookUploadView").hide();
                $("#addressbookDetailView").hide();
                $("#addressbookListView").hide();
                $(this).fadeIn();
                $(".address_actions .action").html("View Contacts");
                $(".address_actions .upload").hide();
                $(this).dequeue();
            });
        } else if (this.get('view') == 'upload') {
            $("#addressbookUploadView").queue(function() {
                $("#addressbookDetailView").hide();
                $("#addressbookDeleteView").hide();
                $("#addressbookListView").hide();
                $(this).fadeIn();
                $(".address_actions .action").html("View Contacts");
                $(".address_actions .upload").hide();
                $(this).dequeue();
            });
        }
            
    }.observes('view'),
    
    assignDetail: function( obj ) {
        this.get('collection').set("item",obj);
    },
    
    assignItem: function() {
		//console.log("Collection");
		
    }.observes("this.collection.item"),
    
    showError: function( type, title, message ) {
        //console.log("SHOWING ERROR of " + type + " WITH " + title + " AND " + message);
        this.error.showError( type, title, message );    
    }
  
});
