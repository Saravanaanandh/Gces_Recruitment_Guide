import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { getTvVideo } from './tvVideoManager';

interface TVDisplayProps {
  videoSrc?: string;
}

const TVDisplay: React.FC<TVDisplayProps> = () => {
  const { video } = getTvVideo();

  const [isPlaying, setIsPlaying] = useState<boolean>(!video.paused);
  const [isMuted, setIsMuted] = useState<boolean>(video.muted);
  const [progress, setProgress] = useState<number>(0);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('0:00');
  const [durationStr, setDurationStr] = useState<string>('0:00');

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => setIsMuted(video.muted);
    const onTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
        setDurationStr(formatTime(video.duration));
      }
      setCurrentTimeStr(formatTime(video.currentTime));
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('timeupdate', onTimeUpdate);

    // Initial state sync
    setIsPlaying(!video.paused);
    setIsMuted(video.muted);
    if (video.duration && !isNaN(video.duration)) {
      setDurationStr(formatTime(video.duration));
    }

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [video]);

  const togglePlay = () => {
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
  };

  return (
    <group>
      {/* ── Invisible click plane over the TV screen to toggle Play/Pause on click ── */}
      <mesh
        position={[-0.0308, -0.1161, -2.170]}
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      >
        <planeGeometry args={[1.108, 0.644]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ── TV OSD Controls Bar Overlay (mounted at bottom of TV screen) ── */}
      <Html
        transform
        distanceFactor={0.65}
        position={[-0.0308, -0.370, -2.165]}
        zIndexRange={[30, 60]}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          className="tv-osd-panel visible"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress scrubber bar */}
          <div className="tv-progress-track" onClick={handleSeek} title="Seek Video">
            <div className="tv-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="tv-controls-row">
            {/* Play/Pause Button */}
            <button
              className="tv-btn tv-btn-play"
              onClick={togglePlay}
              title={isPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isPlaying ? (
                <span className="tv-icon">&#10074;&#10074;</span>
              ) : (
                <span className="tv-icon">&#9654;</span>
              )}
              <span className="tv-btn-label">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {/* Mute/Unmute Button */}
            <button
              className={`tv-btn tv-btn-mute ${isMuted ? 'muted' : 'unmuted'}`}
              onClick={toggleMute}
              title={isMuted ? 'Unmute Audio (Sound On)' : 'Mute Audio (Muted)'}
            >
              <span className="tv-icon">{isMuted ? '🔇' : '🔊'}</span>
              <span className="tv-btn-label">{isMuted ? 'Unmute' : 'Sound On'}</span>
            </button>

            {/* Time Stamp Display */}
            <div className="tv-timestamp">
              <span>{currentTimeStr}</span>
              <span className="tv-sep">/</span>
              <span>{durationStr}</span>
            </div>

            {/* Live TV Badge */}
            <div className="tv-live-pill">
              <span className="tv-live-dot" />
              <span>TV STREAM</span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

export default TVDisplay;
