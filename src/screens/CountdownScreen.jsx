import React, { useEffect, useRef } from 'react';
import './CountdownScreen.css';

const CountdownScreen = ({ onCountdownEnd }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      // Try to play with sound first
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay with sound blocked, playing muted:", error);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play();
          }
        });
      }
    }

    // Safety timeout in case video fails to load or end
    const safetyTimeout = setTimeout(() => {
      console.warn("Countdown safety timeout reached");
      onCountdownEnd();
    }, 8000); // 8 seconds max for a 5 second video

    return () => clearTimeout(safetyTimeout);
  }, [onCountdownEnd]);

  return (
    <div className="countdown-overlay">
      <div className="countdown-video-container">
        <video
          ref={videoRef}
          className="countdown-video"
          playsInline
          onEnded={onCountdownEnd}
        >
          <source src="/assets/countdown.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default CountdownScreen;
