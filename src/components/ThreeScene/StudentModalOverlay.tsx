import React, { useEffect, useMemo, useState } from 'react';
import { STUDENT_STATS_DATA } from '../../data/studentStats';
import { StudentHUDLayout } from './StudentHUDLayout';
import './transparentDisplay.css';

interface StudentModalOverlayProps {
  initialIndex?: number;
  onClose: () => void;
}

export const StudentModalOverlay: React.FC<StudentModalOverlayProps> = ({
  initialIndex = 0,
  onClose,
}) => {
  // Sort students alphabetically by name
  const studentEntries = useMemo(() => {
    return Object.entries(STUDENT_STATS_DATA.students).sort(([, a], [, b]) => {
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  const [studentId, student] = studentEntries[currentIndex] || studentEntries[0];

  // Auto-play cycling if enabled in modal
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % studentEntries.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay, studentEntries.length]);

  // Close on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : studentEntries.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < studentEntries.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="transparent-screen-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="transparent-screen-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-bar">
          <div className="modal-header-title">
            <span className="hud-live-dot" />
            <span>CYBER HUD STUDENT DASHBOARD &mdash; {student.name}</span>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <StudentHUDLayout
            student={student}
            studentId={studentId}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            studentEntries={studentEntries}
            handlePrev={handlePrev}
            handleNext={handleNext}
            autoPlay={autoPlay}
            setAutoPlay={setAutoPlay}
            isModal={true}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentModalOverlay;
