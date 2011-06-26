from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.db.models import Q

from games.models import Game
from players.models import Player

@login_required
def home(request):
    template_name = 'players/home.html'
    context = {}
    player = get_object_or_404(Player, user=request.user)
    context.update({'player': player})

    games = Game.objects.filter(
        Q(player_one=player) | Q(player_two=player)
    )
    context.update({'games': games})

    return render(request, template_name, context)
