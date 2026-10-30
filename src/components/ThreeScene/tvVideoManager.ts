import * as THREE from 'three';

let sharedVideo: HTMLVideoElement | null = null;
let sharedTexture: THREE.VideoTexture | null = null;

/**
 * Returns the shared HTML5 video element and THREE.VideoTexture configured
 * according to the exact TV playback specifications:
 * - flipY = false (critical for GLB UV mapping)
 * - colorSpace = SRGBColorSpace
 * - minFilter = LinearFilter, generateMipmaps = false
 * - muted = true, loop = true, playsInline = true, crossOrigin = 'anonymous'
 */
export function getTvVideo(): { video: HTMLVideoElement; texture: THREE.VideoTexture } {
  if (!sharedVideo || !sharedTexture) {
    const video = document.createElement('video');
    // Try /videos/tv.mp4, fallback to /TV_content.mp4 if needed
    video.src = '/videos/tv.mp4';
    video.loop = true;
    video.muted = true;          // autoplay-ku muted thaan venum
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';

    // Fallback if /videos/tv.mp4 errors
    video.onerror = () => {
      if (video.src.includes('/videos/tv.mp4')) {
        video.src = '/TV_content.mp4';
        video.play().catch(() => {});
      }
    };

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;           // GLB-oda UV-ku idhu romba mukkiyam
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;

    // Initial autoplay attempt
    video.play().catch(() => {
      // browser autoplay rule: user click pannina piragu play pannanum
    });

    const onUserInteraction = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };
    window.addEventListener('click', onUserInteraction, { once: true });
    window.addEventListener('pointerdown', onUserInteraction, { once: true });
    window.addEventListener('keydown', onUserInteraction, { once: true });

    sharedVideo = video;
    sharedTexture = tex;
  }

  return { video: sharedVideo, texture: sharedTexture };
}

/**
 * Applies the TV video texture directly to the existing GLTF TV screen mesh:
 * gltf.scene.traverse((o) => {
 *   if (o.isMesh && o.material.name === 'netflux') {
 *     o.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
 *   }
 * });
 */
export function applyTvVideoToScene(scene: THREE.Object3D): void {
  const { texture } = getTvVideo();

  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      const mesh = o as THREE.Mesh;
      const m = mesh.material;
      const matName = Array.isArray(m) ? m[0]?.name : m?.name;

      if (matName === 'netflux' || mesh.name === 'obj_02') {
        mesh.material = new THREE.MeshBasicMaterial({
          map: texture,
          toneMapped: false,
        });
        mesh.material.needsUpdate = true;
      }
    }
  });
}
