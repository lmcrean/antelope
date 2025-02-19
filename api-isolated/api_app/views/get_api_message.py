from rest_framework.views import APIView
from django.http import JsonResponse

class APITest(APIView):
    def get(self, request):
        return JsonResponse({"message": "API is working!"})