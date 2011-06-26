from django.conf.urls.defaults import *

urlpatterns = patterns('games.views',
    url(r'^state/(?P<game_id>\d+)$', 'state', name="game-detail"),
    url(r'^(?P<game_id>\d+)/$', 'play', name="game-detail"),
    url(r'^(?P<game_id>\d+)/join$', 'join', name="game-join"),
    url(r'^create$', 'create', name="create-game"),
)
