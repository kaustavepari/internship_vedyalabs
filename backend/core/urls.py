"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('data/', views.get_all_data, name='get_all_data'),
    path('card-data/', views.get_card_data, name='get_card_data'),
    path('traffic-volume-data/', views.get_traffic_volume_data, name='get_traffic_volume_data'),
    path('peak-time-data/', views.get_peak_time_data, name='get_peak_time_data'),
    path('latest-data-info/', views.get_latest_data_info, name='get_latest_data_info'),
    path('debug-card-data/', views.debug_card_data, name='debug_card_data'),
]
