// Variables
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const signupBtn = document.getElementById('signupBtn');
    const loginBtn = document.getElementById('loginBtn');

    if (signupBtn) {
        signupBtn.addEventListener('click', signup);
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
});

// Authentication Functions
async function signup() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


    let response = await fetch('/signup', {
        method: 'POST',
        body: JSON.stringify({
            "username": username, 
            "email": email,
            "password": password
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if(response.ok) {
        let json = await response.json();

        if(json.success) {
            alert(json.message);
            window.location.href = '/';
        } else {
            window.location.href = '/signup';
        }
    } else {
        alert("Error occurred during signup")
    }
}

async function login() {
    const identifier = document.getElementById('identifier').value;
    const password = document.getElementById('password').value;

    console.log("Login in progress")

    let response = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify({
            "identifier": identifier,
            "password": password
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if(response.ok) {
        let json = await response.json();

        if(json.success) {
            alert(json.message);
            window.location.href = '/';
        } else {
            window.location.href = '/login';
        }
    } else {
        alert("Error occurred during login")
    }
}