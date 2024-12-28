import React, { useState } from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';

const AudioRecorder = ({ onRecordingStart, onRecordingStop }) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = (start) => {
    start();
    setIsRecording(true);
    onRecordingStart();
  };

  const handleStopRecording = (stop) => {
    stop();
    setIsRecording(false);
    onRecordingStop()
  };

  return (
    <ReactMediaRecorder
      audio
      onStop={(blobUrl, blob) => {
        onRecordingStop(blobUrl, blob);
        setIsRecording(false);
      }}
      render={({ startRecording, stopRecording, mediaBlobUrl }) => (
        <div>
          {!isRecording && (
            <button onClick={() => handleStartRecording(startRecording)}>
              ⏺
            </button>
          )}
          {isRecording && (
            <button onClick={() => handleStopRecording(stopRecording)}>
              ⏹
            </button>
          )}
        </div>
      )}
    />
  );
};

export default AudioRecorder;
