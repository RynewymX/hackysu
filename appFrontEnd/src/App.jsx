import { useState, useRef } from "react";
import axios from "axios";

import "./App.css"; // Import styles

export default function VoiceInput() {
  const [responseText, setResponseText] = useState(""); // Store backend response
  const [isListening, setIsListening] = useState(false); // Track recording status
  const [translatedText, setTranslatedText] = useState(""); // Store translated text
  const [language, setLanguage] = useState("es"); // Default language: Spanish
  const [cameraOn, setCameraOn] = useState(false); // Track camera status
  const recognitionRef = useRef(null); // Persistent speech recognition object
  const videoRef = useRef(null); // Video reference
  let sentences = []; // Array to accumulate sentences

  // Function to start speech recognition
  const handleStartListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true; // Keep listening until manually stopped
    recognition.interimResults = false; // Only process final results
    recognition.lang = "en-US"; // Set language (changeable)

    setIsListening(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log("Full Transcription:", transcript);

      // Split text into sentences
      const sentenceList = transcript.match(/[^.!?]+[.!?]+/g) || [transcript];
      sentences = [...sentences, ...sentenceList]; // Add sentences to the array

      console.log("Accumulated Sentences:", sentences);
      setResponseText(sentences.join(" "));
      handleTranslate(sentences.join(" "));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  // Function to stop speech recognition
  const handleStopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Function to translate text
  const handleTranslate = async (text) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/translate", { text, language });
      setTranslatedText(response.data.translatedText);
    } catch (error) {
      console.error("Error translating text:", error);
      setTranslatedText("Error translating text.");
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    if (cameraOn) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setCameraOn(false);
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" } // Invert the webcam
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        alert("Webcam not supported in this browser.");
      }
      setCameraOn(true);
    }
  };

  return (
    <div id="voiceInputContainer">
      <label htmlFor="voiceInputBtn">STT button 👇:</label>
      <button id="voiceInputBtn" onClick={handleStartListening} disabled={isListening}>
        {isListening ? "Listening..." : "Start Voice Input"}
      </button>

      <button id="stopVoiceInputBtn" onClick={handleStopListening} disabled={!isListening}>
        End Recording
      </button>

      <div id="response-container" style={{ display: 'flex', gap: '10px' }}>
        {/* Original Text Box */}
        <div id="response-box" style={{ flex: 1, border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          <h3>Original Text</h3>
          <p>{responseText || "Input appears here"}</p>
        </div>

        {/* Translated Text Box */}
        <div id="response-box" style={{ flex: 1, border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3>Translated Text</h3>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
            </select>
          </div>
          <p>{translatedText || "Translation appears here"}</p>
        </div>
      </div>

      <button id="toggleCamera" onClick={toggleCamera} style={{ marginTop: '10px' }}>
        {cameraOn ? "Turn Off Camera" : "ASL Translator"}
      </button>

      <div style={{ display: cameraOn ? 'flex' : 'none', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          {/* Webcam Box */}
          <div style={{ flex: 1, maxWidth: '100%' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '250px', height: '250px', border: '1px solid black', borderRadius: '5px', transform: 'scaleX(-1)' }}></video>
          </div>
          {/* ASL Translated Text Box */}
          <div id="asl-translated-text" style={{ flex: 1, width: '200px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', height: '200px' }}>
            <h3>ASL Translation</h3>
            <p>ASL translation appears here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
