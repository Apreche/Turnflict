from django.conf import settings
from django.conf.urls.defaults import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'Django_Project_Template.views.home', name='home'),
    # url(r'^Django_Project_Template/', include('Django_Project_Template.foo.urls')),

    url('^game/', include('games.urls')),
    url('^players/', include('players.urls')),
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    #url(r'^social/', include('socialregistration.urls')),
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^$', include('homepage.urls')),
)

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
    )

urlpatterns += staticfiles_urlpatterns()
