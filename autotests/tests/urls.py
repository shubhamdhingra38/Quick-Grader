from django.contrib import admin
from django.urls import path
from .views import QuizListView, QuestionListView, ChoiceView, AnswerView, ResponseView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'quiz', QuizListView)
router.register(r'question', QuestionListView)
router.register(r'choice', ChoiceView)
router.register(r'answer', AnswerView)
router.register(r'response', ResponseView)

urlpatterns = router.urls

# urlpatterns = [
#     path('quiz/', QuizListView.as_view()),
#     path('quiz/<int:pk>', QuizListView.as_view()),
#     path('question/', QuestionListView.as_view()),
#     path('question/<int:pk>', QuestionListView.as_view()),
# ]
