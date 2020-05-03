from django.shortcuts import render,redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import RegistrationForm 

# Create your views here.
def index(request):
    return render(request,'index.htm')


def registration_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
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
    return registration_view(request)

def teacher_register(request):
    # return render(request,'register.htm',context = { 'check':2 })
    return registration_view(request)

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
