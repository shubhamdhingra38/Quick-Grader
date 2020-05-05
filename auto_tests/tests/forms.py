from .models import Quiz, Question
from django import forms


class addTestForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ('title', 'description')


class addQuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ('problem', 'type')
