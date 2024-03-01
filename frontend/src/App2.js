import { useReactMediaRecorder } from "react-media-recorder-2";
import React, { useState, useRef, useEffect } from "react";
const App= () => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ video: false });

  return (
    <div>
      <p>{status}</p>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <audio src={mediaBlobUrl} controls autoPlay loop />
    </div>
  );
};

export default App;