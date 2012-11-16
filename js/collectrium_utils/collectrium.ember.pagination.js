// JavaScript Document
//TODO:: ADD VIEWS AND BINDINGS TO PAGINATION
Collectrium.Page = Collectrium.Item.extend(Collectrium.Serializable, {
    page: 0,
    current: false
});

Collectrium.PaginatorView = Ember.View.extend({
        showPagination: function() {
            var self = this;
            this.$().fadeIn(700, function(){
                //self.set('isVisible', true);  //inform observers of `isVisible`
            });
        },
        
        hidePagination: function() {
            //console.log("ZINK");
            this.set('isVisible', false);  //inform observers of `isVisible`
        },   
    
        goMin: function() {
            this.get('collection.pagination').set('page',1);
            this.get('collection').refresh();
        },
        
        goMax: function() {
            this.get('collection.pagination').set('page',this.get('collection.pagination.totalPages'));
            this.get('collection').refresh();
        },
        
        goPage: function(e) {
            e.preventDefault();
            this.get('collection.pagination').set('page',$(e.target).attr('page'));
            this.get('collection').refresh();
            return false;
        },
        
        goPrevious: function(e) {
            e.preventDefault();
            this.get('collection.pagination').set('page',this.get('collection.pagination.page') - 1);
            this.get('collection').refresh();
        },
        
        goNext: function(e) {
            e.preventDefault();
            this.get('collection.pagination').set('page',this.get('collection.pagination.page') + 1);
            this.get('collection').refresh();
        },
        
        template: Ember.Handlebars.compile('<ul class="pagination">{{#if view.collection.pagination.hasExtendMin}}<li><a {{ action goMin }}>1</a></li><li>...</li>{{/if}}{{#if view.collection.pagination.hasPrevious}}<li><a {{ action goPrevious }}>&laquo;</a></li>{{/if}}{{#each view.collection.pagination}}<li {{bindAttr class="current"}}><a {{ action goPage }} {{bindAttr page="page"}} {{bindAttr thing="this"}}>{{page}}</li>{{/each}}{{#if view.collection.pagination.hasNext}}<li><a {{ action goNext }}>&raquo;</a></li>{{/if}}{{#if view.collection.pagination.hasExtendMax}}<li>...</li><li><a {{ action goMax }}>{{view.collection.pagination.totalPages}}</a></li>{{/if}}</ul>')
})
        
Collectrium.Paginator = Ember.ArrayController.extend({
    
    totalPages: null,
    page: 1,
    rpp: 15,
    startPage: 1,
    endPage: 5,
    isRunning: false,
    hasNext: false,
    hasPrevious: false,
    hasExtendMin: false,
    hasExtendMax: false,
    
    content: [],
    
    init: function() {
        
        this.set('content',[]);
        this.set('hasNext',false);
        this.set('hasPrevious',false);
        this.set('hasExtendMin',false);
        this.set('hasExtendMax',false);
        
        ///this.pages.pushObject(Collectrium.Page.create({"page":1,"current":true}));
        ///this.pages.pushObject(Collectrium.Page.create({"page":2,"current":false}));
        ///this.pages.pushObject(Collectrium.Page.create({"page":3,"current":false}));
        
    },
    
    render: function(meta) {
        if (meta == null) return;
        
		this.set('page',parseInt(meta.currentPage));
        //window.location.hash = this.ptag + '=' + this.currentPage;
		this.set('totalPages',Math.ceil(meta.totalresults / meta.rpp));
        
        //console.log("@render page: " + this.get('page'));
        //console.log("@render rendering: " + this.get('totalPages'));
        
        this.init();
        
        if ((this.get('page') > 1) && (this.get('totalPages') > 1)) this.set('hasPrevious',true);
        
        if (this.get('totalPages') > 4) {
			
            if (this.get('page') <= 3 && this.get('totalPages') > 6) {
				//console.log("@render switch 1:");
                this.set('startPage',1);
                this.set('endPage',this.get('startPage') + 4);
				this.set('hasNext',true);
				this.set('hasExtendMin',false);
                this.set('hasExtendMax',true);
			} else if (this.get('page') <= 3) {
				//console.log("@render switch 2:");
                this.set('startPage',1);
				this.set('endPage',this.get('startPage') + 5);
                this.set('hasExtendMin',false);
                this.set('hasExtendMax',false);
			} else if ((this.get('page') - 3) < 0) {
				//console.log("@render switch 3:");
                this.set('startPage',1);
                this.set('endPage',this.get('startPage') + 5);
                this.set('hasExtendMin',false);
                this.set('hasExtendMax',false);
			} else if ((this.get('page') - 2) >= 0 && (this.get('page') + 3) <= this.get('totalPages')) {
				//console.log("@render switch 4:");
                this.set('hasExtendMin',true);
				this.set('hasExtendMax',true);
				this.set('hasNext',true);
				this.set('startPage',this.get('page') - 1);
				this.set('endPage',this.get('page') + 1);
			} else if ((this.get('page') - 2) >= 0 && (this.get('page') + 3) >= this.get('totalPages')) {
				//console.log("@render switch 5:");
                this.set('hasExtendMin',true);
				this.set('hasExtendMax',false);
				this.set('hasNext',false);
                this.set('endPage',this.get('totalPages'));
				this.set('startPage',this.get('endPage') - 4);
			} else {
                //console.log("@render switch 6:");
                this.set('hasExtendMin',false);
                this.set('hasExtendMax',false);
				this.set('endPage',this.get('totalPages'));
                this.set('startPage',this.get('endPage') - 5);
			}

            if (this.get('extendMin')) {
                this.pages.pushObject(Collectrium.Page.create({"page":1,"current":false}));
			}
            //console.log("@render startPage: " + this.get('startPage'));
            //console.log("@render endPage: " + this.get('endPage'));
        
			for (var i = this.get('startPage'); i <= this.get('endPage'); i++) {
                //console.log('adding page ' + i);
                var current = (i == this.get('page')) ? true : false;
				this.pushObject(Collectrium.Page.create({"page":i,"current":current}));
			}

		} else {
            
			this.set('hasPrevious',false);
			this.set('hasNext',false);
            this.set('hasExtendMin',false);
            this.set('hasExtendMax',false);
                
            for (var i = 1; i <= this.get('totalPages'); i++) {
				var current = (i == this.get('page')) ? true : false;
				this.pushObject(Collectrium.Page.create({"page":i,"current":current}));
			}
		}
		this.set('isRunning',false);
    }
});

Collectrium.Pagination = Ember.Object.extend({

    templatePage: '<li><a><%= page %></a></li>',
    collection: null,
    type: Collectrium.page,
    ptag: 'p',
    domNode: ".pages",
    pagingContainer: null,
    view: null,
    page: 1,
    rpp: 15,
    
	init: function() {
        //this.view = collectrium.ember.paginateView.create();
        //this.view.appendTo(this.domNode);
        this.isRunning = false;
        this.pagingContainer = $('ul', this.domNode);
        $('a', this.domNode).live('click', _.bind(this.onButtonClick, this));    
    },
    
	render: function(meta) {
        
        if (meta == null) return;
        
		this.currentPage = parseInt(meta.currentPage);
        window.location.hash = this.ptag + '=' + this.currentPage;
		var totalPages = Math.ceil(meta.totalresults / meta.rpp);
        
        this.pagingContainer.empty();
        
        console.log("rendering " + totalPages);
        
        if (totalPages > 1) this.addPrevious();

		if (totalPages > 4) {
			var pageFloor, 
				pageCeil, 
				extendMin = false,
				extendMax = false;

			if (this.currentPage <= 3 && totalPages > 6) {
				pageFloor = 1;
				pageCeil = pageFloor + 4;
				extendMax = true;
			} else if (this.currentPage <= 3) {
				pageFloor = 1;
				pageCeil = pageFloor + 5;
			} else if ((this.currentPage - 3) < 0) {
				pageFloor = 1;
				pageCeil = pageFloor + 5;
			} else if ((this.currentPage - 2) >= 0 && (this.currentPage + 3) <= totalPages) {
				extendMin = true;
				extendMax = true;
				pageFloor = this.currentPage - 1;
				pageCeil = this.currentPage + 1;
			} else if ((this.currentPage - 2) >= 0 && (this.currentPage + 3) >= totalPages) {
				extendMin = true;
				pageCeil = totalPages;
				pageFloor = pageCeil - 4;
			} else {
				pageCeil = totalPages;
				pageFloor = pageCeil - 5;
			}

			if (extendMin) {
				this.addPage(1);
				this.addExtend();
			}
			for (var i = pageFloor; i <= pageCeil; i++) {
				this.addPage(i);
			}
			if (extendMax) {
				this.addExtend();
				this.addPage(totalPages);
			}

		} else {
			for (var i = 1; i <= totalPages; i++) {
				this.addPage(i);
			}
		}
		if (totalPages > 1) this.addNext(totalPages);
		this.isRunning = false;
	},
    
	addPage: function(index) {
		var data = {
			page: index
		}
        var page = $(_.template(this.templatePage, data));
        $('a', page).data('index', (index));
		if ((index) == this.currentPage) {
			$('a', page).parent().addClass('current');
		}
        page.appendTo(this.pagingContainer);

	},
	addNext: function(totalPages) {
		var data = {
			page: '&raquo;'
		}
		var button = $(_.template(this.templatePage, data));
		$('a', button).data('index', (this.currentPage + 1));
		if (this.currentPage == totalPages) $('a', button).parent().addClass('disabled');
		button.appendTo(this.pagingContainer);
	},
	addPrevious: function(totalPages) {
		var data = {
			page: '&laquo;'
		}
		var button = $(_.template(this.templatePage, data));
		$('a', button).data('index', (this.currentPage - 1));
		if (this.currentPage == 1) $('a', button).parent().addClass('disabled');
		button.appendTo(this.pagingContainer); 
	},
	addExtend: function() {
		$('<li class="extend">...</li>').appendTo(this.pagingContainer);
	},
	onButtonClick: function(e) {
        var button = $(e.target);
        if (!button.hasClass('current') && !button.hasClass('disabled') && !this.isRunning) {
			this.isRunning = true;
			this.set('page',button.data('index'));
            //$(this).trigger('paginate', )
		}
	}
});