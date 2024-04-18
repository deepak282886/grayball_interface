let currentPage = 1; // Start from the first page

document.getElementById('show-more-btn').addEventListener('click', function() {
    currentPage++; // Increment to load the next page

    fetch(`/get_more_sessions/?page=${currentPage}`, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);

            if (data.status === 'success') {
                const sessionsContainer = document.getElementById('sessions-container');
                const showMoreBtn = document.getElementById('show-more-btn');

                data.sessions.forEach(session => {
                    if (!session.searches || session.searches.length === 0) {
                        return;
                    }

                    const sessionDiv = createSessionDiv(session); // Ensure this function is defined and logs its activity
                    sessionsContainer.insertBefore(sessionDiv, showMoreBtn);
                });

                if (!data.has_next) {
                    showMoreBtn.style.display = 'none';
                }
            } else {
                console.error('Error from server:', data.message); // Log server-side errors
            }
        })
        .catch(error => {
            console.error('Error loading more sessions:', error); // Log errors that occur during fetch
        });
});


function createSessionDiv(session) {
    const sessionDiv = document.createElement('div');
    sessionDiv.classList.add('session');

    // Create the session header with only the first query
    const sessionHeader = document.createElement('div');
    sessionHeader.classList.add('session-header');
    sessionHeader.innerHTML = `<p>${session.searches[0].query}</p>`; // Only the first query
    sessionHeader.onclick = function() { toggleSessionDetails(this); };
    sessionDiv.appendChild(sessionHeader);

    // Create the session details (hidden initially)
    const sessionDetails = document.createElement('div');
    sessionDetails.classList.add('session-details');
    sessionDetails.style.display = 'none';

    const ul = document.createElement('ul');
    session.searches.forEach(search => {
        const li = document.createElement('li');
        li.textContent = `Query: ${search.query}, Response: ${search.response}`;
        ul.appendChild(li);
    });
    sessionDetails.appendChild(ul);

    sessionDiv.appendChild(sessionDetails);

    return sessionDiv;
}

function toggleSessionDetails(element) {
    const details = element.nextElementSibling;
    details.style.display = details.style.display === 'none' ? 'block' : 'none';
}
