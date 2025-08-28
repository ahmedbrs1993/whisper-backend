# Whisper Backend 🎤 → 📝

An Express.js server that uses **OpenAI Whisper (installed locally)** to convert `.mp3` files into text.

---

## 🚀 Requirements
- Node.js (v16+ recommended)
- Python 3.9+
- [ffmpeg](https://ffmpeg.org/download.html) installed locally
- [OpenAI Whisper](https://github.com/openai/whisper) installed via pip

---

## ⚙️ Install Whisper & ffmpeg

### Install ffmpeg
Linux (Ubuntu/Debian):
```bash
sudo apt-get update && sudo apt-get install ffmpeg
```

macOS (with Homebrew):
```bash
brew install ffmpeg
```

### Install Whisper
```bash
pip install -U openai-whisper
```

## 🔧 Setup Backend
Clone the repo and install dependencies:

```bash
git clone https://github.com/ahmedbrs1993/whisper-backend.git
cd whisper-backend
npm install
npm run dev
```

Server will start on http://localhost:5000
