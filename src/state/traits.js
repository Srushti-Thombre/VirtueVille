// Initial trait values (scale 0–10 suggested)
export const traits = {
  empathy: 0,
  responsibility: 0,
  courage: 0,
  fear: 0,
  selfishness: 0,
  dishonesty: 0,
};

// Track completed tasks
export const completedTasks = {
  libraryTask: false,
  pocketTask: false,
};

// Current user info
let currentUser = null;

// Get current user from server with enhanced error handling
export async function getCurrentUser() {
  if (currentUser) return currentUser;

  try {
    const response = await fetch("/api/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin", // Include cookies
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      console.log("✅ Logged in as:", currentUser.username);

      // Show welcome message if this is a new login
      if (data.showWelcome) {
        showWelcomeMessage(currentUser.username);
      }

      return currentUser;
    } else if (response.status === 401) {
      console.log("ℹ️ No active session, using anonymous mode");
    } else {
      console.error(
        "❌ Error fetching user:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("❌ Network error while fetching user:", error.message);
    console.log("ℹ️ Using anonymous mode due to connection error");
  }

  // Fallback to anonymous user if API fails
  currentUser = { id: "anonymous", username: "anonymous" };
  return currentUser;
}

// Show welcome message overlay
function showWelcomeMessage(username) {
  // Create welcome overlay
  const overlay = document.createElement("div");
  overlay.id = "welcome-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.5s ease-in;
  `;

  const messageBox = document.createElement("div");
  messageBox.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40px 60px;
    border-radius: 20px;
    text-align: center;
    color: white;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideIn 0.5s ease-out;
  `;

  messageBox.innerHTML = `
    <h1 style="font-size: 2.5rem; margin: 0 0 15px 0; font-family: 'Poppins', sans-serif; font-weight: 700;">
      🎮 Welcome to VirtueVille!
    </h1>
    <p style="font-size: 1.3rem; margin: 0 0 10px 0; font-family: 'Poppins', sans-serif;">
      Hello, <strong>${username}</strong>!
    </p>
    <p style="font-size: 1rem; margin: 0 0 25px 0; opacity: 0.9; font-family: 'Poppins', sans-serif;">
      Your journey to build character begins now
    </p>
    <button id="start-game-btn" style="
      background: white;
      color: #667eea;
      border: none;
      padding: 15px 40px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    ">
      Start Playing
    </button>
  `;

  // Add animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    #start-game-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
  `;
  document.head.appendChild(style);

  overlay.appendChild(messageBox);
  document.body.appendChild(overlay);

  // Close on button click
  document.getElementById("start-game-btn").addEventListener("click", () => {
    overlay.style.animation = "fadeIn 0.3s ease-out reverse";
    setTimeout(() => {
      overlay.remove();
    }, 300);
  });

  // Also close on clicking outside the box
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.style.animation = "fadeIn 0.3s ease-out reverse";
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }
  });
}

// Get user-specific localStorage key
function getUserSpecificKey(baseKey) {
  const userId = currentUser ? currentUser.id : "anonymous";
  return `vv_${userId}_${baseKey}`;
}

// Clamp function to keep values between 0 and 10
function clamp01to10(n) {
  return Math.max(0, Math.min(10, n));
}

// Save traits to localStorage with error handling
export async function saveProgress() {
  try {
    // Make sure we have current user info
    await getCurrentUser();

    const clamped = {};
    for (let key in traits) {
      clamped[key] = clamp01to10(traits[key]);
    }
    const saveData = {
      traits: clamped,
      completedTasks: { ...completedTasks },
    };

    const storageKey = getUserSpecificKey("progress");
    localStorage.setItem(storageKey, JSON.stringify(saveData));
    console.log("✅ Progress saved successfully");
  } catch (error) {
    console.error("❌ Error saving progress:", error.message);
    // Check if localStorage is available
    if (typeof Storage === "undefined") {
      console.error("❌ localStorage is not supported in this browser");
    } else if (error.name === "QuotaExceededError") {
      console.error("❌ localStorage quota exceeded");
    }
  }
}

// Load traits from localStorage with error handling
export async function loadProgress() {
  try {
    // Try to get current user info
    await getCurrentUser();

    const storageKey = getUserSpecificKey("progress");
    const s = localStorage.getItem(storageKey);

    if (s) {
      const saved = JSON.parse(s);

      // Load traits
      if (saved.traits) {
        for (let key in traits) {
          traits[key] = clamp01to10(saved.traits[key] ?? traits[key]);
        }
      }

      // Load completed tasks
      if (saved.completedTasks) {
        for (let key in completedTasks) {
          completedTasks[key] =
            saved.completedTasks[key] ?? completedTasks[key];
        }
      }
      console.log("✅ Progress loaded successfully");
    } else {
      // No saved data found - reset to defaults to ensure new users can access all tasks
      console.log("ℹ️ No saved progress found, starting fresh");
      for (let key in completedTasks) {
        completedTasks[key] = false;
      }
    }
  } catch (error) {
    console.error("❌ Error loading progress:", error.message);
    // Reset to defaults on error
    for (let key in completedTasks) {
      completedTasks[key] = false;
    }
  }
}

// Reset traits to default (useful for testing or new game)
export async function resetTraits() {
  for (let key in traits) {
    traits[key] = 0;
  }
  for (let key in completedTasks) {
    completedTasks[key] = false;
  }
  await saveProgress();
}

// Mark a task as completed
export async function markTaskCompleted(taskName) {
  if (taskName in completedTasks) {
    completedTasks[taskName] = true;
    await saveProgress();
  }
}

// Check if a task is completed
export function isTaskCompleted(taskName) {
  return completedTasks[taskName] || false;
}
