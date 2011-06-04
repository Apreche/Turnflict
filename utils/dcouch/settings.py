from django.conf import settings

COUCHDB_SERVER = getattr(settings, 'COUCHDB_SERVER', 'http://localhost:5984/')
