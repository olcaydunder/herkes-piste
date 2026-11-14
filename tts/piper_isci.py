#!/usr/bin/env python3
"""Herkes Piste ses işçisi.

Türkçe Piper sesini bir kez yükler, sonra standart girişten gelen her JSON satırını
({"id": 1, "metin": "...", "cikis": "/yol/dosya.wav"}) WAV dosyasına çevirir ve
sonucu standart çıkışa tek satır JSON olarak yazar.
"""
import json
import os
import sys
import wave

from piper import PiperVoice, SynthesisConfig


def cevap(veri):
    sys.stdout.write(json.dumps(veri, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def main():
    model = sys.argv[1]
    ses = PiperVoice.load(model)
    ayar = SynthesisConfig(length_scale=float(os.environ.get("PIPER_HIZ", "0.9")))
    cevap({"hazir": True})
    for satir in sys.stdin:
        istek = {}
        try:
            istek = json.loads(satir)
            hedef = istek["cikis"]
            gecici = hedef + ".yaziliyor"
            with wave.open(gecici, "wb") as dosya:
                ses.synthesize_wav(str(istek["metin"]), dosya, syn_config=ayar)
            os.replace(gecici, hedef)
            cevap({"id": istek.get("id"), "ok": True})
        except Exception as hata:  # tek bir cümle bozuksa işçi çalışmaya devam etsin
            cevap({"id": istek.get("id") if isinstance(istek, dict) else None, "ok": False, "hata": str(hata)[:200]})


if __name__ == "__main__":
    main()
