from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import Hospital
from ..serializers import HospitalSerializer

class HospitalListView(generics.ListAPIView):
    """
    List all hospitals (branches).
    Publicly accessible so patients can select a branch before login or on dashboard.
    """
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [AllowAny]
