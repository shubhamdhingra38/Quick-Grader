from django.shortcuts import render
from .serializers import (QuizSerializer, QuestionCreateSerializer,
                          QuestionViewSerializer, ChoiceSerializer, AnswerSerializer,
                          ResponseSerializer)
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.response import Response as APIResponse
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from .models import Quiz, Question, Choice, Answer, Response
from rest_framework import viewsets, mixins
from rest_framework.views import APIView
from ml.views import grade_others_in_cluster
import csv
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt


class QuizListView(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication, BasicAuthentication]

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


class QuizInstanceView(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication,
                              TokenAuthentication, BasicAuthentication]
    lookup_field = 'code'

    def get(self, request, code=None):
        if code:
            try:
                quiz = Quiz.objects.get(code=code)
            except ObjectDoesNotExist:
                return APIResponse(status=status.HTTP_404_NOT_FOUND)
        serializer = QuizSerializer(quiz)
        return APIResponse(serializer.data)


class QuestionListView(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication,
                              TokenAuthentication, BasicAuthentication]

    def get_serializer_class(self):
        if self.action == "create":
            return QuestionCreateSerializer
        return QuestionViewSerializer


class ChoiceView(viewsets.ModelViewSet):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication,
                              TokenAuthentication, BasicAuthentication]


class AnswerView(mixins.CreateModelMixin,
                 mixins.DestroyModelMixin,
                 mixins.ListModelMixin,
                 viewsets.GenericViewSet, mixins.RetrieveModelMixin):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication,
                              TokenAuthentication, BasicAuthentication]

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
    authentication_classes = [SessionAuthentication,
                              TokenAuthentication, BasicAuthentication]

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
    authentication_classes = [SessionAuthentication,
                              TokenAuthentication, BasicAuthentication]

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
    
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication,
                              TokenAuthentication, BasicAuthentication]
                              
    def post(self, request):
        type_grading = int(request.data['type'])
        try:
            if type_grading == 1:
                total_score = 0
                response_id = int(request.data['responseID'])
                response = Response.objects.get(id=response_id)
                # print(response)
                answers = Answer.objects.filter(response=response)
                for answer in answers:
                    if answer.question.type == 2:  # MCQ
                        if Choice.objects.get(id=answer.choice_id).is_answer:
                            total_score += answer.question.maximum_score
                            answer.score = answer.question.maximum_score
                            answer.save()
                # print(answers)
                grades = request.data['grade']
                for q_id in grades.keys():
                    question = Question.objects.get(id=int(q_id))
                    assert int(grades[q_id]) <= question.maximum_score
                    # print('ques', question)
                    ans = answers.get(question=question)
                    ans.score = int(grades[q_id])
                    total_score += int(grades[q_id])
                    ans.save()

                response.total_score = total_score
                response.graded = True
                response.save()

            else:
                answer = Answer.objects.get(id=request.data['answerID'])
                answer.score = int(request.data['grade'])
                answer.save()
        except AssertionError:
            return APIResponse({"message": "Can not assign a value greater than maximum score"}, status=status.HTTP_400_BAD_REQUEST)

        return APIResponse({"message": "Successfully graded"}, status=status.HTTP_200_OK)


def lock_unlock_quiz(request, code):
    try:
        quiz = Quiz.objects.get(code=code)
        quiz.locked = not quiz.locked
        quiz.save()
        action = "locked" if quiz.locked else "unlocked"
    except ObjectDoesNotExist:
        return JsonResponse({"message": "Unable to lock the quiz, the code entered was incorrect"}, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse({"message": f"Successfully {action} the quiz"}, status=status.HTTP_200_OK)


def get_report(request, code):
    """
    Generates the response for downloading a .csv file of the responses to some quiz.

    Args:
        'code': Body parameter, the unique code of the Quiz

    Returns:
        CSV response of requested data
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="result.csv"'
    try:
        titles = ['S.No', 'Name']
        quiz = Quiz.objects.get(code=code)
        questions = Question.objects.filter(test=quiz).order_by('id')
        titles += [f'Question{i+1}' for i in range(len(questions))]
        titles += ['Plagiarism', 'Total Score']
        print(titles)
        responses = Response.objects.filter(test=quiz)
        print(responses[0].taken_by.get_full_name())
        serializer = ResponseSerializer(responses, many=True)
        writer = csv.writer(response)
        writer.writerow(titles)
        for i, res in enumerate(responses):
            answers = Answer.objects.filter(
                response=res).order_by('question__id')
            r = [i, res.taken_by.get_full_name()]
            for answer in answers:
                r += [answer.score]
            r += [res.plag, res.total_score]
            print(r)
            writer.writerow(r)
    except Exception as e:
        print(e)
        return JsonResponse({"message": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)

    return response


@csrf_exempt
def set_plagiarism(request, response_id):
    try:
        response = Response.objects.get(id=int(response_id))
        response.plag = True
        response.save()
    except ObjectDoesNotExist:
        return JsonResponse({"message": "The code entered was incorrect"}, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse({"message": f"Successfully marked the response as plagiarized"}, status=status.HTTP_200_OK)
