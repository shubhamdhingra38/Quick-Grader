from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('auto-grader/<int:quiz_id>', views.auto_grading),
    path('grade-others/<int:quiz_id>', views.grade_others_in_cluster),
    path('semi-auto-grader/<int:quiz_id>', views.supervised_automatic_grading),
    path('detect-plagiarism/<str:quiz_code>', views.plagiarism_detection, name='plag_detection'),
]