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
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from googletrans import Translator, LANGUAGES
app = FastAPI()
translator = Translator()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change this for security)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ButtonClick(BaseModel):
    clicked: bool

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}


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
    if request.language not in LANGUAGES:
        return JSONResponse(content={'translatedText': 'Invalid language code'}, status_code=400)

    translated = await translator.translate(request.text, dest=request.language)  # ✅ Await the async method
    openai.api_key = "your_api_key_here"

    response = openai.audio.speech.create(
        model="tts-1-hd",  # Use "tts-1" or "tts-1-hd" for higher quality
        voice="echo",  # Options: alloy, echo, fable, onyx, nova, shimmer
        input=translated
    )

    # Save the output as an MP3 file
    with open("output.mp3", "wb") as f:
        f.write(response.content)
    return {'translatedText': translated.text}
@app.post('/tts')
async def ttsclick(data:ButtonClick):

    mp3 = AudioSegment.from_mp3('output.mp3')


    
