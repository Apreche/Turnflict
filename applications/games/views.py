import couchdb

from django.http import HttpResponse
from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.utils import simplejson as json

from games.models import Game

def play(request, game_id):
    template_name = 'games/play.html'
    context = {}
    game = get_object_or_404(Game, id=game_id)
    context.update({'game': game})
    return render(request, template_name, context)

def state(request, game_id, revision=None):
    game = get_object_or_404(Game, id=game_id)
    couch = couchdb.Server(settings.COUCHDB_HOST)
    db = couch[settings.COUCHDB_NAME]
    doc = db[game.couch_id]
    return HttpResponse(json.dumps(doc))
