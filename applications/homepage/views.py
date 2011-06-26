from django.shortcuts import render

from games.models import Game

def homepage(request):
    template_name = 'homepage/homepage.html'
    context = {}
    if request.user.is_authenticated():
        joinable_games = Game.objects.filter(player_two=None)
        joinable_games = joinable_games.exclude(player_one__user=request.user)
        context.update({'joinable_games': joinable_games})
    return render(request, template_name, context)
