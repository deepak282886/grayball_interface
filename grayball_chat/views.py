# Create your views here.
import uuid
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
import json
from .models import SearchSession, UserSearch
from django.contrib.auth.decorators import login_required
from django.contrib.messages import get_messages
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
import re
from django.contrib.auth import update_session_auth_hash
from .forms import EditUserForm, CustomPasswordChangeForm

from django.contrib.auth.decorators import login_required
from .models import SearchSession
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .models import SearchSession, UserSearch
from django.core.paginator import Paginator

@login_required
def get_more_sessions(request):
    try:
        # Retrieve the page number from the request; default to 1 if not provided
        page_number = request.GET.get('page', 1)
        page_size = 5  # Number of sessions to return per page

        # Get the search sessions for the current user
        sessions = SearchSession.objects.filter(user=request.user).order_by('-created_at')

        # Create a Paginator object and get the requested page
        paginator = Paginator(sessions, page_size)
        requested_page = paginator.get_page(page_number)

        # Serialize the session data (you can modify this part to suit your data structure)
        session_data = []
        for session in requested_page:
            searches = list(
                session.searches.all().values('query', 'response'))  # Or however you want to serialize the searches
            session_info = {
                'id': str(session.id),
                'created_at': session.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'searches': searches,  # Include the searches in the session data
            }
            session_data.append(session_info)

        return JsonResponse({
            'status': 'success',
            'sessions': session_data,
            'has_next': requested_page.has_next(),
            'next_page_number': requested_page.next_page_number() if requested_page.has_next() else None,
        })

    except Exception as e:
        # Handle any unexpected errors
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def start_new_search_session_pro(request):
    if request.method == 'POST' and request.user.is_authenticated:
        new_session = SearchSession.objects.create(user=request.user)
        return JsonResponse({'status': 'success', 'session_id': str(new_session.id)})
    return JsonResponse({'status': 'error'}, status=400)


from django.db.models import Count
@login_required
def history(request):
    # Fetch all search sessions for the current user with at least one search
    sessions = SearchSession.objects.filter(user=request.user) \
                                     .annotate(searches_count=Count('searches')) \
                                     .filter(searches_count__gt=0) \
                                     .prefetch_related('searches') \
                                     .order_by('-created_at')

    # Render the page with the fetched sessions
    return render(request, 'history.html', {'sessions': sessions})

@login_required
def account_details(request):
    storage = messages.get_messages(request)
    storage.used = True
    if request.method == 'POST':
        user_form = EditUserForm(request.POST, instance=request.user)
        password_form = CustomPasswordChangeForm(request.user, request.POST)

        if 'edit_user' in request.POST:
            if user_form.is_valid():
                user_form.save()
                messages.success(request, 'Username successfully updated!')
            else:
                messages.error(request, 'Please correct the error below.')

        if 'change_password' in request.POST:
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)
                messages.success(request, 'Your password was successfully updated!')
            else:
                messages.error(request, 'Please correct the error below.')
    else:
        user_form = EditUserForm(instance=request.user)
        password_form = CustomPasswordChangeForm(request.user)

    return render(request, 'account_details.html', {
        'user_form': user_form,
        'password_form': password_form
    })

def root_redirect(request):
    # Example redirection to the 'auth' view
    # print(request)
    context = {}
    context['form'] = 'login'
    return render(request, 'auth.html', context)


@login_required
def index(request, session_id):
    context = {}

    # Try to fetch the session that matches the session_id and belongs to the current user
    if session_id:
        # Ensuring session_id belongs to the current user
        session = get_object_or_404(SearchSession, id=session_id, user=request.user)
        context['session_id'] = session
    else:
        # If no existing session matches, create a new session
        # This is optional and depends on your application logic
        session_id = str(uuid.uuid4())
        session = SearchSession.objects.create(id=session_id, user=request.user)

    context['session_id'] = str(session.id)
    context['current_session'] = session.id

    if 'new_search' in request.GET:
        context['reset_search'] = True

    return render(request, 'index.html', context)

@login_required
def start_new_search_session(request):
    if request.user.is_authenticated:
        context = {}
        session_id = str(uuid.uuid4())
        new_session = SearchSession.objects.create(id=session_id, user=request.user)
        context['session_id'] = str(new_session.id)
        context['current_session'] = new_session.id
        return redirect('index', session_id = new_session.id) #redirect('index', session_id = new_session.id) #{'status': 'success', 'session_id': str(new_session.id)})
    return JsonResponse({'status': 'error'}, status=400)


from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import SearchSession, UserSearch
import json


@login_required
@require_POST
def save_search(request):
    try:
        data = json.loads(request.body)
        query = data.get('query')
        session_id = data.get('session_id')
        response = data.get('response', None)  # New line to accept response

        if not query:
            return JsonResponse({'status': 'error', 'message': 'No query provided'}, status=400)
        if not session_id:
            return JsonResponse({'status': 'error', 'message': 'Session ID is required'}, status=400)

        # Ensure the session exists and belongs to the current user
        try:
            session = SearchSession.objects.get(id=session_id, user=request.user)
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Session not found'}, status=404)

        # Check if the user search exists to decide if we should update it
        user_search, created = UserSearch.objects.get_or_create(session=session, query=query,
                                                                defaults={'response': response})

        # If the object was fetched and not created, we update the response if it's provided
        if not created and response is not None:
            user_search.response = response
            user_search.save()

        return JsonResponse({'status': 'success', 'session_id': str(session.id), 'created': created})

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        # Log the exception here if you have logging set up
        return JsonResponse({'status': 'error', 'message': 'Internal server error: {}'.format(str(e))}, status=500)


def logout_view(request):
    storage = get_messages(request)
    for message in storage:
        pass

    logout(request)
    messages.success(request, 'You have been successfully logged out.')
    return redirect('auth')

def auth_view(request, session_id=None):

    context = {'form': 'login'}

    if request.user.is_authenticated:
        if session_id:
            # Ensuring session_id belongs to the current user
            session = get_object_or_404(SearchSession, id=session_id, user=request.user)
            context['session_id'] = session
        else:
            # If no existing session matches, create a new session
            # This is optional and depends on your application logic
            session_id = str(uuid.uuid4())
            session = SearchSession.objects.create(id=session_id, user=request.user)

        context['session_id'] = str(session.id)
        context['current_session'] = session.id

        return redirect('index', session_id = context['session_id'])


    if request.method == 'POST':
        # Handling login
        if 'login' in request.POST:
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = authenticate(username=username, password=password)

            if user is not None:
                auth_login(request, user)
                messages.success(request, 'Successfully logged in.')
                if session_id:
                    # Ensuring session_id belongs to the current user
                    session = get_object_or_404(SearchSession, id=session_id, user=user)
                    context['session_id'] = session
                else:
                    # If no existing session matches, create a new session
                    # This is optional and depends on your application logic
                    session_id = str(uuid.uuid4())
                    session = SearchSession.objects.create(id=session_id, user=user)

                context['session_id'] = str(session.id)
                context['current_session'] = session.id

                return redirect('index', session_id = context['session_id'])
            else:
                messages.error(request, 'Invalid login credentials.')

        # Handling signup
        elif 'signup' in request.POST:
            username = request.POST.get('username')
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')

            # Username rules
            if len(username) < 6:
                messages.error(request, 'Username must be at least 6 characters long.')
                context['form'] = 'signup'
            elif not re.match('^[a-zA-Z0-9]*$', username):
                messages.error(request, 'Username can only contain letters and numbers.')
                context['form'] = 'signup'
            elif password != confirm_password:
                messages.error(request, 'Passwords do not match.')
                context['form'] = 'signup'
            else:
                try:
                    validate_password(password)
                    if not User.objects.filter(username=username).exists():
                        User.objects.create_user(username=username, password=password)
                        user = authenticate(username=username, password=password)
                        auth_login(request, user)
                        messages.success(request, 'Account created successfully.')
                        if session_id:
                            # Ensuring session_id belongs to the current user
                            session = get_object_or_404(SearchSession, id=session_id, user=user)
                            context['session_id'] = session
                        else:
                            # If no existing session matches, create a new session
                            # This is optional and depends on your application logic
                            session_id = str(uuid.uuid4())
                            print(request.user)
                            session = SearchSession.objects.create(id=session_id, user=user)

                        context['session_id'] = str(session.id)
                        context['current_session'] = session.id

                        return redirect('index', session_id = context['session_id'])
                    else:
                        messages.error(request, 'Username already exists.')
                        context['form'] = 'signup'
                except ValidationError as e:
                    messages.error(request, ' '.join(e.messages))
                    context['form'] = 'signup'

    return render(request, 'auth.html', context)
