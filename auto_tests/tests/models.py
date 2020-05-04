from django.db import models
from django.contrib.auth.models import User
import uuid
# Create your models here.
class Quiz(models.Model):
    author = models.ForeignKey(User, on_delete = models.CASCADE)
    created_on = models.DateTimeField(auto_now = True)

    #quiz_start = models.DateTimeField(auto_now = False)
    #quiz_end = models.DateTimeField(auto_now = False)

    code = models.CharField(max_length = 15,unique = True,default = None)

    title = models.CharField(max_length = 50,unique = False)
    description = models.TextField()

    def save(self,*args,**kwargs):
        '''
            uuid is used to generate an unique code for the test
        '''
        if self.code == None:
            d = list(Quiz.objects.all())
            x = ''
            while(1):
                x = str(uuid.uuid4())[:8]
                flag = 0
                for i in d:
                    if i.code == x:
                        flag = 1
                if not flag:
                    break

            self.code = x
            super(Quiz,self).save(*args,**kwargs)

QUESTION_TYPE = (
    (1, 'SHORT ANSWER'),
    (2, 'MCQ')
)

class Question(models.Model):
    test = models.ForeignKey(Quiz, on_delete = models.CASCADE)
    type = models.IntegerField(choices = QUESTION_TYPE,default = 1)
    problem = models.TextField()
    answer = models.TextField()
