from django.shortcuts import render

# Create your views here.
from django.contrib import admin
from django.urls import path, include
from . import views
urlpatterns = [
    path('',views.test_list,name="test_list"),
    path('<int:id>/',views.test_detail, name = "test_detail"),
    path('addTest/', views.addTest, name = "add_test"),
    path('addQuestion/<int:id>/', views.addQuestion,name= "add_question"),
]
