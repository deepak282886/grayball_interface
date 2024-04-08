document.addEventListener('DOMContentLoaded', function() {
    var showLoginBtn = document.getElementById('show-login');
    var showSignupBtn = document.getElementById('show-signup');
    var loginForm = document.getElementById('login-form');
    var signupForm = document.getElementById('signup-form');

    // Function to toggle active button styling
    function toggleActiveButton() {
        if (loginForm.style.display === 'block') {
            showLoginBtn.classList.add('active');
            showSignupBtn.classList.remove('active');
        } else {
            showLoginBtn.classList.remove('active');
            showSignupBtn.classList.add('active');
        }
    }

    // Show login form and apply active button styling
    showLoginBtn.addEventListener('click', function() {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        toggleActiveButton();
    });

    // Show signup form and apply active button styling
    showSignupBtn.addEventListener('click', function() {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        toggleActiveButton();
    });

    // Initialize with login form shown by default
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    toggleActiveButton();
});
