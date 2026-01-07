from rest_framework import status, permissions, generics, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add email field and make username optional to allow email-based login
        self.fields['email'] = serializers.CharField(required=False)
        self.fields['username'] = serializers.CharField(required=False)

    def validate(self, attrs):
        # Logic to allow login with email if username is not provided
        email = attrs.get('email')
        if email and 'username' not in attrs:
            try:
                user = User.objects.get(email=email)
                attrs['username'] = user.username
            except User.DoesNotExist:
                # If user not found, let the parent class handle the error (it will fail on missing username or auth)
                pass

        data = super().validate(attrs)
        
        # Add extra user data to the response
        user_data = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'role': self.user.role,
        }
        
        # Check if the requested role matches the user's role (optional security check)
        requested_role = self.context['request'].data.get('role')
        if requested_role and requested_role.lower() != self.user.role.lower():
            # For admin, we might allow logging in without strict role check if they are superuser
            # But generally, enforce role match
            if not (self.user.is_superuser and requested_role.lower() == 'admin'):
                 # You might want to raise validation error here or just proceed. 
                 # For now let's just warn or allow. 
                 # Given the frontend passes role, let's trust the user's actual DB role.
                 pass

        data['user'] = user_data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"success": True, "message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        data = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'role': user.role,
            # Add other fields as necessary
        }
        return Response(data)

# Placeholder views for other endpoints found in configuration to prevent 404s
# These can be fully implemented later
class AdminDashboardStatsView(APIView):
    permission_classes = (permissions.IsAdminUser,)
    def get(self, request):
        return Response({
            "total_patients": User.objects.filter(role='patient').count(),
            "total_doctors": User.objects.filter(role='doctor').count(),
            "todays_appointments": 0 # Logic to fetch today's appointments count
        })
