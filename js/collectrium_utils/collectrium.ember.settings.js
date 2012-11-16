// JavaScript Document
Collectrium.Settings = Em.Object.create({
    
    ready: false,
    gallery: null,
    artifact: null,
    artfair: null,
    authenticated: false,
    session: null,
    
    init: function() {
        this.set('gallery',Collectrium.galleryItem.create());
        this.set('artifact',Collectrium.artifactItem.create());
        this.set('artfair',Collectrium.artfairItem.create());
        this.set('member',Collectrium.memberItem.create());
    },
    
    loadData: function() {
        if (typeof(g_pageState) != "undefined") {
            if (g_pageState.artifact_id) {
                this.get('artifact').set('id',g_pageState.artifact_id); 
                this.get('artifact').set('title',g_pageState.artifact_title);
                this.get('artifact').set('number',g_pageState.artifact_number);
                this.get('artifact').set('artist',g_pageState.artist_name); 
                this.get('artifact').set('artist_id',g_pageState.artist_id);
                this.get('artifact.cover_image').parseFromUrl(g_pageState.artifact_cover_image);
            }
            if (g_pageState.gallery_id) {
                this.get('gallery').set('id',g_pageState.gallery_id);
                this.get('gallery').set('name',g_pageState.gallery_name);
                this.get('gallery').set('view',g_pageState.gallery_view);
                this.get('gallery').set('object_count',g_pageState.object_count);
                this.get('gallery.cover_image').parseFromUrl(g_pageState.gallery_cover_image);
            }
            if (g_pageState.authenticated) {
                this.set('authenticated',g_pageState.authenticated);
            }
            if (g_pageState.sessionId) {
                this.set('session',g_pageState.sessionId);
            }
            
        }
        this.set('ready',true);      
    }
    
});