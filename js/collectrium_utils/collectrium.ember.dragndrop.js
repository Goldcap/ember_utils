// JavaScript Document
DragNDrop = Ember.Namespace.create();

DragNDrop.cancel = function(event) {
    event.preventDefault();
    return false;
};

DragNDrop.Dragable = Ember.Mixin.create({
    attributeBindings: 'draggable',
    draggable: 'true',
    dragStart: function(event) {
        var dataTransfer = event.originalEvent.dataTransfer;
        dataTransfer.setData('source', this.get('elementId'));
    }
});

DragNDrop.Droppable = Ember.Mixin.create({
    dragEnter: DragNDrop.cancel,
    dragOver: DragNDrop.cancel,
    drop: function(event) {       
        event.preventDefault();
        return false;
    }
});
