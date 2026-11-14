#!/usr/bin/env bash
# Yapay zekâ sunucunun Türkçe sesini (Piper, tr_TR-dfki-medium) kurar.
# kur.sh ilk kurulumda, guncelle.sh ise ses eksikse kendiliğinden çalıştırır.
set -euo pipefail
TTS=/opt/herkes-piste-tts
SES=tr_TR-dfki-medium
URL=https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium

if [ -x "$TTS/venv/bin/python" ] && "$TTS/venv/bin/python" -c "import piper" 2>/dev/null \
   && [ -s "$TTS/$SES.onnx" ] && [ -s "$TTS/$SES.onnx.json" ]; then
  exit 0
fi
mkdir -p "$TTS"

if [ ! -x "$TTS/venv/bin/python" ]; then
  if ! python3 -m venv "$TTS/venv" >/dev/null 2>&1; then
    rm -rf "$TTS/venv"
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y -qq
    apt-get install -y -qq python3 python3-venv >/dev/null
    python3 -m venv "$TTS/venv"
  fi
fi
"$TTS/venv/bin/pip" install -q --disable-pip-version-check "piper-tts==1.8.0"

for f in "$SES.onnx" "$SES.onnx.json"; do
  if [ ! -s "$TTS/$f" ]; then
    curl -fsSL --retry 3 --max-time 600 -o "$TTS/$f.part" "$URL/$f"
    mv "$TTS/$f.part" "$TTS/$f"
  fi
done
chmod -R a+rX "$TTS"
echo "Türkçe ses hazır"
