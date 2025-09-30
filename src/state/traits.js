// Initial trait values (scale 0–10 suggested)
export const traits = {
    empathy: 0,
    responsibility: 0,
    courage: 0,
    fear: 0,
    selfishness: 0,
    dishonesty: 0
};

// Clamp function to keep values between 0 and 10
function clamp01to10(n) {
    return Math.max(0, Math.min(10, n));
}

// Save traits to localStorage
export function saveProgress() {
    const clamped = {};
    for (let key in traits) {
        clamped[key] = clamp01to10(traits[key]);
    }
    localStorage.setItem("vv_traits", JSON.stringify(clamped));
}

// Load traits from localStorage
export function loadProgress() {
    const s = localStorage.getItem("vv_traits");
    if (s) {
        const saved = JSON.parse(s);
        for (let key in traits) {
            traits[key] = clamp01to10(saved[key] ?? traits[key]);
        }
    }
}

// Reset traits to default (useful for testing or new game)
export function resetTraits() {
    for (let key in traits) {
        traits[key] = 0;
    }
    saveProgress();
}
