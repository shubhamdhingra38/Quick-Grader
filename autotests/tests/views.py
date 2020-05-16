from django.shortcuts import render
from .serializers import (QuizSerializer, QuestionCreateSerializer,
                          QuestionViewSerializer, ChoiceSerializer, AnswerSerializer,
                          ResponseSerializer)
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from .models import Quiz, Question, Choice, Answer, Response
from rest_framework import viewsets


class QuizListView(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    # def list(self, request, pk=None):
    #     if pk:
    #         try:
    #             user = self.get_queryset().get(pk=pk)
    #             serializer = QuizSerializer(user)
    #             return Response(serializer.data)
    #         except ObjectDoesNotExist:
    #             return Response(status=status.HTTP_404_NOT_FOUND)
    #     users = self.get_queryset()
    #     serializer = QuizSerializer(users, many=True)
    #     return Response(serializer.data)

    # def create(self, request, *args, **kwargs):
    #     serializer = self.get_serializer(data=request.data)
    #     if serializer.is_valid():
    #         self.perform_create(serializer)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def put(self, request, pk=None):
    #     if not pk:
    #         return Response(status=status.HTTP_400_BAD_REQUEST)
    #     quiz = self.get_queryset().get(pk=pk)
    #     serializer = self.get_serializer(quiz, data=request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=status.HTTP_200_OK)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def delete(self, request, pk=None):
    #     if not pk:
    #         return Response(status=status.HTTP_400_BAD_REQUEST)
    #     quiz = self.get_queryset().get(pk=pk)
    #     serializer = self.get_serializer(quiz)
    #     serializer.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)


class QuestionListView(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    def get_serializer_class(self):
        if self.action == "create":
            return QuestionCreateSerializer
        return QuestionViewSerializer


class ChoiceView(viewsets.ModelViewSet):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]


class AnswerView(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]


class AnswerView(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]


class ResponseView(viewsets.ModelViewSet):
    queryset = Response.objects.all()
    serializer_class = ResponseSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
