// JavaScript Document
Collectrium.imageItemView = Ember.View.extend({
    
    template: Ember.Handlebars.compile('<img {{ bindAttr width="view.content.width" }} {{ bindAttr height="view.content.height" }} {{ bindAttr src="view.content.location" }} {{ bindAttr alt="view.content.name" }} />'),
    classNameBindings: ['unused'],
    tagname: "li"

});

Collectrium.fileItemView = Ember.View.extend({
    
    template: Ember.Handlebars.compile('<a {{ bindAttr href="view.content.url" }}>{{view.content.name}}</a>'),
    classNameBindings: ['active'],
    tagname: "div"

});