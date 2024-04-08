from django.urls import path, re_path
from . import views


urlpatterns = [
    path('', views.root_redirect, name='root_redirect'),
    re_path(r'^c/(?P<session_id>[a-z0-9\-]+)?/$', views.index, name='index'),
    path('auth/', views.auth_view, name='auth'),
    path('logout/', views.logout_view, name='logout'),
    path('account_details/', views.account_details, name='account_details'),
    path('save_search/', views.save_search, name='save_search'),
    path('start_new_search_session/', views.start_new_search_session, name='start_new_search_session'),
    path('start_new_search_session_pro/', views.start_new_search_session_pro, name='start_new_search_session_pro'),
    path('history/', views.history, name='history')]