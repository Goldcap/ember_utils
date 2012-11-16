// JavaScript Document
var collectrium = collectrium || {};
collectrium.pagination = function(options, domNode) {
	this.options = $.extend({
		ptag: 'p'
	}, options);
	this.domNode = $(domNode);
	this.pagingContainer = $('ul', this.domNode);
	this.init();
}

collectrium.pagination.prototype = {

	templatePage: '<li><a><%= page %></a></li>',
    
	init: function() {
		this.isRunning = false;
		this.attachEvents();
	},

	attachEvents: function() {
		$('a', this.domNode).live('click', _.bind(this.onButtonClick, this))
	},
  
	render: function(meta) {
        
		this.currentPage = parseInt(meta.currentPage);
        window.location.hash = this.options.ptag + '=' + this.currentPage;
        if (typeof(meta.limit) != "undefined") {
            meta.rpp = meta.limit;
        }
        
        if (typeof(meta.totalresults) != "undefined") {
		  var totalPages = Math.ceil(meta.totalresults / meta.rpp);
        } else if  (typeof(meta.total_count) != "undefined") {
          var totalPages = Math.ceil(meta.total_count / meta.rpp);
          meta.totalresults = meta.total_count;
        }
        this.pagingContainer.empty();
        
        //console.log("rendering " + totalPages);
        
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
			$(this).trigger('paginate', button.data('index'))
		}
	}
}