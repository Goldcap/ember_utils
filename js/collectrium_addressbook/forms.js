// JavaScript Document
var collectrium_addressbook = collectrium_addressbook || {};
collectrium_addressbook.forms = function(options) {
    this.options = $.extend({
    model: {'contact_edit':'/services/api/v1/address_book/edit/',
            'contact_delete':'/services/api/v1/address_book/delete/',
            'contact_add':'/services/api/v1/address_book/add/'}
	}, options);
    this.init();
}

collectrium_addressbook.forms.prototype = {
    
  item: null,
  action: null,
  url: null,
    
  init: function() {
    
    this.assignItem();
    this.editItem();
    this.deleteItem();
     
  },
  
  assignItem: function() {
    
    if ((this.action == 'edit') && (this.item != null)) {
        this.populateRecord();
        this.url = this.options.model.contact_edit;
    } else if ((this.action == 'delete') && (this.item != null)) {
        this.populateRecord();
        this.url = this.options.model.contact_delete;
    } else {
        this.wipeRecord();
        this.url = this.options.model.contact_add;
    }
  },
  
  populateRecord: function() {
    
    console.log("@populateRecord");
        
    $("#contact_edit input").removeAttr("disabled");
    $("#contact_edit #contact_first_name").val(this.item.get("first_name"));
    $("#contact_edit #contact_last_name").val(this.item.get("last_name"));
    $("#contact_edit #contact_email").val(this.item.get("email"));
    $("#contact_edit #contact_organization_name").val(this.item.get("organization_name"));
    $("#contact_edit #contact_address1").val(this.item.get("address1"));
    $("#contact_edit #contact_address2").val(this.item.get("address2"));
    $("#contact_edit #contact_city").val(this.item.get("city"));
    $("#contact_edit #contact_state").val(this.item.get("state"));
    $("#contact_edit #contact_zip").val(this.item.get("zip"));
    $("#contact_edit #contact_id").val(this.item.get("id"));
    
    $("#contact_delete input[type!='submit']").attr("disabled","disabled");
    $("#contact_delete input[name='contact_id']").removeAttr("disabled");
    $("#contact_delete #contact_first_name").val(this.item.get("first_name"));
    $("#contact_delete #contact_last_name").val(this.item.get("last_name"));
    $("#contact_delete #contact_email").val(this.item.get("email")); 
    $("#contact_delete #contact_id").val(this.item.get("id"));
    
  },
  
  wipeRecord: function() {
    
    $("#contact_edit input").removeAttr("disabled");
    $("#contact_edit input[type!='submit']").val("");
    
  },
  
  deleteItem: function() {
    
    var scope = this;
    $("#contact_edit input[type!='submit']").attr("disabled","disabled");
    
    $("#contact_delete").validate({
      submitHandler: function(form) {
        this.connection = new collectrium.apiConnection( {} );
        $(this.connection).bind("contact_delete_success", _.bind(scope.formSuccess,scope));
        $(this.connection).bind("contact_delete_failure", _.bind(scope.formFailure,scope));
        this.connection.postForm( scope.url, form, "contact_delete" );
        return false;
      }
    });
  },
  
  editItem: function() {
    
    var scope = this;
    
    $("#contact_edit").validate({
      submitHandler: function(form) {
        if (! scope.validateContact()) return;
        $("#contact_edit input[type='submit']").attr("disabled","disabled");
        this.connection = new collectrium.apiConnection( {} );
        $(this.connection).bind("contact_edit_success", _.bind(scope.formSuccess,scope));
        $(this.connection).bind("contact_edit_failure", _.bind(scope.formFailure,scope));
        this.connection.postForm( scope.url, form, "contact_edit" );
        return false;
      },
      errorElement: "small"
    });
  },
  
  validateContact: function() {
    
    if (($("#contact_edit #contact_first_name").val() == "") &&
        ($("#contact_edit #contact_last_name").val() == "") &&
        ($("#contact_edit #contact_email").val() == "") &&
        ($("#contact_edit #contact_organization_name").val() == "")) {
        
        var validator = $("#contact_edit").validate();
        validator.showErrors({"contact_first_name": "At least one field is required."});
        return false;
    }
    
    return true;
  },
  
  formSuccess: function( event, result ) {
    switch(event.type) {
      case "contact_edit_success":
        $("#contact_edit input[type='submit']").removeAttr("disabled");
        App.addressbookList.toggleView();
        App.addressbookList.prelist();
        break;
      case "contact_delete_success":
        $("#contact_delete input[type='submit']").removeAttr("disabled");
        App.addressbookList.toggleView();
        App.addressbookList.prelist();
        break;
      default:
        break;
    }
    App.addressbookList.showError(result.response.result,result.response.title,result.response.message); 
  },
  
  formFailure: function( event, result ) {
    $("#contact_edit input[type='submit']").removeAttr("disabled");
    $("#contact_delete input[type='submit']").removeAttr("disabled");
    App.addressbookList.showError("error","Your information not saved.","Please check your data and try again."); 
  }
  
}
