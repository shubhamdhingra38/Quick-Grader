from django.urls import path
from .views import UserInstanceView
from .views import UserView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserView)
urlpatterns = router.urls


urlpatterns += [
#     path('users/', UserListView.as_view()),
    # path('users/<int:pk>', UserListView.as_view()),
    path('user/', UserInstanceView.as_view()),
]

