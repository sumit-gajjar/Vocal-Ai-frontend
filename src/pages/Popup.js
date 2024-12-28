import React, { useEffect, useState } from 'react';
import AudioRecorder from './AudioRecorder';
import './Popup.css'; // Import the CSS file for styling

const Popup = ({ onClose, onRecordingComplete, refreshContent }) => {
  const [recorderKey, setRecorderKey] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);

  useEffect(() => {
    return () => {
      handleStopRecording();
      setRecorderKey(prevKey => prevKey + 1); // Force remount AudioRecorder to reset it
    };
  }, []);

  const handleClose = () => {
    handleStopRecording();
    setRecorderKey(prevKey => prevKey + 1); // Force remount AudioRecorder to reset it
    onClose();
    refreshContent(); // Update content on close
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleRecordingStop = (blobUrl, blob) => {
    setIsRecording(false);
    setMediaBlobUrl(blobUrl);
    onRecordingComplete(blobUrl, blob);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStopRecording = () => {
    console.log("Recording stopped from popup");
    setIsRecording(false);
  };

  return (
    <div className="popup-backdrop">
      <div className="popup-content">
        <div className="popup-header">
          <h3>Record Audio</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        <div className="recording-timer">{formatTime(recordingTime)}</div>
        <AudioRecorder
          key={recorderKey}
          onRecordingStart={handleRecordingStart}
          onRecordingStop={handleRecordingStop}
        />
        {mediaBlobUrl && (
          <div className="audio-controls">
            <audio src={mediaBlobUrl} controls />
            <div className="control-buttons">
              <button onClick={() => setMediaBlobUrl(null)}>↺</button>
              <button onClick={handleClose}>✔</button>
              <button onClick={() => document.querySelector('audio').play()}>▶</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
