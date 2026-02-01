import React, { useState, useRef, useEffect } from 'react';
import './VideoRecorder.css';

function VideoRecorder({ onComplete, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Check permissions on mount - this will detect if permissions are already granted
  useEffect(() => {
    checkAndRequestPermission();
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopCamera();
    };
  }, []);

  // Set video stream when available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const checkAndRequestPermission = async () => {
    setIsRequesting(true);
    try {
      // Try to get media stream - this will work if permissions are already granted
      const userStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Success! Store the stream so it persists
      setStream(userStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
      }
      
      setHasPermission(true);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setHasPermission(false);
    } finally {
      setIsRequesting(false);
    }
  };

  const requestCameraPermission = async () => {
    await checkAndRequestPermission();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm',
      'video/mp4'
    ];
    
    for (let type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'video/webm'; // fallback
  };

  const startRecording = async () => {
    try {
      // Use existing stream if available, otherwise get a new one
      let recordingStream = stream;
      
      if (!recordingStream) {
        recordingStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(recordingStream);
        if (videoRef.current) {
          videoRef.current.srcObject = recordingStream;
        }
      }

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(recordingStream, {
        mimeType: mimeType
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        // Don't stop camera, keep it running for retake
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setHasPermission(false);
      alert('Failed to start recording. Please check your camera and microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const handleSubmit = () => {
    if (recordedBlob) {
      // Ensure the blob has the correct extension for Whisper API
      // Whisper accepts: mp3, mp4, mpeg, mpga, m4a, wav, webm
      const fileName = recordedBlob.type.includes('webm') ? 'recording.webm' : 'recording.mp4';
      onComplete(recordedBlob, fileName);
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    // Stream should still be active, no need to request again
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show permission request if not granted
  if (hasPermission === null || hasPermission === false) {
    return (
      <div className="video-recorder">
        <div className="permission-request">
          <div className="permission-icon">🎥</div>
          <h3>Camera & Microphone Access Required</h3>
          <p>We need access to your camera and microphone to record your speech for analysis.</p>
          
          {hasPermission === false && (
            <div className="permission-status denied">
              <p>⚠️ Camera and microphone access is currently blocked</p>
              <p className="hint-text">If you just enabled permissions in browser settings, click the button below to check again.</p>
            </div>
          )}

          <div className="permission-buttons">
            <button 
              className="btn btn-primary btn-permission"
              onClick={requestCameraPermission}
              disabled={isRequesting || disabled}
            >
              {isRequesting ? (
                <>
                  <span className="spinner-small"></span>
                  Checking Permissions...
                </>
              ) : (
                <>
                  <span className="icon">📹</span>
                  Allow Camera & Microphone
                </>
              )}
            </button>
          </div>

          {hasPermission === false && (
            <div className="permission-instructions">
              <p className="instructions-title">If permissions are still not working:</p>
              <ol className="instructions-list">
                <li>Make sure you've enabled camera and microphone in your browser settings</li>
                <li>Refresh this page after changing settings</li>
                <li>Or click the button above to try again</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="video-recorder">
      <div className="video-container">
        {!recordedBlob ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="video-preview"
          />
        ) : (
          <video
            src={URL.createObjectURL(recordedBlob)}
            controls
            className="video-preview"
          />
        )}
        
        {isRecording && (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            <span>Recording: {formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      <div className="controls">
        {!isRecording && !recordedBlob && (
          <button 
            className="btn btn-record"
            onClick={startRecording}
            disabled={disabled}
          >
            Start Recording
          </button>
        )}

        {isRecording && (
          <button 
            className="btn btn-stop"
            onClick={stopRecording}
          >
            Stop Recording
          </button>
        )}

        {recordedBlob && !isRecording && (
          <>
            <button 
              className="btn btn-secondary"
              onClick={handleRetake}
              disabled={disabled}
            >
              Retake
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={disabled}
            >
              Submit & Analyze
            </button>
          </>
        )}
      </div>

      {recordedBlob && (
        <div className="recording-info">
          <p>Recording duration: {formatTime(recordingTime)}</p>
          <p className="hint">Minimum 2 minutes recommended for best analysis</p>
        </div>
      )}
    </div>
  );
}

export default VideoRecorder;
