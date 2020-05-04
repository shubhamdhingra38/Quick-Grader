from .models import Quiz,Question
from .forms import addTestForm,addQuestionForm
from django.shortcuts import render,redirect
def test_list(request):
    x = list(Quiz.objects.all().filter(author = request.user))
    print(x)
    return render(request,'test_list.htm',{'tests':x})

def test_detail(request,id):

    x = Quiz.objects.get(id = id)
    d = Question.objects.all().filter(test = x)
    return render(request,'test_detail.htm',{ 'test':x , 'questions':d  })

def addTest(request):
    new = None
    if request.method == 'POST':
        addtest_form = addTestForm(request.POST)
        if addtest_form.is_valid():
            new = addtest_form.save(commit=False)
            new.author= request.user
            new.save()
            print('here')
        return redirect('test_list')
    else:
        addtest_form=addTestForm()
    return render(request,'addtest.htm',{'user':request.user,'addtest_form':addtest_form})

def addQuestion(request,id):
    new = None
    x = Quiz.objects.get(id = id)
    if request.method == 'POST':
        addquestion_form = addQuestionForm(request.POST)
        if addquestion_form.is_valid():
            new = addquestion_form.save(commit=False)
            new.test = x
            new.save()
        return redirect('test_detail',id)
    else:
        addquestion_form=addQuestionForm()
    return render(request,'addquestion.htm',{'user':request.user,'addquestion_form':addquestion_form})
