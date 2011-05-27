from django.db import models

class Player(models.Model):
    user = models.OneToOneField('auth.User')
    games_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)

    def __unicode__(self):
        return self.user.username
