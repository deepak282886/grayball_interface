document.addEventListener('DOMContentLoaded', function() {
    let currentSessionID = null;
    let lastSearchTime = 0; // Ensure this is properly defined in the scope accessible by handleSearch
    const debounceTime = 300; // milliseconds
    let userQueries = [];
    let messageCount = 0;

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
        if (messageCount >= 4) {
        // Optionally alert the user or display a message that they cannot send more messages
            document.getElementById('sessionLimitModal').style.display = 'block';
            return; // Exit the function to prevent more searches
        }
        const currentTime = new Date().getTime();
        if (currentTime - lastSearchTime <= debounceTime) return;
        lastSearchTime = currentTime;

        const userQuery = searchInput ? searchInput.value.trim() : '';
        if (!userQuery) return;

        messageCount++;
        if (searchInput) searchInput.disabled = true;
        if (searchButton) searchButton.disabled = true;

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
    userQuery2 = "User: " + userQuery
    userQueries.push(userQuery2);
    if (currentSessionID) {
        saveSearchQuery(userQuery, currentSessionID);
    }

    document.getElementById('loading-animation').classList.remove('hidden'); // Show loading

    try {
        const response = await fetch('/chat/', {  // Updated to use relative URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ msg: userQuery, allQueries: userQueries }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const systemResponse = data["response"]; // Use the correct key for your data
        const loadingAnimation = document.getElementById('loading-animation');
        if (loadingAnimation) {
            loadingAnimation.remove();
        }
        appendMessageToChat(systemResponse, false);
        systemResponse2 = "Assistant: " + systemResponse;
        userQueries.push(systemResponse2);
        if (currentSessionID) {
            saveSearchQuery(userQuery, currentSessionID, systemResponse);
        }
    } catch (error) {
        console.error("Error fetching search results:", error);
        appendMessageToChat("An error occurred. Please try again.", false);
    } finally {
        document.getElementById('loading-animation').classList.add('hidden'); // Hide loading
        if (searchInput) searchInput.disabled = false;
        if (searchButton) searchButton.disabled = false;
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
                messageCount = 0;
                let userQueries = [];
                if (callback) callback();
            }
        })
        .catch(error => console.error('Error starting new search session:', error));
    }

    function saveSearchQuery(query, sessionID, response = null) {
    const dataToSend = JSON.stringify({
        query: query,
        session_id: sessionID,
        response: response, // This will be null for the initial save and populated for the update
    });

    fetch('/save_search/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: dataToSend,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            console.log('Search saved:', data);
        } else {
            console.error('Failed to save search:', data.message);
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

        if (isUser) {
        const loadingAnimation = document.createElement('div');
        loadingAnimation.id = 'loading-animation'; // Make sure this ID is unique if you're calling it multiple times
        loadingAnimation.innerHTML = document.getElementById('loading-animation').innerHTML; // Assuming 'loading' is your predefined animation
        chatInterface.appendChild(loadingAnimation);
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
