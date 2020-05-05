from django.db import models
from django.contrib.auth.models import User
import uuid
from collections import defaultdict

# Create your models here.


class Quiz(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_on = models.DateTimeField(auto_now=True)

    #quiz_start = models.DateTimeField(auto_now = False)
    #quiz_end = models.DateTimeField(auto_now = False)

    code = models.CharField(max_length=15, unique=True, default=None)

    title = models.CharField(max_length=50, unique=False)
    description = models.TextField()

    def save(self, *args, **kwargs):
        '''
            uuid is used to generate an unique code for the test
        '''
        if self.code == None:
            l = list(Quiz.objects.all())
            key_exists = defaultdict(bool)
            for quiz in l:
                key_exists[quiz.code] = True
            print(key_exists)
            UUID = ''
            while True:
                UUID = str(uuid.uuid4())[:8]
                if not key_exists[UUID]:
                    break
            self.code = UUID
            super(Quiz, self).save(*args, **kwargs)

    def __str__(self):
        return self.author.username + ":" + self.title


QUESTION_TYPE = (
    (1, 'SHORT ANSWER'),
    (2, 'MCQ')
)


class Question(models.Model):
    test = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    type = models.IntegerField(choices=QUESTION_TYPE, default=1)
    problem = models.TextField()
    ans = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.problem


# for the mcq type questions
class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=50)
    is_answer = models.BooleanField(default=False)

    def __str__(self):
        return self.choice_text
