// JavaScript Document
//TODO:: Move to 1.0 and use this.get('propertyNames')
Collectrium.TableData = Ember.Namespace.create();
get = Ember.get;
fmt = Ember.String.fmt;
set = Ember.set;

Collectrium.TableData.TableCollection = Collectrium.Collection.extend({

    headers:null,

    init:function () {
        this._super();

        this.set('headers', []);
        //The headers are considered a "row"
        //But they are in their own collection
        //And there is only one item in that collection
        this.set('headers', Collectrium.Collection.create());
        this.get('headers').set('clearpost', true);
        this.get('headers').set('type', this.type);
    },

    clearHeaders:function () {
        this.set('headers', []);
    },

    unfetch:function () {
        //console.log("@tabledata.clearContent");
        this._super();
        this.get('headers').get('firstObject').set('table_checked', false);
    },

    paginate:function () {
        //console.log("@tabledata.paginate");
        this._super();
        if (this.get('headers').get('firstObject')) { 
            this.get('headers').get('firstObject').set('table_checked', false);
        }
    },

    //We'll be adding Headers from the object
    //Every time we add items to a collection
    complete:function () {
        this._super();
        //console.log("complete");
        if (this.get('step') != 'success') return;
        if (this.get('headers.length') == 1) return;
        this.get('headers').pushObject(this.type.create({"table_header":true}));
    }.observes('step'),

});

Collectrium.TableData.Table = Ember.Object.extend({

    table_action:null,
    sort_action_asc:null,
    sort_action_desc:null,
    filter:null,
    pagination:null,
    headers:null,
    args:{},

    filter_action:function () {
        return this.get('filter');
    }.property('filter'),

    canseek:false,
    rpp:4,

    init:function () {
        this._super();

        this.set('headers', []);
        this.set('sort_action_asc', []);
        this.set('sort_action_desc', []);
        this.set('args', {});

        //Use this object to index properties on our specific model
        this.set('proto', this.get('itemType').create());

    },

    readArgs:function (target) {

        //console.log(this.get('filter_action'));
        if (this.get('filter_action') != null)
            this.get(target + '.params').set("filter_action", this.get('filter_action'));

        sort = "";
        if (this.get('sort_action_asc').length > 0) {
            for (i = 0; i < this.get('sort_action_asc').length; i++) {
                //console.log(this.get('sort_action_asc')[i] + ' asc,');
                sort += this.get('sort_action_asc')[i] + '|asc,';
            }
        }
        if (this.get('sort_action_desc').length > 0) {
            for (i = 0; i < this.get('sort_action_desc').length; i++) {
                //console.log(this.get('sort_action_desc')[i] + ' desc,');
                sort += this.get('sort_action_desc')[i] + '|desc,';
            }
        }
        if (sort == "") {
            sort = null;
        } else {
            this.get(target + '.params').set("sort", sort);
        }
        //this.args.sort = this.get('sort');
        this.get(target + '.params').set("rpp", this.get('rpp'));
    }


});

Collectrium.TableData.TableData = Ember.Mixin.create(Collectrium.Serializable, {

    table_checked:false,
    table_header:false,
    table_status:'notstatus',

    //Use this to get a full list of our visible cells
    //Set in the model we're drawing
    listedPropertyNames:function () {
        //console.log(this.get('invisibles'));
        var scope = this;
        var propertyNames = [];
        $.each(this.get('listed'), function (index, item) {

            if (item.substring(0, 5) == "item_") {
                label = item.substring(5, item.length);
            } else {
                label = item;
            }
            var name = label.substring(0, 1).toUpperCase() + label.substring(1, label.length).toLowerCase();

            propertyNames.push({"name":name, "label":label});
        });
        return propertyNames;
    }.property(),

    getVisiblePropertyNames:function () {
        //console.log(this.get('invisibles'));
        var propertyNames = [];
        var invisibles = this.get('invisibles') || [];
        $.each(this.getPropertyNames(), function (index, item) {
            //console.log(item);
            if ($.inArray(item, invisibles) == -1) {
                propertyNames.push(item);
            }
        });
        return propertyNames;
    }
});

Collectrium.TableData.TableView = Ember.ContainerView.extend({

    childViews:["filter", "list", "footer"],
    managerBinding:null,
    contentBinding:null,

    selector:null,
    action:null,
    target:null,
    classNames:['row'],
    pagerTableType:'default',
    pagerItemStripLength:null,
    floatHeader:false,
    horizontalScroller:false,

    donePage:function () {
        this.get('childViews')[1].forceHeight(this.get("content.clearstate"));
    }.observes('content.clearstate'),

    filter:Ember.View.extend({

        rpp_opts:[ 15, 30, 50 ],

        template:Ember.Handlebars.compile('<div class="one columns">{{view Ember.Select contentBinding="view.rpp_opts" valueBinding="view.parentView.content.pagination.rpp" selectionBinding="view.parentView.content.pagination.rpp"}}</div><div class="one columns"><button class="button secondary small" {{action doRpp}}>List</button></div><div class="four columns offset-by-five doright">{{view Ember.TextField valueBinding="view.parentView.manager.filter"}}</div><div class="one columns doright"><button class="button secondary small" {{action doFilter}}>Filter</button></div>'),
        classNames:['twelve', 'columns', 'editable-filter'],

        init:function () {
            this._super();
            this.set('rpp', this.get('parentView.content.pagination.rpp'));
        },

        doRpp:function () {
            //console.log("RPP:" + this.get('rpp'));
            this.set('parentView.content.pagination.page', 1);
            this.get('parentView.content').refresh();
            //console.log(this.get('filter'));
        },

        doFilter:function () {
            //console.log(this.get('parentView.manager.filter'));
            this.set('parentView.content.pagination.page', 1);
            this.get('parentView.content.params').set('filter', this.get('parentView.manager.filter'));
            this.get('parentView.content').refresh();

        }

    }),

    list:Ember.CollectionView.extend({
        headed: false,
        contentBinding:"parentView.content",
        itemViewClass:"Collectrium.tableDataRow",
        tagName:"table",
        classNames:['editable', 'editable-body'],

        forceHeight:function (aheight) {
            //console.log(this.get('parentView.content.length'));
            if (this.get('parentView.content.length') > 0) {
                this.$().css('height', ($('.editable-body td').height() * this.get('parentView.content.length')) + 'px');
                //this.$().css('overflow-y','none');
            }
        },

        /*
         *
         * To avoid manualy setting childView we add header already rendered view in table's thead
         * Which breaks the link between this view and the parent view!!! Doh!
         * To avoid problems like this in the future, we will pass a hardcoded reference to "parentView"         
         */
        addHeader:function () {
            if(! this.get('parentView.content.loaded')) return;
            console.log(this.get('parentView.content.loaded'));
            var header = Collectrium.tableDataRow.create({
                content:this.get('parentView.content.headers.content')[0],
                classNames:['editable', 'editable-header'],
                parentView: this
            });
            if (this.$('thead').length > 0) {
                this.$('thead tr').remove();
            } else {
                this.$().prepend('<thead/>');
            }
            header.appendTo(this.$('thead'));
        }.observes('parentView.content.loaded'),

        init:function () {
            this.set('tableType', this.get("parentView.pagerTableType"));
            if (this.tableType === 'stripped') this.set('itemStripLength', this.get("parentView.pagerItemStripLength"));
            this._super();
        },

        didInsertElement:function () {
            //this.addHeader();
            //jScrollPane works rather weird with table, so we have to wrap it with div
            this.$().wrap('<div class="twelve columns" />').wrap('<div class="horizontal-only" />');
        },

        /*
         *
         * Triggers when all images are loaded
         *
         * */

        didLoadImages:function () {
            if (this.get('_allViewsLoaded')) {
                var scope = this;

                /*
                 *
                 * Checking if all images from childViews are loaded
                 * Works only with img tags that have "src" attribute and it's not empty
                 *
                 * */

                this.$().waitForImages(function () {
                    if (scope.get("parentView.horizontalScroller")) {
                        if (scope.$().parents('.horizontal-only').data().jsp) scope.$().parents('.horizontal-only').data().jsp.destroy();
                        scope.$().parents('.horizontal-only').jScrollPane();
                    }
                    if (scope.get("parentView.floatHeader")) {
                        scope.$().floatHeader({
                            withScroll:true
                        });
                    }
                });
                this._currentViewsToLoad = 1;
                this.set('_allViewsLoaded', false);
            }
        }.observes('_allViewsLoaded')
    }),

    footer:Collectrium.PaginatorView.extend({
        "collectionBinding":"parentView.content",
        classNames:['editable-pagination', 'twelve', 'columns']
    })
});

Collectrium.tableDataRow = Ember.ContainerView.extend({

    tagName:"tr",
    action:null,
    classNameBindings:['content.table_status'],

    init:function () {
        var scope = this,
            listedProperties = this.get('parentView.parentView.manager.proto.listedPropertyNames') || this.get('content.listedPropertyNames')
        $.each(listedProperties, function (index, item) {
            if ((scope.get('content.views')) && (scope.get('content.views')[index]) && (scope.get('content.views')[index] != null)) {
                var td = Ember.get(scope.get('content.views')[index]).create({content:scope.get('content').get(item["label"]), "index":index, "name":item["name"], "label":item["label"]});
            } else {
                var td = Collectrium.TableDataCell.create({"index":index, "name":item["name"], "label":item["label"], content:scope.get('content.' + item["label"])});
            }
            scope.get('childViews').pushObject(td);
        });

        this._super();
    },
    didInsertElement:function () {
        if (this.get('parentView')) {
            var currentViewsToLoad = this.get('parentView._currentViewsToLoad') || 1,
                totalViewsToLoad = this.get('parentView.childViews.length');
            currentViewsToLoad === totalViewsToLoad ? this.set('parentView._allViewsLoaded', true) : this.set('parentView._currentViewsToLoad', currentViewsToLoad + 1)
        }
    }
});

//Todo: Remove this code we dont need hardcoded width anymore

Collectrium.TableDataCellBase = Ember.View.extend({
    attributeBindings:["style"],

    style:function () {
        if ((this.get('parentView.content.widths')) && (this.get('parentView.content.widths')[this.get('index')] != null))
            return "width:" + this.get('parentView.content.widths')[this.get('index')];
    }.property()
});

Collectrium.TableDataCell = Collectrium.TableDataCellBase.extend({

    tagName:'td',
    name:null,
    value:null,
    checked:null,
    classNameBindings:['name'],

    sorting:'both',
    editing:'notediting',
    viewing:'viewing',
    attrs:{},
    nullVal:"No Data",
    hrefDelim: function() {
        if (this.get('parentView.content.hrefDelim')) {
            return this.get('parentView.content.hrefDelim');
        } else {
            return "|";
        }
    }.property('parentView.content.hrefDelim'),

    index:0,

    name_header:function () {
        if ((this.get('parentView.content.names')) && (this.get('parentView.content.names')[this.get('index')] != null))
            return this.get('parentView.content.names')[this.get('index')];
        return this.get('name').replace('_', ' ');
    }.property('name'),


    //HREF's are pipe-delimited strings, with content|href format
    href:function () {
        //console.log(this.get('content').toString());
        if ((this.get('content') != null) && (this.get('content') != "undefined")) {
            return this.get('content').toString().split(this.get("hrefDelim"))[0];
            //return '<a href="'+attrs[1]+'">'+ attrs[0] + '</a>';
        } else {
            return "No Data";
        }
    }.property('content'),

    hrefClick:function () {
        if ((this.get('content') != null) && (this.get('content') != "undefined")) {
            window.open(this.get('content').toString().split(this.get("hrefDelim"))[1]);
        } else {
            return "No Data";
        }
    },

    as:function () {
        if ((this.get('parentView.content.types')) && (this.get('parentView.content.types')[this.get('index')] != null))
            return this.get('parentView.content.types')[this.get('index')];
        return 'text';
    }.property(),

    sortable:function () {
        if ((this.get('parentView.content.sorts')) && (this.get('parentView.content.sorts')[this.get('index')] != null))
            return this.get('sorting');
    }.property('sorting'),

    doBlur:function () {
        this.set('editing', 'notediting');
        this.set('viewing', 'viewing');
    },

    doClick:function () {
        if (this.get('editing') == 'notediting') {
            this.set('editing', 'editing');
            this.set('viewing', 'notviewing');
        } else {
            this.set('editing', 'notediting');
            this.set('viewing', 'viewing');
        }
    },

    facetedClick:function () {
        //console.log(this.get('content') + " " + this.get('label'));
        this.get('parentView.content').set(this.get('label'), this.get('content'));
        this.get('parentView.parentView.parentView.manager.form').set('facet', this.get('label'));
        this.get('parentView.parentView.parentView.manager.form').set('item', this.get('parentView.content'));
        this.get('parentView.parentView.parentView.manager.form').set('action', 'facet');
        return;
        //console.log("FACET");
    },

    editClick:function () {
        this.get('parentView.parentView.parentView.manager.form').set('item', this.get('parentView.content'));
        this.get('parentView.parentView.parentView.manager.form').set('action', 'edit');
        return true;
    },

    deleteClick:function () {
        this.get('parentView.parentView.parentView.manager.form').set('item', this.get('parentView.content'));
        this.get('parentView.parentView.parentView.manager.form').set('action', 'delete');
        return true;
    },

    selectAllClick:function () {
        if (this.get('parentView.content.table_checked')) {
            this.get('parentView.content').set('table_checked', false);
            //this.get('parentView.parentView.parentView.headers').setEach('table_checked',false);
            this.get('parentView.parentView.content').setEach('table_checked', false);
        } else {
            this.get('parentView.content').set('table_checked', true);
            //this.get('parentView.parentView.parentView.headers').setEach('table_checked',true);
            this.get('parentView.parentView.content').setEach('table_checked', true);
        }
        this.hardUpdateAllCount();
        return true;
    },

    checkClick:function () {
        if (this.get('parentView.content.table_checked')) {
            this.get('parentView.content').set('table_checked', false);
            this.get('parentView.parentView.parentView.content').set('table_checked', false);
        } else {
            this.get('parentView.content').set('table_checked', true);
            this.get('parentView.parentView.parentView.content').set('table_checked', true);
        }
        this.hardUpdateCount();
        return true;
    },
    
    //Never did get this binding working...
    //Too busy to figure out why:
    hardUpdateAllCount:function () {
        var len = this.get('parentView.parentView.content.content').filterProperty('table_checked', true).get('length');
        this.get('parentView.parentView.parentView.content').set('selected', len);
    },


    //Never did get this binding working...
    //Too busy to figure out why:
    hardUpdateCount:function () {
        var len = this.get('parentView.parentView.content.content').filterProperty('table_checked', true).get('length');
        this.get('parentView.parentView.parentView.content').set('selected', len);
    },

    headerClick:function () {
        if (this.get('sorting') == 'none') return;
        if (this.get('sorting') == 'both') {
            this.get('parentView.childViews').setEach('sorting', 'both');
            this.set('sorting', 'asc');
            this.set('parentView.parentView.parentView.manager.sort_action_desc', []);
            this.get('parentView.parentView.parentView.manager.sort_action_asc').pushObject(this.get('value'));
        } else if (this.get('sorting') == 'asc') {
            this.get('parentView.childViews').setEach('sorting', 'both');
            this.set('sorting', 'desc');
            this.set('parentView.parentView.parentView.manager.sort_action_asc', []);
            this.get('parentView.parentView.parentView.manager.sort_action_desc').pushObject(this.get('value'));
        } else {
            this.get('parentView.childViews').setEach('sorting', 'both');
            this.set('parentView.parentView.parentView.manager.sort_action_desc', []);
            this.set('parentView.parentView.parentView.manager.sort_action_asc', []);
            this.set('sorting', 'both');
        }
        this.set('parentView.parentView.parentView.manager.canseek', true);
        return true;
    },

    template:function () {
        if (this.get('parentView.parentView.tableType') === 'stripped') {
            return this._strippedTemplate();
        }
        else {
            return this._defaultTemplate();
        }
    }.property(),

    _strippedTemplate:function () {

        var maxTextLength = this.get('parentView.parentView.itemStripLength');
        if (this.get('content') && this.get('content').length > maxTextLength)
            this.set('content', this.get('content').toString().replace(/<[^>]*>?/gi, '').substr(0, maxTextLength) + '...');

        if (this.get('parentView.content.table_header')) {
            if (this.get('as') == 'checkbox') {
                return Ember.Handlebars.compile('<input type="checkbox" {{action selectAllClick}} {{bindAttr checked="view.parentView.content.table_checked"}} />');
            } else {
                return Ember.Handlebars.compile('<span {{ bindAttr class="view.sortable" }} {{ action headerClick }}>{{view.name_header}}</span>');
            }
        }
        else if (this.get('as') == 'html') {
            return Ember.Handlebars.compile('{{{view.content}}}');
        } else if (this.get('as') == 'href') {
            return Ember.Handlebars.compile('<a {{ action hrefClick }}>{{{ view.href }}}</a>');
        } else if (this.get('as') == 'boolean') {
            if (this.get('content') == true) {
                return Ember.Handlebars.compile('<span style="color:green">True</span>');
            } else {
                return Ember.Handlebars.compile('<span style="color:red">False</span>');
            }
        } else if (this.get('as') == 'yesno') {
            if (this.get('content') == true) {
                return Ember.Handlebars.compile('<span style="color:green">Yes</span>');
            } else {
                return Ember.Handlebars.compile('<span style="color:red">No</span>');
            }
        } else if (this.get('as') == 'pending') {
            if (this.get('content') == true) {
                return Ember.Handlebars.compile('<span style="color:green">Approved</span>');
            } else {
                return Ember.Handlebars.compile('<span style="color:red">Pending</span>');
            }
        } else if (this.get('as') == 'checkbox') {
            return Ember.Handlebars.compile('<input type="checkbox" {{action checkClick}} {{bindAttr value="view.parentView.content"}} {{bindAttr checked="view.parentView.content.table_checked"}} />');
        } else if (this.get('as') == 'edit') {
            return Ember.Handlebars.compile('<img src="/_resources/images/Neu/12x12/actions/document.png" {{ action editClick }} />');
        } else if (this.get('as') == 'delete') {
            return Ember.Handlebars.compile('<img src="/_resources/images/Neu/12x12/actions/dialog-cancel.png" {{ action deleteClick }} />');
        } else if (this.get('as') == 'editable') {
            return Ember.Handlebars.compile('<span {{ bindAttr class="view.viewing" }} {{ action doClick }} >{{#if view.content}}{{view.content}}{{ else }} {{ view.nullVal }} {{/if}}</span><span {{ bindAttr class="view.editing" }} >{{view Collectrium.EditableTextField valueBinding="view.content" parentBinding="view"  }}</span>');
        } else if (this.get('as') == 'text') {
            return Ember.Handlebars.compile('{{#if view.content}}{{view.content}}{{ else }} {{ view.nullVal }} {{/if}}');
        } else if (this.get('as') == 'image') {
            return Ember.Handlebars.compile('{{#if view.content}} <img src="{{unbound view.content}}"/> {{else}} <img src="/_resources/img/placeholder_images/no_image_120.png" /> {{/if}}');
        } else {
            console.log("untyped columns aren't allowed");
        }
    },
    
    _defaultTemplate:function () {
        if (this.get('parentView.content.table_header')) {
            if (this.get('as') == 'checkbox') {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner"><input type="checkbox" {{action selectAllClick}} {{bindAttr checked="view.parentView.content.table_checked"}} /></div></div>');
            } else {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner"><span {{ bindAttr class="view.sortable" }} {{ action headerClick }}>{{view.name_header}}</span></div></div>');
            }
        } else if (this.get('as') == 'html') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner">{{{view.content}}}</div></div>');
        } else if (this.get('as') == 'href') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><a {{ action hrefClick }}>{{{ view.href }}}</a></div></div>');
        } else if (this.get('as') == 'boolean') {
            if (this.get('content') == true) {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:green">True</div></div>');
            } else {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:red">False</div></div>');
            }
        } else if (this.get('as') == 'yesno') {
            if (this.get('content') == true) {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:green">Yes</div></div>');
            } else {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:red">No</div></div>');
            }
        } else if (this.get('as') == 'pending') {
            if (this.get('content') == true) {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:green">Approved</div></div>');
            } else {
                return Ember.Handlebars.compile('<div class="outer"><div class="inner" style="color:red">Pending</div></div>');
            }
        } else if (this.get('as') == 'checkbox') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><input type="checkbox" {{action checkClick}} {{bindAttr value="view.parentView.content"}} {{bindAttr checked="view.parentView.content.table_checked"}} /></div></div>');
        } else if (this.get('as') == 'edit') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><img src="/_resources/images/Neu/12x12/actions/document.png" {{ action editClick }} /></div></div>');
        } else if (this.get('as') == 'delete') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><img src="/_resources/images/Neu/12x12/actions/dialog-cancel.png" {{ action deleteClick }} /></div></div>');
        } else if (this.get('as') == 'editable') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><span {{ bindAttr class="view.viewing" }} {{ action doClick }} >{{#if view.content}}{{view.content}}{{ else }} {{ view.nullVal }} {{/if}}</span><span {{ bindAttr class="view.editing" }} >{{view Collectrium.EditableTextField valueBinding="view.content" parentBinding="view"  }}</span></div></div>');
        } else if (this.get('as') == 'text') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner"><span>{{#if view.content}}{{view.content}}{{ else }} {{ view.nullVal }} {{/if}}</span></div></div>');
        } else if (this.get('as') == 'image') {
            return Ember.Handlebars.compile('<div class="outer"><div class="inner">{{#if view.content}}<img src="{{unbound view.content}}"/> {{else}} <img src="/_resources/img/placeholder_images/no_image_120.png" />{{/if}}</div></div>');
        } else {
            console.log("untyped columns aren't allowed");
        }
    }
});
