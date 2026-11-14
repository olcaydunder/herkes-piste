#!/usr/bin/env bash
# GitHub'daki son sürümü çeker; değişiklik varsa kurup servisi yeniden başlatır.
# Yapay zekâ sunucunun sesi eksikse onu da kurar.
set -euo pipefail
cd /opt/herkes-piste
git fetch -q origin main
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  git reset -q --hard origin/main
  npm ci --omit=dev --no-audit --no-fund --loglevel=error
  systemctl restart herkes-piste.service
  echo "Güncellendi: $(git rev-parse --short HEAD)"
fi

TTS=/opt/herkes-piste-tts
DENEME=/var/tmp/herkes-piste-ses-deneme
if [ ! -x "$TTS/venv/bin/python" ] || [ ! -s "$TTS/tr_TR-dfki-medium.onnx.json" ]; then
  # başarısız olursa her 2 dakikada değil, yarım saatte bir yeniden dener
  if [ ! -e "$DENEME" ] || [ -n "$(find "$DENEME" -mmin +30 2>/dev/null)" ]; then
    touch "$DENEME"
    bash /opt/herkes-piste/tts-kur.sh || echo "Ses kurulamadı, yarım saat sonra tekrar denenecek"
  fi
fi
