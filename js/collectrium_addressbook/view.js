//********************************
//  VIEWS
//********************************
//http://stackoverflow.com/questions/7174487/writing-custom-controls-in-sproutcore-2/8453715#8453715
App.addressbookLinkView = Em.View.extend({

    tagName: "a",

    click: function(e) {
        $(".address_book").draggable();
        $(".address_book").fadeIn();
        $(".ab_loading").fadeOut();
        $(".address_book .close-reveal-modal").click(function(){
            $(".ab_loading").fadeOut();
            $(".address_book").fadeOut();
        });
    }
});

App.addressbookAZ = Em.View.extend({

    click: function(e) {
        var letter = $(e.target).attr("data");
        App.addressbookList.set('filter',letter);
        App.addressbookList.paginate(null,1);
    }

});

App.addressbookNewView = Em.View.extend({

    tagName: "ul",
    classNames: ['address_list','address_actions','block-grid'],
    setNew: function(e) {
        if (App.addressbookList.get('view') != 'list') {
            App.addressbookList.set('view','list');
        } else {
            App.addressbookList.clearItem();
            App.addressbookList.set('view','detail');
        }

    },

    setUpload: function(e) {
        App.addressbookList.clearItem();
        App.addressbookList.set('view','upload');
    }

});

App.addressbookControlView = Em.View.extend({

    keyDown: function(e) {
        if (e.keyCode === 13) {
            App.addressbookList.prelist();
            return false;
        }
    },

    goBig: function(e) {
        //console.log("BIG");
        App.addressbookList.set('size','large');
        App.addressbookList.paginate(null,1);
    },

    goHome: function(e) {
        //console.log("HOME");
        App.addressbookList.set('size','small');
        App.addressbookList.paginate(null,1);
    }
});

App.addressbookListView = Em.CollectionView.extend({

    itemViewClass: "App.addressbookContactView",
    contentBinding: "App.addressbookList.collection",
    classNames: ['address_list','block-grid'],
    tagName: "ul"

});

App.addressbookContactView = Em.View.extend({

    templateName: "addressbookContactView",
    classNameBindings: ['content.large'],
    content: null,

    doDelete: function() {
        var contact = this.get('content');
        App.addressbookList.setItem(contact.get('id'));
        App.addressbookList.set('view','delete');
    },

    doEdit: function() {
        var contact = this.get('content');
        App.addressbookList.setItem(contact.get('id'));
        App.addressbookList.set('view','edit');
    }

});

App.addressbookDetailView = Em.View.extend({

    templateName: "addressbookDetailView",
    contentBinding: "App.addressbookList.collection.item"

});
