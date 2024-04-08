document.addEventListener('DOMContentLoaded', function() {
    var showLoginBtn = document.getElementById('show-login');
    var showSignupBtn = document.getElementById('show-signup');
    var loginForm = document.getElementById('login-form');
    var signupForm = document.getElementById('signup-form');

    showLoginBtn.addEventListener('click', function() {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        this.classList.add('active');
        showSignupBtn.classList.remove('active');
    });

    showSignupBtn.addEventListener('click', function() {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        this.classList.add('active');
        showLoginBtn.classList.remove('active');
    });
});