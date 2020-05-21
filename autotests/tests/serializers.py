from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import models
from .models import Quiz, Question, Choice, Answer, Response
from django.core.exceptions import ObjectDoesNotExist


class QuizSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(
        default=serializers.CurrentUserDefault(),
        read_only=True
    )
    questions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'author', 'code', 'title', 'description', 'questions',)
        read_only_fields = ('id', 'code',)

    def create(self, validated_data):
        author = self.context["request"].user
        q = Quiz(author=author, **validated_data)
        q.save()
        return q


class QuestionCreateSerializer(serializers.ModelSerializer):
    quiz_code = serializers.CharField(source='test.code')
    choices = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'type', 'problem', 'quiz_code', 'ans', 'choices', )

    def create(self, validated_data):
        try:
            print(validated_data)
            q = Quiz.objects.get(code=validated_data['test']['code'])
            question = Question(test=q, type=validated_data['type'],
                                problem=validated_data['problem'],
                                ans=validated_data['ans'])
            question.save()
            return question
        except ObjectDoesNotExist:
            raise serializers.ValidationError("Code entered was incorrect")


class QuestionViewSerializer(serializers.ModelSerializer):
    quiz_code = serializers.CharField(source='test.code')
    choices = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    ans = serializers.SerializerMethodField('get_ans')

    # if the person who is accessing this endpoint created the quiz, show them answer
    def get_ans(self, obj):
        if obj.test.author != self.context['request'].user:
            return ""
        else:
            return obj.ans

    class Meta:
        model = Question
        fields = ('id', 'type', 'problem', 'quiz_code', 'choices', 'ans',)

    def update(self, instance, validated_data):
        instance.problem = validated_data.get('problem', instance.problem)
        instance.ans = validated_data.get('ans', instance.ans)
        instance.save()
        return instance


class ChoiceSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(source='question.id')

    class Meta:
        model = Choice
        fields = ('id', 'question_id', 'choice_text', 'is_answer',)
        # write_only_fields = ('is_answer',)
        # extra_kwargs = {'is_answer': {'write_only': True}}

    def create(self, validated_data):
        try:
            ques = Question.objects.get(pk=validated_data['question']['id'])
            choice = Choice(question=ques, choice_text=validated_data['choice_text'],
                            is_answer=validated_data['is_answer'])
            choice.save()
            return choice
        except ObjectDoesNotExist:
            raise serializers.ValidationError("The question does not exist")


# class ResponseSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Response

class AnswerSerializer(serializers.ModelSerializer):
    response_id = serializers.IntegerField(source='response.id')
    question_id = serializers.IntegerField(source='question.id')

    class Meta:
        model = Answer
        fields = ('id', 'response_id', 'question_id',
                  'short_ans', 'choice_id',)

    # same student cannot give multiple answers to one question

    def validate(self, data):
        try:
            response = Response.objects.get(id=data['response']['id'])
            question = Question.objects.get(id=data['question']['id'])
        except ObjectDoesNotExist:
            raise serializers.ValidationError(
                "Response/Question does not exist")
        answer = Answer.objects.filter(question=question, response=response)
        if len(answer) > 0:
            raise serializers.ValidationError(
                "More answers cannot be submitted for this question")
        return data

    def create(self, validated_data):
        response = Response.objects.get(id=validated_data['response']['id'])
        question = Question.objects.get(id=validated_data['question']['id'])
        answer = Answer(response=response,
                        question=question,
                        short_ans=validated_data['short_ans'],
                        choice_id=validated_data['choice_id'])
        answer.save()
        return answer


class ResponseSerializer(serializers.ModelSerializer):
    taken_by = serializers.StringRelatedField(
        default=serializers.CurrentUserDefault(),
        read_only=True
    )
    # test = serializers.PrimaryKeyRelatedField(many=False, read_only=True)

    class Meta:
        model = Response
        fields = ('id', 'test', 'taken_by',)

    def validate_test(self, value):
        # do not let the student attempt the test twice by creating multiple responses
        responses = Response.objects.filter(taken_by=self.context["request"].user,
                                            test=value)
        if len(responses) == 1:
            raise serializers.ValidationError("Cannot create another response")

        return value

    def create(self, validated_data):
        taken_by = self.context["request"].user
        response = Response(taken_by=taken_by, test=validated_data['test'])
        response.save()
        return response
