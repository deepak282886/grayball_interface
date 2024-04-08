let currentPage = 1; // Start from the first page

document.getElementById('show-more-btn').addEventListener('click', function() {
    currentPage++; // Increment to load the next page

    fetch(`/get_more_sessions/?page=${currentPage}`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const sessionsContainer = document.getElementById('sessions-container');
                const showMoreBtn = document.getElementById('show-more-btn');

                data.sessions.forEach(session => {
                    // Skip sessions with no searches
                    if (!session.searches || session.searches.length === 0) {
                        return;
                    }

                    // Create the session div
                    const sessionDiv = createSessionDiv(session);
                    // Insert the session div before the Show More button
                    sessionsContainer.insertBefore(sessionDiv, showMoreBtn);
                });

                // If there are no more pages, hide the "Show More" button
                if (!data.has_next) {
                    showMoreBtn.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error loading more sessions:', error);
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
