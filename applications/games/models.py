from django.db import models
from dcouch.models import CouchField


class Game(models.Model):
    name = models.CharField(max_length=255)
    couch_id = models.CharField(max_length=255, unique=True)
    player_one = models.ForeignKey('players.Player',
        related_name="player_one_game")
    player_two = models.ForeignKey('players.Player', blank=True, null=True,
        related_name="player_two_game")
    start_time = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    turn = models.IntegerField(default=0)
    state = CouchField(db_name='turnflict')

    STATUSES = {
        'Pregame': 0,
        'Playing': 1,
        'Game Over': 2,
    }
    STATUS_CHOICES = tuple([(val,key) for key, val in STATUSES.items()])

    status = models.IntegerField(choices=STATUS_CHOICES,
        default=STATUSES['Pregame'])

    def __unicode__(self):
        if self.player_two:
            t = (self.name, self.player_two.username, self.player_one.username)
            return u"%s - %s vs. %s" % t
        else:
            t = (self.name, self.player_one.user.username)
            return u"%s - %s waiting for opponent"
