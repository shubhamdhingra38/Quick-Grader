from .models import Quiz, Question
from .forms import addTestForm, addQuestionForm
from django.shortcuts import render, redirect
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, Http404
from django.contrib.auth.decorators import login_required
from login_platform import decorators
from .models import Choice


@login_required
@decorators.allowed_users(['Faculty'])
def test_list(request):
    x = list(Quiz.objects.all().filter(author=request.user))
    return render(request, 'test_list.htm', {'tests': x})


@login_required
def test_detail(request, id):
    try:
        test = Quiz.objects.get(id=id)
        questions = Question.objects.all().filter(test=test)
        questions_with_context = []
        for question in questions:
            if question.type == 1:
                answer = question.ans
                questions_with_context.append(
                    [question, answer, question.type])
            else:
                choices = list(Choice.objects.all().filter(question=question))
                questions_with_context.append(
                    [question, choices, question.type])
        # print(questions_with_context)
    except ObjectDoesNotExist:
        return HttpResponse("Could not find a quiz")
    return render(request, 'test_detail.htm', {'test': test, 'questions_with_choices': questions_with_context})


@login_required
@decorators.allowed_users(['Faculty'])
def addTest(request):
    new = None
    if request.method == 'POST':
        addtest_form = addTestForm(request.POST)
        if addtest_form.is_valid():
            new = addtest_form.save(commit=False)
            new.author = request.user
            new.save()
        return redirect('test_list')
    else:
        addtest_form = addTestForm()
    return render(request, 'addtest.htm', {'user': request.user, 'addtest_form': addtest_form})


@login_required
@decorators.allowed_users(['Faculty'])
def addQuestion(request, id):
    new = None
    x = Quiz.objects.get(id=id)
    if request.method == 'POST':
        type = int(request.POST['type'])
        # first add question as it needs to be referenced while instantiating choice object
        addquestion_form = addQuestionForm(request.POST)
        if addquestion_form.is_valid():
            new = addquestion_form.save(commit=False)
            new.test = x
            if type == 1:
                # short question
                answer = request.POST['short-answer'].strip(' ')
                new.ans = answer
                new.save()
            else:
                # mcq
                new.save()
                try:
                    answer_idx = int(request.POST['answer'])
                except (KeyError, ValueError) as e:
                    raise Http404("Something went wrong")
                # gets the upper limit for how many choices are there if the question type is mcq
                count = max([int(x.split('-')[1])
                             for x in request.POST.keys() if x.find('choice') == 0])
                count += 1  # choice indexing is from 0
                choices = []
                for i in range(count):
                    try:
                        choices.append(request.POST['choice-' + str(i)])
                    except KeyError:
                        print("Didn't find key in request.POST",
                              'choice-' + str(i))
                assert len(choices) == count
                for i, choice in enumerate(choices):
                    c = Choice(question=new, choice_text=choice)
                    if i == answer_idx:
                        c.is_answer = True
                    c.save()
        return redirect('test_detail', id)
    else:
        addquestion_form = addQuestionForm()
    return render(request, 'addquestion.htm', {'user': request.user, 'addquestion_form': addquestion_form})
