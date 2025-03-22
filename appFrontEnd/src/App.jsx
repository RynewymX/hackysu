import { useState, useRef } from "react";
import axios from "axios";

import "./App.css"; // Import styles



export default function VoiceInput() {
  const [responseText, setResponseText] = useState(""); // Store backend response
  const [isListening, setIsListening] = useState(false); // Track recording status
  const [translatedText, setTranslatedText] = useState(""); // Store translated text
  const [language, setLanguage] = useState("es"); // Default language: Spanish
  const recognitionRef = useRef(null); // Persistent speech recognition object
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

  // Function to stop speech recognition and send data as JSON file
  const handleStopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Send sentences as a JSON file
    // try {
      const jsonBlob = new Blob([JSON.stringify(sentences)], { type: "application/json" });
      const formData = new FormData();
      formData.append("file", jsonBlob, "sentences.json");

      // Send the JSON file to the backend
      const response = await axios.post("http://127.0.0.1:8000/upload_json", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Backend Response:", response.data);
      setResponseText(response.data.message || "Sentences processed successfully.");
    // } catch (error) {
    //   console.error("Error sending JSON file:", error);
    //   setResponseText("Error sending JSON file.");
    // }
  };

  // Function to translate text
  const handleTranslate = async (text) => {
    // try {
      const response = await axios.post("http://127.0.0.1:8000/translate", { text, language });
      setTranslatedText(response.data.translatedText);
    // } catch (error) {
    //   console.error("Error translating text:", error);
    //   setTranslatedText("Error translating text.");
    // }
  };
  //start of asl scripts

  

  //end of asl scripts

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
      </div>
  );
}
