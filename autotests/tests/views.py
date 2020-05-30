from django.shortcuts import render
from .serializers import (QuizSerializer, QuestionCreateSerializer,
                          QuestionViewSerializer, ChoiceSerializer, AnswerSerializer,
                          ResponseSerializer)
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.response import Response as APIResponse
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from .models import Quiz, Question, Choice, Answer, Response
from rest_framework import viewsets
from rest_framework.views import APIView



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


# class AnswerView(viewsets.ModelViewSet):
#     queryset = Answer.objects.all()
#     serializer_class = AnswerSerializer
#     permission_classes = [IsAuthenticated]
#     authentication_classes = [SessionAuthentication, BasicAuthentication]

class AnswerView(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    def list(self, request):
        if len(request.query_params) == 0:
            return super().list(request)
        else:
            response_id = request.query_params['responseID']
            response = Response.objects.filter(id=int(response_id)).first()
            answers = self.get_queryset().filter(response=response)
            serializer = AnswerSerializer(answers, many=True)
            return APIResponse(serializer.data)



class ResponseView(viewsets.ModelViewSet):
    queryset = Response.objects.all()
    serializer_class = ResponseSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    def list(self, request):
        if len(request.query_params) == 0:
            return super().list(request)
        else:
            quiz_id = request.query_params['quizID']
            quiz = Quiz.objects.filter(id=int(quiz_id)).first()
            responses = Response.objects.filter(test=quiz)
            serializer = ResponseSerializer(responses, many=True)
            return APIResponse(serializer.data)

class CreatedTestsView(generics.ListCreateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    # authentication_classes = [SessionAuthentication, BasicAuthentication]

    def list(self, request):
        queryset = self.get_queryset().filter(author=self.request.user)
        serializer = QuizSerializer(queryset, many=True)
        # print(serializer)
        return APIResponse(serializer.data)



class Grade(APIView):
    """
    API endpoint for grading, used in automatic grading/manual grading

    For example:

    Grade with answerID (used with supervised grading)
    {"grade":7,"answerID":"101", "type":2}

    Grade with responseID (used with automatic grading)
    {"grade":{"107":"7","108":"4"},"responseID":"54", "type":1}
    where each key in 'grade' is an questionID and the corresponding value is the score
    """

    def post(self, request):
        type_grading = int(request.data['type'])
        print(type_grading, 'type_grading')
        assert type_grading in [1, 2]
        
        if type_grading == 1:
            total_score = 0
            response_id = int(request.data['responseID'])
            response = Response.objects.get(id=response_id)
            print(response)
            answers = Answer.objects.filter(response=response)
            for answer in answers:
                if answer.question.type == 2: # MCQ
                    if Choice.objects.get(id=answer.choice_id).is_answer:
                        total_score += answer.question.maximum_score
                        answer.score += answer.question.maximum_score
                        answer.save()
            print(answers)
            grades = request.data['grade']
            for q_id in grades.keys():
                question = Question.objects.get(id=int(q_id))
                print('ques', question)
                ans = answers.get(question=question)
                ans.score = int(grades[q_id])
                total_score += int(grades[q_id])
                ans.save()
            
            response.total_score = total_score
            response.save()

        else:
            print(request.data)
            answer = Answer.objects.get(id=request.data['answerID'])
            answer.score = int(request.data['grade'])
            answer.save()

        return APIResponse("done...")