function flip() {
    document.getElementById("card").classList.toggle("flip");
}

function validateForm(e) {
    const form = e.target;
    const action = form.getAttribute("action");

    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value.trim();

    clearError(form);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        showError("⚠️ Enter valid email", form);
        return false;
    }

    if (!password) {
        showError("⚠️ Password required", form);
        return false;
    }

    if (action === "/create") {
        const username = form.querySelector('input[name="username"]').value.trim();

        if (!username) {
            showError("⚠️ Enter name", form);
            return false;
        }

        if (password.length < 6) {
            showError("⚠️ Min 6 chars password", form);
            return false;
        }
    }

    return true;
}

function showError(msg, form) {
    const error = form.querySelector(".error-msg");
    error.textContent = msg;
    error.style.display = "block";
}

function clearError(form) {
    const error = form.querySelector(".error-msg");
    error.textContent = "";
    error.style.display = "none";
}

// Handle URL parameters for errors and page switching
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const page = urlParams.get("page");

    if (error) {
        let message = "";
        switch (error) {
            case "exists":
                message = "⚠️ Email is already registered. Try to Login.";
                break;
            case "notfound":
                message = "❌ Invalid email or password.";
                break;
            case "empty":
                message = "⚠️ Please fill in all fields.";
                break;
            case "invalid-email":
                message = "⚠️ Please enter a valid email address.";
                break;
            case "short-password":
                message = "⚠️ Password must be at least 6 characters long.";
                break;
            default:
                message = "❌ An error occurred. Please try again.";
        }
        showError(message);
    }
});


// ================= FACEBOOK LOGIN =================

// FACEBOOK LOGIN
function loginWithFacebook() {
    FB.login(function(response) {
        if (response.authResponse) {
            FB.api('/me', { fields: 'name,email' }, function(user) {
                console.log("Facebook User:", user);

                fetch("/auth/facebook", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: user.email,
                        name: user.name
                    })
                })
                .then(res => res.json())
                .then(data => {
                    window.location.href = "/chat";
                });
            });
        }
    }, { scope: 'email' });
}

// ================= GOOGLE LOGIN =================

// Initialize ONLY ONCE (IMPORTANT)
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "215720195583-mdhlhcp1nlskktf6i564mim7neleg2u1.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });
};

// Button click → trigger popup
function triggerGoogleLogin() {
    console.log("CLICKED");

    google.accounts.id.prompt((notification) => {
        console.log("Prompt:", notification);
    });
}

// Handle Google response
function handleGoogleLogin(response) {
    console.log("Google Response:", response);

    fetch("/auth/google", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            credential: response.credential
        })
    })
    .then(res => res.json())
    .then(data => {
        window.location.href = "/chat";
    })
    .catch(err => console.log(err));
}

// ================= LOGOUT (IMPORTANT) =================

// Jab logout kare tab call karna
function logout() {
    // Google logout reset
    if (window.google) {
        google.accounts.id.disableAutoSelect();
    }

    window.location.href = "/create";
}