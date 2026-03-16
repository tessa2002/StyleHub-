import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaCamera, FaSync, FaTimes, FaCheck, FaRobot } from 'react-icons/fa';
import './WebcamBodyScanner.css';

const WebcamBodyScanner = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const confirm = () => {
    if (imgSrc) {
      onCapture(imgSrc);
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <div className="webcam-scanner-overlay">
      <div className="webcam-scanner-container">
        <div className="webcam-header">
          <h3><FaRobot /> AI Body Scanner</h3>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        
        <div className="webcam-view-container">
          {!imgSrc ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="webcam-feed"
              />
              <div className="scan-overlay-guide">
                <div className="guide-box"></div>
                <p>Stand back so your full upper body is visible</p>
              </div>
            </>
          ) : (
            <img src={imgSrc} alt="captured" className="captured-image" />
          )}
        </div>

        <div className="webcam-footer">
          {!imgSrc ? (
            <button className="capture-btn" onClick={capture}>
              <FaCamera /> Take Photo
            </button>
          ) : (
            <div className="confirm-actions">
              <button className="retake-btn" onClick={retake}>
                <FaSync /> Retake
              </button>
              <button className="confirm-btn" onClick={confirm}>
                <FaCheck /> Analyze Body
              </button>
            </div>
          )}
        </div>
        
        <div className="scanner-tips">
          <p>💡 Tip: For best results, wear form-fitting clothes and stand against a plain background.</p>
        </div>
      </div>
    </div>
  );
};

export default WebcamBodyScanner;
