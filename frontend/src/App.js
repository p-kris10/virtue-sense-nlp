import React, { useState, useRef, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder-2";
import "./App.css";

const App = () => {
  const [appState, setAppState] = useState("idle");
  const synthRef = useRef(window.speechSynthesis);
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ video: false });
  const [count,setCount] = useState(0);
  const [question, setQuestion] = useState(null)
  const [terminate ,setTerminate] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);

  const handleStop = () => {
    window.location.reload(); 
  };


  useEffect(() => {
    if(question !== null && terminate === false)
    {
      setShowSpinner(false);
      speak(question.question);
    
    }
    else{
      fetchQuestionFromBackend();
    }
    console.log('Component mounted');

  }, []);

  const fetchQuestionFromBackend = async () => {
    try {
      const response = await fetch('/get_question', {
        method: 'GET',
      });
      const data = await response.json();
      
      setQuestion({ id: data.id, question: data.question });
    } catch (error) {
      console.error('Error fetching question from backend:', error);
    }
  };

  useEffect(() => {
    if(question !== null && terminate === false)
    {
      setShowSpinner(false);
      speak(question.question);
    
    }
    console.log('Component mounted');

  }, [question]);

  const toggleRecording = () => {
    try {
      if (appState === "idle") {
        console.log("Recording...");
        Record();
        setAppState("listening");
      } else if (appState === "listening") {
      
        RecordStop();
        
      }
    } catch (error) {
      console.error("Speech recognition error:", error);
    }
  };

  const Record = async () => {
    startRecording();
  };

  const RecordStop = () => {
    stopRecording();
    console.log("stopped")
    setAppState("idle");
  };


  const sendAudioToBackend = async (blobUrl) => {
    try {
      const formData = new FormData();
      formData.append('audio_data', await fetch(blobUrl).then(response => response.blob()), 'audio.wav');
      formData.append('count', count);
      formData.append('question', question.question);
      formData.append('qId', question.id);
      const response = await fetch('/transcribe_audio', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Response from backend:', data);
      if(data.message === "invalid")
      {
        if(count !== 3)
        {
          speak("Sorry, I didn't get that. Please answer only yes or no");
          setCount(count+1);
        }
        else
        {
          speak("Sorry, Your response wasn't valid, terminating the conversation.");
          setTerminate(true);
        }
        
      }
      else
      {
        speak("Your response has been recorded. Thank you for yout time.")
      }
    } catch (error) {
      console.error('Error sending audio to backend:', error);
    }
  };

  useEffect(() => {
    if (mediaBlobUrl) {
      sendAudioToBackend(mediaBlobUrl);
    }
    
  }, [mediaBlobUrl]);


  const speak = (text) => {
    if (synthRef.current && text) {
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices[0]; 
      }

      utterance.onstart = () => {
        console.log("TTS ");
        setShowSpinner(false);
      };

      utterance.onend = () => {
        setAppState("idle");
      };
      synthRef.current.speak(utterance);
    }
  };

  

  return (

    <>
    {terminate ? (
      <div className="terminated-screen">
        <h1>Conversation Terminated</h1>
        <p>Your conversation has been terminated.</p>
      </div>
    ) : (
      <div className="container">
      <div class="app-header">
          <h1>Virtual Assistant</h1>
          <p class="app-subtext">
            {question && (
              <div>{question.question}</div>
            )}
          </p>
          <p class="app-subtext">
            Tap the blue button to start recording your response.
          </p>
        </div>
      <div className={`app-state-indicator ${appState}`}>
        <div className="listening-indicator">
          {appState !== "idle" && (
            <>
              <span></span>
              <span></span>
              <span></span>
            </>
          )}
        </div>
        {appState === "listening" && (
          <div className="listening-bubble">You can speak now...</div>
        )}
        <button
  
          className={`record-btn ${appState}`}
          onClick={toggleRecording}
        
        >
    
          {showSpinner && <div className="spinner"></div>}
       
        </button>
        <button className="stop-btn" onClick={handleStop}>
          Reset
        </button>
      </div>
    </div>
    )}
  </>
   
  );
};

export default App;
