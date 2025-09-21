function switchToLogin() {
    document.getElementById("page-title").textContent = "Login";
    document.getElementById("form-button").textContent = "Login";
    document.querySelector("form").setAttribute("action", "/login");
    document.getElementById("toggle-area").innerHTML = `Don't have an account? <a onclick="switchToCreate()">SignUp</a>`;
    document.getElementById("username").style.display = "none";
    document.getElementById("username").required = false;
    document.querySelector('input[name="terms"]').required = false;
    document.querySelector('.terms-container').style.display = "none";
    clearError();
}

function switchToCreate() {
    document.getElementById("page-title").textContent = "Create Your Account";
    document.getElementById("form-button").textContent = "Create";
    document.querySelector("form").setAttribute("action", "/create");
    document.getElementById("toggle-area").innerHTML = `Already have an account? <a onclick="switchToLogin()">Login</a>`;
    document.getElementById("username").style.display = "block";
    document.getElementById("username").required = true;
    document.querySelector('input[name="terms"]').required = true;
    document.querySelector('.terms-container').style.display = "block";
    clearError();
}

function validateForm() {
    clearError();
    const formAction = document.querySelector("form").getAttribute("action");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        showError("⚠️ Please enter a valid email address.");
        return false;
    }

    if (!password) {
        showError("⚠️ Password is required.");
        return false;
    }

    if (formAction === "/create") {
        const username = document.getElementById("username").value;
        if (!username) {
            showError("⚠️ Username is required.");
            return false;
        }
        if (password.length < 6) {
            showError("⚠️ Password must be at least 6 characters long.");
            return false;
        }
        const terms = document.querySelector('input[name="terms"]');
        if (!terms.checked) {
            showError("⚠️ You must agree to the terms and conditions.");
            return false;
        }
    }
    return true;
}

function showError(message) {
    const errorElement = document.getElementById("error-msg");
    errorElement.textContent = message;
    errorElement.style.display = "block";
}

function clearError() {
    const errorElement = document.getElementById("error-msg");
    errorElement.textContent = "";
    errorElement.style.display = "none";
}

// Handle URL parameters for errors and page switching
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const page = urlParams.get("page");

    if (page === "login") {
        switchToLogin();
    }

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
