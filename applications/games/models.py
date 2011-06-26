from django.db import models
from django.core.urlresolvers import reverse

class Game(models.Model):
    name = models.CharField(max_length=255)
    player_one = models.ForeignKey('players.Player',
            related_name="player_one_game")
    player_two = models.ForeignKey('players.Player', blank=True, null=True,
            related_name="player_two_game")
    couch_id = models.CharField(max_length=255)
    current_player = models.ForeignKey('players.Player', blank=True, null=True,
            related_name="player_current_game", default=None)

    def get_absolute_url(self):
        return reverse("game-detail", kwargs={'game_id': self.id})

    def __unicode__(self):
        if self.player_two:
            s = (self.name, self.player_two.user.username, self.player_one.user.username)
            return u"%s - %s vs. %s" % s
        elif hasattr(self, 'player_one'):
            s = (self.name, self.player_one.user.username)
            return u"%s - %s waiting for opponent" % s
        else:
            return self.name
