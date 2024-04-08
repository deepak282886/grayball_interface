function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBoxContainer = document.querySelector('.search-box-container');
    const results = document.getElementById('results');

    if (searchInput.value.trim() !== '') {
        searchBoxContainer.classList.add('bottom-search'); // Move the search box to the bottom
        results.style.display = 'block';
        results.innerHTML = '<p class="text-2xl">Displaying results for "' + searchInput.value + '"</p>';
        searchInput.value = ''; // Optionally clear the input
    }
}

// Event listener for the search button click
document.getElementById('search-button').addEventListener('click', handleSearch);

// Event listener for Enter key press in the search input
document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Function to expand the textarea automatically as more text is entered
function adjustTextAreaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Event listener for input in the search textarea
document.getElementById('search-input').addEventListener('input', function () {
    adjustTextAreaHeight(this);
});

// Initialize the textarea height adjustment
adjustTextAreaHeight(document.getElementById('search-input'));

function resetSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBoxContainer = document.querySelector('.search-box-container');
    const results = document.getElementById('results');

    // Clear the search input and any displayed results
    searchInput.value = '';
    results.innerHTML = '';
    results.style.display = 'none';

    // If using a class to move the search box to the bottom, remove it
    searchBoxContainer.classList.remove('bottom-search');

    // Reset the height of the textarea
    adjustTextAreaHeight(searchInput);
}

document.addEventListener('DOMContentLoaded', function() {
    // Toggle dropdown display
    function toggleDropdown() {
        var dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Close dropdown when clicking outside
    function closeDropdown(event) {
        var dropdown = document.getElementById('user-dropdown');
        var button = document.getElementById('username-btn');
        if (dropdown && !dropdown.contains(event.target) && (!button || !button.contains(event.target))) {
            dropdown.style.display = 'none';
        }
    }

    // Attach event listener to username button, if it exists
    var usernameBtn = document.getElementById('username-btn');
    if (usernameBtn) {
        usernameBtn.addEventListener('click', toggleDropdown);
    }

    // Attach event listener to close dropdown when clicking outside
    window.addEventListener('click', closeDropdown);
});




