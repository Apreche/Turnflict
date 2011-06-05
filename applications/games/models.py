from django.db import models
from couchdb.mapping import Document, TextField, IntegerField
from dcouch.models import CouchField

class GameState(Document):
    name = TextField()
    turns = IntegerField()

class Game(models.Model):
    name = models.CharField(max_length=255)
    state = CouchField(db_name='turnflict', mapping=GameState)
    player_one = models.ForeignKey('auth.user',
        related_name="player_one_game")
    player_two = models.ForeignKey('auth.user', blank=True, null=True,
        related_name="player_two_game")

    def __unicode__(self):
        if self.player_two:
            s = (self.name, self.player_two.username, self.player_one.username)
            return u"%s - %s vs. %s" % s
        elif hasattr(self, 'player_one'):
            s = (self.name, self.player_one.username)
            return u"%s - %s waiting for opponent" % s
        else:
            return self.name
