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

// Get current user from server
export async function getCurrentUser() {
  if (currentUser) return currentUser;
  
  try {
    const response = await fetch('/api/user');
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      return currentUser;
    }
  } catch (error) {
    console.warn('Could not get current user, using anonymous mode:', error);
  }
  
  // Fallback to anonymous user if API fails
  currentUser = { id: 'anonymous', username: 'anonymous' };
  return currentUser;
}

// Get user-specific localStorage key
function getUserSpecificKey(baseKey) {
  const userId = currentUser ? currentUser.id : 'anonymous';
  return `vv_${userId}_${baseKey}`;
}

// Clamp function to keep values between 0 and 10
function clamp01to10(n) {
  return Math.max(0, Math.min(10, n));
}

// Save traits to localStorage
export async function saveProgress() {
  // Make sure we have current user info
  await getCurrentUser();
  
  const clamped = {};
  for (let key in traits) {
    clamped[key] = clamp01to10(traits[key]);
  }
  const saveData = {
    traits: clamped,
    completedTasks: { ...completedTasks }
  };
  localStorage.setItem(getUserSpecificKey("progress"), JSON.stringify(saveData));
}

// Load traits from localStorage
export async function loadProgress() {
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
        completedTasks[key] = saved.completedTasks[key] ?? completedTasks[key];
      }
    }
  } else {
    // No saved data found - reset to defaults to ensure new users can access all tasks
    console.log('No saved progress found, starting fresh');
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
