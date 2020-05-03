from django.contrib.auth.forms import UserCreationForm, User
from django import forms


class RegistrationForm(UserCreationForm):
    first_name = forms.CharField(max_length=30)
    last_name = forms.CharField(max_length=30)
    email = forms.EmailField()

    class Meta(UserCreationForm.Meta):
        model = User
        # UserCreationForm fields + custom fields
        list_of_fields = UserCreationForm.Meta.fields + \
            ('first_name', 'last_name', 'email',)

    field_order = ['username', 'first_name',
                   'last_name', 'email', 'password1', 'password2']

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)

        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']

        if commit:
            user.save()

        return user

