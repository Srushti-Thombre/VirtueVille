const signupBtn = document.getElementById("signup-btn");
const signinBtn = document.getElementById("signin-btn");
const mainContainer = document.querySelector(".container");

signupBtn.addEventListener("click", () => {
  mainContainer.classList.add("change");
});

signinBtn.addEventListener("click", () => {
  mainContainer.classList.remove("change");
});
