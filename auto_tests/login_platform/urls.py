from django.contrib import admin
from django.urls import path,include
from . import views
urlpatterns = [
    path('', views.index ,name = "index"),
    path('register_student',views.student_register,name = "student_register"),
    path('register_teacher',views.teacher_register,name = "teacher_register"),
    path('login_student',views.student_login,name = "student_login"),
    path('login_teacher',views.teacher_login,name = "teacher_login"),
    #api endpoints to interact with the database
    path('api/authenticate',views.authenticate,name = "authenticate"),
    path('api/register',views.register,name = "register"),
]
