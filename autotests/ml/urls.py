from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    # path('', views.ml_info, name='ml_info'),
    path('auto-grader/<int:quiz_id>', views.auto_grading),
    path('grade-others/<int:quiz_id>', views.grade_others_in_cluster),
    path('semi-auto-grader/<int:quiz_id>', views.supervised_automatic_grading),
    path('detect-plagiarism/<int:quiz_id>', views.plagiarism_detection, name='plag_detection'),
]
# urlpatterns = [
    
# ]