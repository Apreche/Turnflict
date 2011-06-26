from django.conf.urls.defaults import *

urlpatterns = patterns('players.views',
    url(r'^home$', 'home', name="player-home"),
)
