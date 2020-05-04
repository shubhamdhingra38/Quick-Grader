from django.shortcuts import render,redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import RegistrationForm
from django.contrib.auth.models import Group

# Create your views here.
def index(request):
    role = ''
    if request.user.is_authenticated:
        role = request.user.groups.all()[0].name
    return render(request,'index.htm',{'role':role})


def registration_view(request,flag):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            group = None
            if flag == 2:
                group= Group.objects.get(name = "Faculty")
            else:
                group = Group.objects.get(name = "Student")
            user.groups.add(group)
            messages.success(request, 'Registered successfully')
            return redirect('index')
    else:
        form = RegistrationForm()
    return render(request,'register.htm',context = { 'check':1, 'form': form})


def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            username = form.get_user()
            login(request, username)
            return redirect('index')
        else:
            messages.error(request, 'Incorrect details')
    else:
        form = AuthenticationForm()
    return render(request, 'login.htm', context={'form': form})


@login_required
def logout_view(request):
    logout(request)
    return redirect('index')

def student_register(request):
    # return render(request,'register.htm',context = { 'check':1, 'form': form})
    return registration_view(request,1)

def teacher_register(request):
    # return render(request,'register.htm',context = { 'check':2 })
    return registration_view(request,2)

def student_login(request):
    return login_view(request)
    # return render(request,'login.htm',context = { 'check' : 1 })

def teacher_login(request):
    return login_view(request)
    # return render(request,'login.htm',{ 'check' : 2 })

def authenticate(request):
    return redirect("index")

def register(request):
    return redirect("index")
