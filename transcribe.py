import sys
import whisper

audio_file = sys.argv[1]
model = whisper.load_model("small")  # tiny or small for lighter footprint
result = model.transcribe(audio_file, language="en")
print(result["text"])