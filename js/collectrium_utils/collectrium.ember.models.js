// JavaScript Document
Collectrium.artfairItem = Collectrium.Item.extend({

    id: 1,
    name: "",
    slugs: null,
    invitation: "",          
    invitation_rendered: null,
    invitation_subject: null, 
    invitation_subject_rendered: null,
    empty_gallery_help_text: null,
    pass_subject: null,
    pass_text: null,
    erc_home_text: null, 
    erc_nav_text: null,
    step_seven_text: null,
    
    vvr_link: function() {
        return '/vvr/' + this.get('name') + '/';
    }.property('name'),
    
    fetch: function() {
    
        this.set('slugs',Collectrium.Collection.create({"name":"artfairSlugs"}));
        this.slugs.set('clearpost',true);
        this.slugs.set('type',Collectrium.textSlug);
        this.slugs.set('url',"/services/api/v1/artfairmanager/artfair/");
        this.slugs.fetch()
        
    },
    
    assign: function() {
        this.set('invitation',this.slugs.getItemByProperty('label','invitation',1));
        this.set('invitation_subject',this.slugs.getItemByProperty('label','invitation_subject',1));
        this.set('erc_home_text',this.slugs.getItemByProperty('label','erc_home_text',1));
        this.set('pass_subject',this.slugs.getItemByProperty('label','pass_subject',1));
        this.set('pass_text',this.slugs.getItemByProperty('label','pass_text',1));
        this.set('erc_home_text',this.slugs.getItemByProperty('label','erc_home_text',1));
        this.set('erc_nav_text',this.slugs.getItemByProperty('label','erc_nav_text',1));  
        this.set('step_seven_text',this.slugs.getItemByProperty('label','step_seven_text',1));    
    }.observes('slugs.loaded')
    
});

Collectrium.galleryItem = Collectrium.Item.extend({

    id: 1,
    name: "Gallery",
    name_sort: "Gallery",
    email: "",
    public_email_address1: "",
    public_email_address2: "",
    website: "",
    address1: "",
    address2: "", 
    address3: "",
    address4: "",
    city: "",
    phone1: "",
    phone2: "",
    fax: "",
    access_key: "",
    cover_image_id: 0, 
    cover_image: null, 
    cover_image_raw: null,
    object_count: 0,
    view: 'griddetail',
    
    init: function() {
        this.set('cover_image',Collectrium.imageItem.create());    
    },
    
    setCoverImage: function() {
        this.set('cover_image',Collectrium.imageItem.create(this.get('cover_image_raw')));
    }.observes('cover_image_id'),
    
    object_count_str: function() {
        return this.get('object_count') + " " + (this.get('object_count') == 1 ? 'object' : 'objects');
    }.property()
    
});

Collectrium.artifactItem = Collectrium.Item.extend({

    id: 1,
    title: "Artifact",
    number: "0",
    artist: "",
    artist_id: 0,
    cover_image_id: 0, 
    cover_image: null, 
    cover_image_raw: null,
    object_count: 0,
    view: 'griddetail',
    approved: false,
    
    init: function() {
        this.set('cover_image',Collectrium.imageItem.create());    
    },
    
    setCoverImage: function() {
        this.set('cover_image',Collectrium.imageItem.create(this.get('cover_image_raw')));
    }.observes('cover_image_id'),
    
    object_count_str: function() {
        return this.get('object_count') + " " + (this.get('object_count') == 1 ? 'object' : 'objects');
    }.property()
    
});

Collectrium.memberItem = Collectrium.Item.extend({

    id: 1,
    name: "Member",
    email: ""
    
});

Collectrium.addressbookContact = Collectrium.Item.extend({

    type: "generic",
    id: 0,
    first_name:"",
    last_name:"",
    email:"",
    organization_name:"",
    address1:"",
    address2:"",
    phone:"",
    city:"",
    state:"",
    zip:"",
    country:"",
    size: "large",
    
    size_d: function() {
      return this.size + " three column";
    }.property('first_name'),
    
    first_name_d: function() {
      return ((this.first_name == '') || (this.first_name == null)) ? "No First Name" : this.first_name;
    }.property('first_name'),
    
    last_name_d: function() {
      return ((this.last_name == '') || (this.last_name == null)) ? "No Last Name" : this.last_name;
    }.property('last_name'),
    
    organization_name_d: function() {
      return ((this.organization_name == '') || (this.organization_name == null)) ? "No Organization" : this.organization_name;
    }.property(),
    
    address1_d: function() {
      return ((this.address1 == '') || (this.address1 == null)) ? "No Address" : this.address1;
    }.property(),
    
    address2_d: function() {
      return ((this.address2 == '') || (this.address2 == null)) ? "&nbsp;" : this.address2;
    }.property(),
    
    phone_d: function() {
      return ((this.phone == '') || (this.phone == null)) ? "&nbsp;" : this.phone;
    }.property(),
    
    city_d: function() {
      return ((this.city == '') || (this.city == null)) ? "No City" : this.city;
    }.property(),
    
    state_d: function() {
      return ((this.state == '') || (this.state == null)) ? "No State" : this.state;
    }.property(),
    
    zip_d: function() {
      return ((this.zip == '') || (this.zip == null)) ? "No Postal Code" : this.zip;
    }.property(),
    
    country_d: function() {
      return ((this.country == '') || (this.country == null)) ? "No Country" : this.country;
    }.property(),
    
    
    full_name: function() {
       return this.first_name + " " + this.last_name;
    }.property()
    
});

Collectrium.imageItem = Collectrium.Item.extend({

    id:0,
    base_domain: "http://www.collectrium.com",
    base_path: "/_resources/img/placeholder_images",
    base_url: "no_image",
    spec: "60",
    mimetype: "png",
    processing_status: 2,
    artifact:0,
    filter:"noimage",
    name:"No Image",
    attachmentview_id: 0,
    artifact_id: 0,
    artifact_number: 0,
    approved: false,
    
    height: function() {
        return this.get('heights')[this.get('spec')]
    }.property('heights','spec').cacheable(),
    
    width: function() {
        return this.get('widths')[this.get('spec')]
    }.property('widths','spec').cacheable(),
    
    location: function() {
        //console.log(this.get('base_domain') + this.get('base_path') + "/" + this.get('base_url') + '_' + this.get('spec') + '.' + this.get('mimetype'));
        return this.get('base_domain') + this.get('base_path') + "/" + this.get('base_url') + '_' + this.get('spec') + '.' + this.get('mimetype');
    }.property('base_domain','base_path','base_url','spec','mimetype').cacheable(),
    
    widths: {'60': 60, 'scaled_display': 96},
    heights: {'60': 60, 'scaled_display': 72},
    
    //Note, we "EXPECT" our urls' to conform, but have an optional domain
    //If the url doesn't conform, this won't work
    //"http://$base_domain/$base_path/$base_url_$spec.$mimetype"
    parseFromUrl: function( url ) {
        parts = url.split("/");
        if (parts[0].substring(0,4) == "http") {
            this.set('base_domain',parts[0]+"//"+parts[1]+parts[2]+"/");
            for (i=0;i<3;i++) parts.shift();
        }
        var image = parts.pop().split(".");
        this.set('mimetype',image[1]);
        var imagespec = image[0].split("_");
        this.set('spec',imagespec.pop());
        this.set('base_url',imagespec.join("_"));
        this.set('base_path',parts.join("/"));
    }
    
});

Collectrium.fileItem = Collectrium.Item.extend({
    
    name: "",
    mimetype: "",
    url: ""
    
});

Collectrium.textSlug = Collectrium.Item.extend(Collectrium.Serializable,{
    
    id: "",
    label: "",
    text: ""
    
});


Collectrium.vvrItem = Collectrium.Item.extend(Collectrium.Serializable,{
    
    id: "",
    vvr_type: ""
    
});