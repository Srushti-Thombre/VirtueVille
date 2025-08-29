export const traits = { empathy: 5, courage: 5, selfishness: 1, fear: 3 };

export function saveProgress() {
  localStorage.setItem('vv_traits', JSON.stringify(traits));
}

export function loadProgress() {
  const s = localStorage.getItem('vv_traits');
  if (s) Object.assign(traits, JSON.parse(s));
}

export const clamp01to10 = n => Math.max(0, Math.min(10, n));
