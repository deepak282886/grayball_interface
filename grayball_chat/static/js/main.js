document.addEventListener('DOMContentLoaded', function() {
    let currentSessionID = null;
    let lastSearchTime = 0; // Ensure this is properly defined in the scope accessible by handleSearch
    const debounceTime = 300; // milliseconds

    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const usernameBtn = document.getElementById('username-btn');
    const chatInterface = document.getElementById('chat-interface');
    const searchBoxContainer = document.querySelector('.search-box-container');
    const dropdown = document.getElementById('user-dropdown');

    // Initialize event listeners
    if (searchInput) {
        adjustTextAreaHeight(searchInput);
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();  // Prevents the form from submitting
                handleSearch();
            }
        });
        searchInput.addEventListener('input', function() {
            adjustTextAreaHeight(this);
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }

    if (usernameBtn) {
        usernameBtn.addEventListener('click', toggleDropdown);
    }

    window.addEventListener('click', closeDropdown);

    function handleSearch() {
        const currentTime = new Date().getTime();
        if (currentTime - lastSearchTime <= debounceTime) return;
        lastSearchTime = currentTime;

        const userQuery = searchInput ? searchInput.value.trim() : '';
        if (!userQuery) return;

        if (!currentSessionID) {
            startNewSearchSession(() => processSearch(userQuery));
        } else {
            processSearch(userQuery);
        }
    }

    async function processSearch(userQuery) {
    appendMessageToChat(userQuery, true);
    resetSearchInput();
    moveSearchBoxToBottom();
    scrollToBottom();

    document.getElementById('loading-animation').classList.remove('hidden'); // Show loading

    try {
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ msg: userQuery }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const systemResponse = data["response"]; // Use the correct key for your data
        appendMessageToChat(systemResponse, false);
    } catch (error) {
        console.error("Error fetching search results:", error);
        appendMessageToChat("An error occurred. Please try again.", false);
    } finally {
        document.getElementById('loading-animation').classList.add('hidden'); // Hide loading
    }
    }


    function startNewSearchSession(callback) {
        fetch('/start_new_search_session_pro/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCSRFToken() }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                currentSessionID = data.session_id;
                if (callback) callback();
            }
        })
        .catch(error => console.error('Error starting new search session:', error));
    }

    function saveSearchQuery(query, sessionID) {
        fetch('/save_search/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ query: query, session_id: sessionID })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log('Search saved:', data);
            }
        })
        .catch(error => console.error('Error saving search:', error));
    }

    function appendMessageToChat(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.innerHTML = `<p>${message}</p>`;

        if (isUser) {
            messageDiv.classList.add('user-message');
        } else {
            messageDiv.classList.add('system-response');
        }

        chatInterface.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }



    function adjustTextAreaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function resetSearchInput() {
        if (searchInput) {
            searchInput.value = '';
            adjustTextAreaHeight(searchInput);
        }
    }

    function getCSRFToken() {
        let csrfToken = null;
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            let [key, value] = cookie.trim().split('=');
            if (key === 'csrftoken') {
                csrfToken = value;
                break;
            }
        }
        return csrfToken;
    }

    function toggleDropdown(event) {
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            event.stopPropagation();
        }
    }

    function closeDropdown(event) {
        if (dropdown && !dropdown.contains(event.target) && (!usernameBtn || !usernameBtn.contains(event.target))) {
            dropdown.style.display = 'none';
        }
    }

    function moveSearchBoxToBottom() {
        if (searchBoxContainer) {
            searchBoxContainer.classList.add('bottom-search');
        }
    }

    function scrollToBottom() {
        if (chatInterface) {
            chatInterface.scrollTop = chatInterface.scrollHeight;
        }
    }
});
