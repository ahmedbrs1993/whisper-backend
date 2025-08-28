import sys
import whisper


audio_file = sys.argv[1]
model_name = sys.argv[2] 
language = sys.argv[3] 

model = whisper.load_model(model_name)
result = model.transcribe(audio_file, language=language)
print(result["text"])