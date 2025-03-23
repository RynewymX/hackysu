from fastapi import FastAPI
import queue
import sounddevice as sd
from pydantic import BaseModel
import vosk
import json
import os
import threading
from deep_translator import GoogleTranslator
from fastapi.middleware.cors import CORSMiddleware
import openai
from pydub import AudioSegment
import simpleaudio as sa
from fastapi import File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from googletrans import Translator, LANGUAGES

app = FastAPI()
translator = Translator()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow only your frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Button Click model for incoming requests
class ButtonClick(BaseModel):
    clicked: bool

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}

# Request model for Translation
class TranslationRequest(BaseModel):
    text: str
    language: str = "es"

@app.post('/upload_json')
async def upload_json(file: UploadFile = File(...)):
    if not file:
        return JSONResponse(content={'message': 'No file part'}, status_code=400)
    
    content = await file.read()
    sentences = content.decode('utf-8')
    print("Received Sentences:", sentences)
    
    return {'message': 'Sentences processed successfully.'}

@app.post('/translate')
async def translate_text(request: TranslationRequest):
    print("Received Request:", request)
    # Proceed with the translation logic...

    if request.language not in LANGUAGES:
        return JSONResponse(content={'translatedText': 'Invalid language code'}, status_code=400)

    translated = await translator.translate(request.text, dest=request.language)
    translated_tts_text = str(translated)

    # Use OpenAI API for Text-to-Speech


    # Return the translated text
    return {"translatedText": translated.text}

class TextToSpeechRequest(BaseModel):
    text: str
    language: str = "en"  # Default language is English

# This endpoint generates the text-to-speech audio
# @app.post("/text_to_speech")
# async def text_to_speech(request: TextToSpeechRequest):
#     text = request.text
#     language = request.language
    
#     # Use OpenAI API to generate audio from text
#     openai.api_key = "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" # Replace with your actual OpenAI API key
    
#     try:
#         # OpenAI text-to-speech API call (this is just an example, adjust accordingly)
#         response = openai.Audio.create(
#             model="text-to-speech-model",  # Specify the correct model here
#             input=text,
#             voice="echo",  # Choose an appropriate voice
#             language=language,
#         )
        
#         # Save the audio to a file
#         with open("output.mp3", "wb") as audio_file:
#             audio_file.write(response['audio'])

#         return {"message": "Audio generated successfully", "audio_file": "output.mp3"}

#     except Exception as e:
#         return JSONResponse(content={'error': str(e)}, status_code=500)

# # Endpoint to retrieve the generated audio file
# @app.get("/output.mp3")
# async def get_audio_file():
#     return FileResponse("output.mp3", media_type="audio/mp3")
