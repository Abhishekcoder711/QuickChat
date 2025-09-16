/* eslint-disable no-unused-vars */
function switchToLogin() {
    document.getElementById("page-title").textContent = "Login";
    document.getElementById("form-button").textContent = "Login";
    document.querySelector("form").setAttribute("action", "/login");
    document.getElementById("toggle-area").innerHTML = `Don’t have an account? <a onclick="switchToCreate()">SignUp</a>`;
    document.getElementById("username").style.display = "none";
    document.getElementById("username").required = false; 
    document.querySelector('input[name="password"]').placeholder = "Enter Password";
    const termsDiv = document.getElementById("terms-div");
    if (termsDiv) {
        termsDiv.style.display = "none";
    }
    clearError();
}

function switchToCreate() {
    document.getElementById("page-title").textContent = "Create Your Account";
    document.getElementById("form-button").textContent = "Create";
    document.querySelector("form").setAttribute("action", "/create");
    document.getElementById("toggle-area").innerHTML = `Already have an account? <a onclick="switchToLogin()">Login</a>`;
    document.getElementById("username").style.display = "block";
    document.getElementById("username").required = true;
    document.querySelector('input[name="password"]').placeholder = "Set a Password";
    const termsDiv = document.getElementById("terms-div");
    if (termsDiv) {
        termsDiv.style.display = "block";
    }
    clearError();
}

function showErrorMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const msg = document.getElementById("error-msg");

    if (error) {
        let message = "";
        switch (error) {
            case "exists":
                message = "⚠️ Email is already registered. Try to Login.";
                break;
            case "notfound":
                message = "❌ Email and Password do not match.";
                break;
            case "empty":
                message = "⚠️ Please fill in all fields.";
                break;
            case "fail":
                message = "❌ Failed to create account.";
                break;
            case "db":
                message = "❌ Server error. Try again.";
                break;
            case "invalid-email":
                message = "⚠️ Please enter a valid email address.";
                break;
            case "short-password":
                message = "⚠️ Password must be at least 6 characters long.";
                break;
        }
        msg.textContent = message;
    }
}

function clearError() {
    document.getElementById("error-msg").textContent = "";
}

function validateForm() {
    const formAction = document.querySelector("form").getAttribute("action");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password") ? document.getElementById("password").value : null;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        document.getElementById("error-msg").textContent = "⚠️ Please enter a valid email address.";
        return false;
    }

    if (formAction === "/create" && password && password.length < 6) {
        document.getElementById("error-msg").textContent = "⚠️ Password must be at least 6 characters long.";
        return false;
    }

    if (formAction === "/create") {
        const termsCheckbox = document.getElementById("terms");
        if (!termsCheckbox || !termsCheckbox.checked) {
            document.getElementById("error-msg").textContent = "⚠️ You must agree to the terms and conditions.";
            return false;
        }
    }
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page");
    if (page === "login") {
        switchToLogin();
    } else {
        switchToCreate();
    }
    showErrorMessage();
});