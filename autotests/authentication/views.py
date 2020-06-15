# from django.shortcuts import render
from .serializers import UserSerializer
from rest_framework import generics
from django.contrib.auth.models import User
from .models import Profile
from rest_framework.response import Response
# from rest_framework import status
# from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework import viewsets, mixins


class UserView(mixins.CreateModelMixin, 
                   mixins.DestroyModelMixin,
                   mixins.ListModelMixin,
                   viewsets.GenericViewSet):
    queryset = Profile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    # authentication_classes = [SessionAuthentication, TokenAuthentication, BasicAuthentication]
    
class UserInstanceView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, TokenAuthentication, BasicAuthentication]

    def get(self, request):
        p = Profile.objects.get(user=request.user)
        serializer = UserSerializer(p)
        print("DONE here")
        return Response(serializer.data)

# class UserListView(generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = (AllowAny,)
#     # authentication_classes = [SessionAuthentication, BasicAuthentication]

#     def list(self, request, pk=None):
#         if pk:
#             try:
#                 user = self.get_queryset().get(pk=pk)
#                 serializer = UserSerializer(user)
#                 return Response(serializer.data)
#             except ObjectDoesNotExist:
#                 return Response(status=status.HTTP_404_NOT_FOUND)
#         users = self.get_queryset()
#         serializer = UserSerializer(users, many=True)
#         return Response(serializer.data)

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         if serializer.is_valid():
#             self.perform_create(serializer)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def put(self, request, pk=None):
#         if not pk:
#             return Response(status=status.HTTP_400_BAD_REQUEST)
#         user = self.get_queryset().get(pk=pk)
#         serializer = UserSerializer(user, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk=None):
#         if not pk:
#             return Response(status=status.HTTP_400_BAD_REQUEST)
#         user = self.get_queryset().get(pk=pk)
#         user.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class UserInstanceView(generics.RetrieveAPIView):
#     serializer_class = UserSerializer
#     permission_classes = (AllowAny,)
#     # permission_classes = [IsAuthenticated]
#     # authentication_classes = [SessionAuthentication, BasicAuthentication]

#     def get(self, request):
#         serializer = UserSerializer(request.user)
#         return Response(serializer.data)

