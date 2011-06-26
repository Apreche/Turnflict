from django.db import models
from registration.signals import user_registered

class Player(models.Model):
    user = models.OneToOneField('auth.User')
    games_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)

    def __unicode__(self):
        return self.user.username

def create_player(sender, user, request, **kwargs):
    player = Player()
    player.user = user
    player.save()

user_registered.connect(create_player)
