import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

interface PostProcessingEffectsProps {
  deviceTier: 'desktop' | 'tablet' | 'mobile';
}

const PostProcessingEffects: React.FC<PostProcessingEffectsProps> = ({ deviceTier }) => {
  // Skip all post-processing on mobile for performance
  if (deviceTier === 'mobile') return null;

  const bloomIntensity = deviceTier === 'desktop' ? 0.85 : 0.5;

  return (
    <EffectComposer>
      {/* Bloom — lower threshold so cyan rings / arc lines glow */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.52}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      {/* Vignette to focus attention on the platform/book center */}
      <Vignette
        offset={0.25}
        darkness={0.55}
      />
    </EffectComposer>
  );
};

export default PostProcessingEffects;
