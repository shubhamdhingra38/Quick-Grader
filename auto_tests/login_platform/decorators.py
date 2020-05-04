from django.http import HttpResponse
from django.shortcuts import redirect

'''
    This below function will allow us to make sure a logged in student
    will not be able to access the create test url or something similar.
    so above every view dedicated to teachers,we just have to place the decorator.
    Example:
    
    from .decorators import allowed_users

    @allowed_users(['Faculty'])
    @login_required
    def teacher_only_view():
        print("you see it because you are a teacher.")

'''

def allowed_users(allowed_roles=[]):
	def decorator(view_func):
		def wrapper_func(request, *args, **kwargs):

			group = None
			if request.user.groups.exists():
				group = request.user.groups.all()[0].name

			if group in allowed_roles:
					return view_func(request, *args, **kwargs)
			else:
					return HttpResponse('You are not authorized to view this page')
		return wrapper_func
	return decorator
