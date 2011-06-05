from django.db import models
from django.core.exceptions import ImproperlyConfigured

from couchdb import Server
from couchdb.mapping import Document

from dcouch import settings

class CouchField(models.fields.CharField):

    description = "A CouchDB Document"

    __metaclass__ = models.SubfieldBase

    def __init__(self, db_name=None, mapping=Document, *args, **kwargs):
        kwargs.setdefault('max_length', 32)
        kwargs.setdefault('blank', True)
        kwargs.setdefault('null', False)
        kwargs.setdefault('default', '')
        server = Server(settings.COUCHDB_SERVER)

        def unicode_override(self):
            return self.id or u''
        mapping.__unicode__ = unicode_override
        self.mapping = mapping

        self.db_name = db_name
        if db_name is None:
            raise ImproperlyConfigured("CouchField must have a db_name")
        try:
            self.db = server[db_name]
        except ResourceNotFound:
            self.db = server.create(db_name)
        super(CouchField, self).__init__(*args, **kwargs)

    def to_python(self, value):
        if isinstance(value, self.mapping):
            obj = self.mapping.load(self.db, value.id)
            if obj is None:
                return value
            else:
                return obj
        obj = self.mapping.load(self.db, value)
        if not obj:
            obj = self.mapping()
            if value:
                obj.id = value
        print "C %s" % value
        return obj

    def get_prep_value(self, value):
        return getattr(value, 'id', '')

    def pre_save(self, model_instance, add):
        attr = getattr(model_instance, self.attname, None)
        if attr:
            attr.store(self.db)
        return attr

    def value_to_string(self, obj):
        value = self._get_val_from_obj(obj)
        return self.get_prep_value(value)

try:
    from south.modelsinspector import add_introspection_rules
    rules = [
        (
            (CouchField,),
            [],
            {
                "db_name": ["db_name", {"default": None}],
                "mapping": ["mapping", {"default": Document}],
            },
        ),
    ]
    add_introspection_rules(rules, ['dcouch\.models\.CouchField'])
except ImportError:
    pass
