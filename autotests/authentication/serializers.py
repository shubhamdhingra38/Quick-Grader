from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Profile
# from django.db import models
# from django.core import exceptions
from django.db.utils import IntegrityError
from rest_framework.authtoken.models import Token



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=50, write_only=True)
    username = serializers.CharField(max_length=25, source='user.username')
    email = serializers.CharField(max_length=100, source='user.email')
    group = serializers.CharField(max_length=100)



    def validate_group(self, group):
        if group not in ['Faculty', 'Student']:
            raise serializers.ValidationError("Group must be either Faculty or Student")
        return group

    def create(self, validated_data):
        user_details = validated_data.pop('user')
        try:
            user = User.objects.create_user(
                username=user_details['username'],
                email=user_details['email'],
                password=validated_data.pop('password'),
                first_name=validated_data.pop('firstname'),
                last_name=validated_data.pop('lastname')
            )
        except IntegrityError:
            raise serializers.ValidationError("Username already exists")
        user.save()
        token = Token.objects.create(user=user)
        print(token.key)
        group_name = validated_data.pop('group')
        group = Group.objects.get(name=group_name)
        group.user_set.add(user)
        profile = Profile(user=user, group=group_name, firstname=user.first_name, lastname=user.last_name)
        profile.save()
        return profile

    class Meta:
        model = Profile
        fields = ('id', 'username', 'email', 'password', 'group', 'firstname', 'lastname',)
