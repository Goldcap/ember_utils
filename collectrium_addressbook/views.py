# Create your views here.
import json
import csv
import os   
import openpyxl
import xlrd
import random
import math

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F
from django.db.models import Q
from django.core.files import File
from django.shortcuts import render
from django.views.decorators.cache import cache_control
from django.template.response import TemplateResponse 
from django.contrib.auth.decorators import login_required
from django.conf import settings

from settings import PROJECT_DIR, TEMP_DIR

from collectrium.models import Contact
from collectrium_log.collectrium_log import collectrium_log
from crm.forms import FileUploadForm
from crm.models import FileUpload

from services import utils
from services.stringMatch import stringMatch

logger = collectrium_log()

ROOT_FIELDS = []

ROOT_KEYS = ["first_name","last_name","email","organization_name","address1","address2","city","state","zip_code","phone"]
for akey in ROOT_KEYS:
    item = [akey,akey]
    ROOT_FIELDS.append(item)
    
#http://w.holeso.me/2009/09/django-a-simple-keyword-search/
@login_required
def list(request, type = None, sort = 'last_name', page = 1, items_per_page=4, size="large", term="All"):
    meta = {'type': request.method}
    requestor = request.user.profile
    result = 'success'
    title = ''
    message = ''
    objects = []
    
    member = request.user.profile
    
    if ("page" in request.GET):
        page = int(request.GET["page"])
    if ("limit" in request.GET):
        items_per_page = int(request.GET["limit"])
    if ("filter" in request.GET):
        type = request.GET["filter"]
    if ("size" in request.GET):
        size = request.GET["size"]
    if ("term" in request.GET):
        term = request.GET["term"]
    
    if size == "small":
        items_per_page = 6
        
    page = int(page)
    start_index = (page - 1) * items_per_page
    end_index = page * items_per_page
    
    if (term != "All"):
        query = Q(parent_member=member.id) & (Q(email__icontains=term) | Q(first_name__icontains=term) | Q(last_name__icontains=term)) 
        contacts = Contact.objects.filter(query)
        total_contacts = Contact.objects.filter(query).count()
    
    elif (type):
        contacts = Contact.objects.filter(parent_member=member.id,last_name__iregex=r"(^|\s)%s" % type)
        total_contacts = Contact.objects.filter(parent_member=member.id,last_name__iregex=r"(^|\s)%s" % type).count()
    else:
        contacts = Contact.objects.filter(parent_member=member.id)
        total_contacts = Contact.objects.filter(parent_member=member.id).count()
        
    if contacts:
        if sort == 'email':
            contacts = contacts.order_by('email')
        elif sort == 'first_name':
            contacts = contacts.order_by('first_name')
        elif sort == 'last_name':
            contacts = contacts.order_by('last_name')

        contacts = contacts[start_index:end_index]
    
        format = stringMatch();
        for contact in contacts:
            item = {}
            item["id"] = contact.id
            item["first_name"] = contact.first_name 
            item["last_name"] = contact.last_name
            item["email"] = contact.email
            item["phone"] = contact.phone
            item["organization_name"] = contact.organization_name
            item["address1"] = contact.address1
            item["address2"] = contact.address2
            item["city"] = contact.city
            item["state"] = format.formatState(contact.us_state)
            item["zip"] = format.formatZip(contact.zip_code)
            item["country"] = contact.country 
            item["size"] = size
            objects.append(item)
    
    meta['pages'] = int(math.ceil(( total_contacts / items_per_page)))
    meta['totalresults'] = total_contacts
    meta['currentPage'] = page
    meta['rpp'] = items_per_page
    meta['sort'] = sort
    meta['filter'] = type
    meta["current_results"] = len(objects)
    response = {'result': result, 'title': title, 'message': message}
    return utils.jsonHttpOutput(meta, response, objects)
        
def add(request):
    meta = {'type': request.method}
    requestor = request.user.profile
    result = 'success'
    title = 'Your Contact Was Added'
    message = ''
    objects = []
    
    if request.method == 'POST':
    
        contact_id = 0
        if 'contact_id' in request.POST:
            contact_id =  request.POST["contact_id"]
            
        contact_first_name = ''
        if 'contact_first_name' in request.POST:
            contact_first_name =  request.POST["contact_first_name"]
            
        contact_last_name = ''
        if 'contact_last_name' in request.POST:
            contact_last_name =  request.POST["contact_last_name"]
        
        contact_email = ''
        if 'contact_email' in request.POST:
            contact_email =  request.POST["contact_email"]
        
        contact_organization_name = ''
        if 'contact_organization_name' in request.POST:
            contact_organization_name =  request.POST["contact_organization_name"]
        
        contact_address1 = ''
        if 'contact_address1' in request.POST:
            contact_address1 =  request.POST["contact_address1"]
        
        contact_address2 = ''
        if 'contact_address2' in request.POST:
            contact_address2 =  request.POST["contact_address2"]
        
        contact_phone = ''
        if 'contact_phone' in request.POST:
            contact_phone =  request.POST["contact_phone"]
        
        contact_city = ''
        if 'contact_city' in request.POST:
            contact_city =  request.POST["contact_city"]
        
        contact_state = ''
        if 'contact_state' in request.POST:
            contact_state =  request.POST["contact_state"]
        
        contact_zip = ''
        if 'contact_zip' in request.POST:
            contact_zip =  request.POST["contact_zip"]
        
        contact_country = ''
        if 'contact_country' in request.POST:
            contact_country =  request.POST["contact_country"]
        
        contact = None
        if contact_email != '':
            try:
                contact = Contact.objects.get(email=contact_email,parent_member=request.user.profile)
            except ObjectDoesNotExist:
                pass
        
        format = stringMatch();        
        if not contact:
            contact = Contact(
                parent_member = request.user.profile,
                first_name = contact_first_name,
                last_name = contact_last_name,
                email = contact_email,
                organization_name = contact_organization_name,
                address1 = contact_address1,
                address2 = contact_address2,
                phone = contact_phone,
                city = contact_city,
                us_state = format.formatState(contact_state),
                zip_code = format.formatZip(contact_zip),
                country_code = contact_country,
                contact_type_id = 1
                )
            contact.save()
        else:
            result = 'error'
            title = 'A contact for this user already exists.'
            message = 'The email address "' + contact_email +'" is already in your contacts.'
    
        response = {'result': result, 'title': title, 'message': message}
        return utils.jsonHttpOutput(meta, response, objects)
        #return utils.textHttpOutput(result)
    else:
        return utils.textHttpOutput("add")
        
def edit(request):
    meta = {'type': request.method}
    requestor = request.user.profile
    result = 'error'
    title = 'There was an error.'
    message = 'The contact you are updating wasn\'t found.'
    objects = []
    
    if request.method == 'POST':
    
        contact = None
        contact_id = 0
        if 'contact_id' in request.POST:
            contact_id =  request.POST["contact_id"]
            try:
                contact = Contact.objects.get(pk=contact_id,parent_member=request.user.profile)
            except ObjectDoesNotExist:
                pass
            
            if contact:
        
                if 'contact_first_name' in request.POST:
                    contact.first_name =  request.POST["contact_first_name"]
                    
                if 'contact_last_name' in request.POST:
                    contact.last_name =  request.POST["contact_last_name"]
                
                if 'contact_email' in request.POST:
                    contact.email =  request.POST["contact_email"]
                
                if 'contact_organization_name' in request.POST:
                    contact.organization_name =  request.POST["contact_organization_name"]
                
                if 'contact_address1' in request.POST:
                    contact.address1 =  request.POST["contact_address1"]
                
                if 'contact_address2' in request.POST:
                    contact.address2 =  request.POST["contact_address2"]
                
                if 'contact_phone' in request.POST:
                    contact.phone =  request.POST["contact_phone"]
                
                if 'contact_city' in request.POST:
                    contact.city =  request.POST["contact_city"]
                
                if 'contact_state' in request.POST:
                    contact.us_state =  request.POST["contact_state"]
                
                if 'contact_zip' in request.POST:
                    contact.zip_code =  request.POST["contact_zip"]
                
                if 'contact_country' in request.POST:
                    contact.country =  request.POST["contact_country"]
            
                contact.save()
                result = 'success'
                title = 'Your contact was updated.'
                message = 'The contact was updated with the information provided.'
        
        response = {'result': result, 'title': title, 'message': message}
        return utils.jsonHttpOutput(meta, response, objects)
        #return utils.textHttpOutput(result)
    else:
        return utils.textHttpOutput("add")
        
def delete(request):
    meta = {'type': request.method}
    requestor = request.user.profile
    result = 'error'
    title = 'There was an error.'
    message = 'The contact you are updating wasn\'t found.'
    objects = []
    
    if request.method == 'POST':
    
        contact = None
        contact_id = 0
        if 'contact_id' in request.POST:
            contact_id =  request.POST["contact_id"]
            try:
                contact = Contact.objects.get(pk=contact_id,parent_member=request.user.profile)
            except ObjectDoesNotExist:
                pass
            
            if contact:
                contact.delete()
                result = 'success'
                title = 'Your contact was deleted.'
                message = ''
                
        response = {'result': result, 'title': title, 'message': message}
        return utils.jsonHttpOutput(meta, response, objects)
        #return utils.textHttpOutput(result)
    else:
        return utils.textHttpOutput("delete")

def upload(request):
    meta = {'type': request.method}
    requestor = request.user.profile
    result = 'success'
    title = 'File Upload Saved'
    message = 'Your file uploaded successfully.'
    objects = []
    
    if request.method == 'POST':
        form = FileUploadForm(request.POST, request.FILES)
        if form.is_valid():

            member = request.user.profile
            file_upload = FileUpload(uploaded_file=form.cleaned_data['Filedata'],
                                     exhibitor=member,
                                     upload_type="addressbook",
                                     upload_category="addressbook_import",
                                     upload_status=1)
            file_upload.save()
            root, extension = os.path.splitext(file_upload.uploaded_file.name)
            dest = PROJECT_DIR + '/_resources/' + file_upload.uploaded_file.name
            
            i=0
            # handle older Excel files
            if extension == '.xls':
                wb = xlrd.open_workbook(dest)
                ws = wb.sheet_by_index(0)
                    
                for row_num in xrange(ws.nrows):
                    i+=1
                    row = ws.row(row_num)
                    if i == 1:
                        colheaders = contact_headers(row,'excel',member)
                        if (not colheaders):
                            result = 'error'
                            title = 'File Format Incorrect'
                            message = 'Your file was in the wrong format. Please check the format, and try again.'
                            break
                        else:
                            continue
                    status = contact_row(row, 'excel', member, colheaders)
                    if status != None:
                        logger.log( "RESULT is %s", [status], "notice" )
                        
            # handle newer Excel files
            elif extension == '.xlsx':
                wb = openpyxl.load_workbook(dest)
                ws = wb.worksheets[0]
                #logger.log("MAX COLS: %s",[ws.get_highest_column()],"info")
                
                for row in ws.rows:
                    i+=1
                    if i == 1:
                        colheaders = contact_headers(row,'excel',member)
                        if (not colheaders):
                            result = 'error'
                            title = 'File Format Incorrect'
                            message = 'Your file was in the wrong format. Please check the format, and try again.'
                            break
                        else:
                            continue
                    status = contact_row(row, 'excel', member, colheaders)
                    if status != None:
                        logger.log( "RESULT is %s", [status], "notice" )
                        
        
            # handle CSV files
            elif extension == '.csv':
                reader = csv.reader(dest)
                for row in reader:
                    i+=1
                    if i == 1:
                        colheaders = contact_headers(row,'csv',member)
                        if (not colheaders):
                            result = 'error'
                            title = 'File Format Incorrect'
                            message = 'Your file was in the wrong format. Please check the format, and try again.'
                            break
                        else:
                            continue
                    status = contact_row(row, 'csv', member, colheaders)
                    if status != None:
                        logger.log( "RESULT is %s", [status], "notice" )
            
        else:
            result = 'error'
            title = 'Validation Error'
            message = 'Your File Upload failed to validate, with errors: %s' % form.errors
            objects = None
            
        response = {'result': result, 'title': title, 'message': message}
        return utils.jsonHttpOutput(meta, response, objects)
        #return utils.textHttpOutput(result)
    else:
        return utils.textHttpOutput("unauth")
        
def contact_headers(row, type, member):
    
    colheaders = []
            
    pro_file = settings.PROJECT_DIR + "/collectrium_addressbook/import_profiles/" + str(member.id) + "/ab_import.txt"
    #logger.log("LOOKING FOR PRO FILE IN: %s",[pro_file],"info")
    if os.path.exists( pro_file ):
        rf = open( pro_file, 'r')
        for rline in rf:
            opts = rline.rstrip('\n').split("|")
            #logger.log("FOUND STRINGS: %s, %s",[opts[0],opts[1]],"info")
            if (opts[0][:8] == "<sysval:"):
                pattern = re.compile("\$date")
                match = pattern.sub(datetime.datetime.now().strftime("%Y-%m-%d@%H:%M"), opts[0])
                #logger.log("OPTS!: %s, %s",[match,opts[1]],"info")
                colheaders.append( [match,opts[1]] )
            else:
                colheaders.append( opts  )
        rf.close()
    else:
        colheaders = ROOT_FIELDS
             
    i=0
    for hdr in colheaders:
        if (hdr[0][:8] == "<sysval:"):
            i -= 1
            pass
        elif type == 'csv':
            if row[i] != hdr[0]:
                return []
        elif type == 'excel':
            if row[i].value != hdr[0]:
                return []   
        i += 1
        
    return colheaders
        
def contact_row(row, type, member, colheaders):
    
    contact = Contact()
    contact_fields = []
    
    x=0
    d=[]
    dosave = False
    format = stringMatch();
    
    for col in colheaders:
        #dzink means we commit the column into the artifact object
        dzink = False
        if (col[0][:8] == "<sysval:"):
            matches = re.match( '<sysval:(.+)>', col[0])
            if matches:
                val = matches.group(1)
            else:
                val = None
            x -= 1
        elif type == 'csv':
            # a tuple of cells, e.g. (cell, cell, cell)
            #logger.log("COLUMNS: %s",[len(row)],"info")
            val = row[x]
        elif type == 'excel':
            # a tuple of cells, e.g. (cell, cell, cell)
            val = row[x].value
        
        #Format some input vals using string parsing
        if col[1] == "state":
            val = format.formatState(val)
        
        if col[1] == "zip_code":
            val = format.formatZip(val)
            
        #logger.log("COL: %s",[col[1]],"info")
        #logger.log("VALUE: %s",[val],"info")
        #if (not dzink) and (str(val).rstrip() != ""):
        if (not dzink) and (val != ""):
            #try:
            if (col[1] in ROOT_KEYS):
                setattr(contact,col[1],val)
                dosave = True
            
        x += 1
        
    contact.parent_member = member
    if dosave:
        #try:
        contact.save()
     
    #logger.log("GROUPING IS: %s",[artifact.grouping],"info")
    
    if (contact):
        status = "success"
    else:
        status = "failed"
     
    return [ status ]     