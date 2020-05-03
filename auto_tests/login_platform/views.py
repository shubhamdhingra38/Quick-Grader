from django.shortcuts import render,redirect

# Create your views here.
def index(request):
    return render(request,'index.html')

def student_register(request):
    return render(request,'register.html',context = { 'check':1 })

def teacher_register(request):
    return render(request,'register.html',context = { 'check':2 })

def student_login(request):
    return render(request,'login.html',context = { 'check' : 1 })

def teacher_login(request):
    return render(request,'login.html',{ 'check' : 2 })

def authenticate(request):
    return redirect("index")

def register(request):
    return redirect("index")
