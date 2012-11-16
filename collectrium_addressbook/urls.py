from django.conf.urls.defaults import *
from django.views.generic.base import TemplateView
from django.views.generic.simple import direct_to_template, redirect_to
from django.views.generic.list_detail import object_list

from collectrium_addressbook.views import list,add,edit,delete,upload

from settings import MEDIA_ROOT, ENVIRONMENT

urlpatterns = patterns('',
    
    # Artifacts

    url(r'^services/api/v1/address_book/list/$', list, name="addressbook_list"),
    url(r'^services/api/v1/address_book/add/$', add, name="addressbook_add"),
    url(r'^services/api/v1/address_book/edit/$', edit, name="addressbook_edit"),
    url(r'^services/api/v1/address_book/delete/$', delete, name="addressbook_delete"),
    url(r'^services/api/v1/address_book/upload/$', upload, name="addressbook_upload")
    

)
