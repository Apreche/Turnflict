import couchdb

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_protect
from django.http import HttpResponse, Http404
from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.utils import simplejson as json

from games.models import Game

@login_required
@csrf_protect
def process_game_turn(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    if game.current_player.user != request.user:
        raise Http404
    couch = couchdb.Server(settings.COUCHDB_HOST)
    db = couch[settings.COUCHDB_NAME]
    doc = db[game.couch_id]
    raw_data = json.loads(request.POST.get('data', None))
    command_list = raw_data['commands']
    for command in command_list:
        if command['command'] == "move":
            for unit in doc['game']['units']:
                if unit['id'] == command['id']:
                    unit['x'] = command['dx']
                    unit['y'] = command['dy']
    db.save(doc)
    if game.current_player == game.player_one:
        game.current_player = game.player_two
    else:
        game.current_player = game.player_one
    game.save()
    return HttpResponse(json.dumps(doc))

@csrf_protect
def play(request, game_id):
    if request.is_ajax():
        return process_game_turn(request, game_id)
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
