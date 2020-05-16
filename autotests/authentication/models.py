from django.contrib.auth.models import User, Group
from django.db import models

class Profile(models.Model):
   user = models.OneToOneField(User, on_delete=models.CASCADE)
   group = models.CharField(max_length=10)

   def __str__(self):
       return self.user.username