import { useState, useRef } from "react";
import axios from "axios";
import "./App.css"; // Assuming you have some styles

export default function VoiceInput() {
  const [responseText, setResponseText] = useState(""); // State to store backend response
  const [isListening, setIsListening] = useState(false); // Track recording status
  const [extraInfo, setExtraInfo] = useState("");
  const [language, setLanguage] = useState("es"); // Default language: Spanish
  const recognitionRef = useRef(null); // Persistent speech recognition object
  let sentences = []; // Array to accumulate sentences
  const [tts, handleTextToSpeech] = useState('')
  // const [languageData, setLanguageData] = useState(""); // Stores translated language data

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


  
  
  const handleTranslate = async (text) => {
     try {
      const response = await axios.post("http://127.0.0.1:8000/translate", { text, language });
      setTranslatedText(response.data.translatedText);
     } catch (error) {
       console.error("Error translating text:", error);
      setTranslatedText("Error translating text.");
    }
  };

  return (
    <div id="mainFunctionBox">
    <div id="voiceInputContainer">
      <label htmlFor="voiceInputBtn">Click below:</label>
      <button id="voiceInputBtn" onClick={handleStartListening}>Voice Input</button>
      <button id="stopVoiceInputBtn" onClick={handleStopListening} disabled={!isListening}>
        End Recording
      </button>
      <button id='voiceoutputbtn' onClick={handleTextToSpeech} >Click for Text to Speech </button>
      {/* <audio controls>
      <source src="http://127.0.0.1:8000/output.mp3" type="audio/mp3" />
      Your browser does not support the audio element.
      </audio> */}
      {/* Display response in a box */}
      <div id="pre-translated">
        <p>{responseText || "Waiting for response..."}</p>
      </div>
      <div id='post-translate'>
        <p>{extraInfo || 'waiting for translation'}</p>
      </div>
    </div>
    <label htmlFor="languageDropdown">Select Language:</label>
      <select id="languageDropdown" value={language} onChange={(e) => setLanguage(e.target.data)}>
        <option id="selector">-- Select a language --</option>
        <option id='Spanish'>Spanish</option>
        <option id='French'>French</option>
        <option id='Russian'>Russian</option>
        <option id='Japanese'>Japanese</option>
        <option id='Chinese'>Chinese (Simplified)</option>
        <option id='Italian'>Italian</option>
        <option id='german'>German</option>


      </select>

    </div>
  );
}
