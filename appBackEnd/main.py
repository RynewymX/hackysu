from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from googletrans import Translator, LANGUAGES

app = FastAPI()
translator = Translator()

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    return {'translatedText': translated.text}