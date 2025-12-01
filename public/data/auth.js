const signupBtn = document.getElementById("signup-btn");
const signinBtn = document.getElementById("signin-btn");
const mainContainer = document.querySelector(".container");

signupBtn.addEventListener("click", () => {
  mainContainer.classList.add("change");
});

signinBtn.addEventListener("click", () => {
  mainContainer.classList.remove("change");
});

// === FLOATING AVATAR SYSTEM ===

// Your 12 avatar images
const avatarImages = [
  "/home_assets/boy1.png",
  "/home_assets/man1.png",
  "/home_assets/girl1.png",
  "/home_assets/woman1.png",
  "/home_assets/boy2.png",
  "/home_assets/man2.png",
  "/home_assets/girl2.png",
  "/home_assets/woman2.png",
  "/home_assets/boy3.png",
  "/home_assets/man3.png",
  "/home_assets/girl3.png",
  "/home_assets/woman3.png"
];

// Fixed left positions
const leftSide = [
  { top: "6vh", left: "4vw" },   
  { top: "22vh", left: "8vw" },  
  { top: "36vh", left: "3vw" },   
  { top: "50vh", left: "6.5vw" },   
  { top: "64vh", left: "2vw" }, 
  { top: "82vh", left: "4vw" }    
];

// Fixed right positions
const rightSide = [
  { top: "10vh", left: "92vw" },
  { top: "22vh", left: "88vw" },
  { top: "35vh", left: "93vw" },
  { top: "50vh", left: "89vw" },
  { top: "65vh", left: "94vw" },
  { top: "80vh", left: "90vw" }
];

// Combine left + right
const allPositions = [...leftSide, ...rightSide];

// Render avatars
avatarImages.forEach((src, i) => {
  const img = document.createElement("img");
  img.src = src;
  img.classList.add("floating-avatar");

  // Random 40% get the medium size
  if (Math.random() > 0.6) img.classList.add("medium");

  // Set fixed position
  img.style.top = allPositions[i].top;
  img.style.left = allPositions[i].left;

  document.body.appendChild(img);
});

// Stronger parallax effect
document.addEventListener("mousemove", (e) => {
  const offsetX = (e.clientX / window.innerWidth - 0.5) * 40; 
  const offsetY = (e.clientY / window.innerHeight - 0.5) * 40; 

  document.querySelectorAll(".floating-avatar").forEach((img, i) => {
    const depth = (i % 3) + 1;

    img.style.transform =
      `translate(${offsetX / depth}px, ${offsetY / depth}px)`;
  });
});
