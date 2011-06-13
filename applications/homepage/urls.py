from django.conf.urls.defaults import *

urlpatterns = patterns('homepage.views',
    url(r'^$', 'homepage', name="homepage"),
)
