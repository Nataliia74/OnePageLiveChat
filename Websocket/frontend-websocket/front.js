const login_form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMessage");
const logoutButton = document.getElementById("logout");

login_form.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  if (!username) {
    return;
  }
  localStorage.setItem("username", username);
  window.location.href = "chat.html";
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "index.html";
});
