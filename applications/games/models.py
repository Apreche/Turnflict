from django.db import models

class Game(models.Model):
    name = models.CharField(max_length=255)
    player_one = models.ForeignKey('auth.user',
            related_name="player_one_game")
    player_two = models.ForeignKey('auth.user', blank=True, null=True,
            related_name="player_two_game")
    couch_id = models.CharField(max_length=255)

    def __unicode__(self):
        if self.player_two:
            s = (self.name, self.player_two.username, self.player_one.username)
            return u"%s - %s vs. %s" % s
        elif hasattr(self, 'player_one'):
            s = (self.name, self.player_one.username)
            return u"%s - %s waiting for opponent" % s
        else:
            return self.name
