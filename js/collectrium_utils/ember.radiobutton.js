Ember.RadioButton = Ember.View.extend({
  attributeBindings: ["isDisabled:disabled", "type", "name", "value"],
  classNames: ["ember-radio-button"],

  value: null,
  selectedValue: null,
  isDisabled: false,
  isChecked: false,
  tagName: "input",
  type: "radio",

  didInsertElement: function() {
    Ember.addObserver(this, 'isChecked', this, this.isCheckedDidChange);
    this.isCheckedDidChange();
  },

  willInsertElement: function() {
    Ember.removeObserver(this, 'isChecked', this, this.isCheckedDidChange);
  },

  selectedValueDidChange: Ember.observer(function() {
    Ember.set(this, 'isChecked', Ember.get(this, 'value') === Ember.get(this, 'selectedValue'));
  }, 'selectedValue'),

  isCheckedDidChange: function() {
    var isChecked = Ember.get(this, 'isChecked');

    this.$().prop('checked', isChecked ? 'checked' : null);

    if (isChecked) {
      Ember.set(this, 'selectedValue', Ember.get(this, 'value'));
    }
  },

  init: function() {
    this._super();
    this.selectedValueDidChange();
  },

  click: function() {
    Ember.run.once(this, this._updateElementValue);
  },

  _updateElementValue: function() {
    Ember.set(this, 'isChecked', this.$().prop('checked'));
  }

});


Ember.RadioButtonGroup = Ember.View.extend({
  classNames: ['ember-radio-button-group'],
  attributeBindings: ['name:data-name'],

  name: Ember.required(),

  value: null,

  RadioButton: Ember.computed(function() {
    return Ember.RadioButton.extend({
      group: this,
      selectedValueBinding: 'group.value',
      nameBinding: 'group.name'
    });
  })

});// JavaScript Document
