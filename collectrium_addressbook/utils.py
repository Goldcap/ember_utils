#!/usr/bin/env python

import hashlib
import string
import simplejson as json
import csv

from django.http import HttpResponse
from django.core import serializers
from model_utils import Choices

from collections import defaultdict
