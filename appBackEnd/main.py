from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from googletrans import Translator, LANGUAGES

app = FastAPI()
translator = Translator()

@app.post('/upload_json')
async def upload_json(file: UploadFile = File(...)):
    if not file:
        return JSONResponse(content={'message': 'No file part'}, status_code=400)
    content = await file.read()
    sentences = content.decode('utf-8')
    print("Received Sentences:", sentences)
    return {'message': 'Sentences processed successfully.'}

@app.post('/translate')
async def translate_text(text: str = Form(...), language: str = Form('es')):
    if language not in LANGUAGES:
        return JSONResponse(content={'translatedText': 'Invalid language code'}, status_code=400)
    translated = translator.translate(text, dest=language)
    return {'translatedText': translated.text}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5174)
