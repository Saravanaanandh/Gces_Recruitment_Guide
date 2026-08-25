// Sound player for page turns using user-provided audio files

let nextAudio: HTMLAudioElement | null = null;
let prevAudio: HTMLAudioElement | null = null;

function initAudio() {
  if (typeof window === 'undefined') return;
  if (!nextAudio) {
    nextAudio = new Audio('/nextpage.wav');
    nextAudio.preload = 'auto';
  }
  if (!prevAudio) {
    prevAudio = new Audio('/previouspage.wav');
    prevAudio.preload = 'auto';
  }
}

/**
 * Play next page turn sound effect (nextpage.wav)
 */
export function playNextPageSound() {
  try {
    initAudio();
    if (nextAudio) {
      // Clone audio node to allow overlapping rapid flips
      const sound = nextAudio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.85;
      sound.play().catch(() => {
        // Handle autoplay policy if user hasn't interacted yet
      });
    }
  } catch (err) {
    // Ignore audio errors
  }
}

/**
 * Play previous page turn sound effect (previouspage.wav)
 */
export function playPrevPageSound() {
  try {
    initAudio();
    if (prevAudio) {
      // Clone audio node to allow overlapping rapid flips
      const sound = prevAudio.cloneNode() as HTMLAudioElement;
      sound.volume = 0.85;
      sound.play().catch(() => {
        // Handle autoplay policy if user hasn't interacted yet
      });
    }
  } catch (err) {
    // Ignore audio errors
  }
}
