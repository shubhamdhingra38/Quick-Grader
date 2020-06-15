from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authentication.urls')),
    # path('', include('frontend.urls')),
    path('test/', include('tests.urls')),
    path('ml/', include('ml.urls')),
    path('', TemplateView.as_view(template_name='index.html')),
    # this makes the react handle
]
