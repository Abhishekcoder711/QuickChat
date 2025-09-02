function switchToLogin() {
  document.getElementById("page-title").textContent = "Welcome Back!";
  document.getElementById("form-button").textContent = "Continue";
  document.querySelector("form").setAttribute("action", "/login");
  document.getElementById("toggle-area").innerHTML = `Don’t have an account? <a onclick="switchToCreate()">Click here</a>`;
  clearError();
}

function switchToCreate() {
  document.getElementById("page-title").textContent = "Create Your QuickChat Account";
  document.getElementById("form-button").textContent = "Join Chat";
  document.querySelector("form").setAttribute("action", "/create");
  document.getElementById("toggle-area").innerHTML = `Already have an account? <a onclick="switchToLogin()">Click here</a>`;
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
        message = "⚠️ Mobile Number Registered. Try different one.";
        break;
      case "notfound":
        message = "❌ Username and Mobile Number are not match.";
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
    }
    msg.textContent = message;
  }
}

function clearError() {
  document.getElementById("error-msg").textContent = "";
}

function validateForm() {
  const mobile = document.getElementById("mobile").value;
  if (!/^\d{10}$/.test(mobile)) {
    document.getElementById("error-msg").textContent = "⚠️ Enter valid 10-digit mobile number.";
    return false;
  }
  return true;
}

showErrorMessage();