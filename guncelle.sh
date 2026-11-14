#!/usr/bin/env bash
# GitHub'daki son sürümü çeker; değişiklik varsa kurup servisi yeniden başlatır.
set -euo pipefail
cd /opt/herkes-piste
git fetch -q origin main
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
  git reset -q --hard origin/main
  npm ci --omit=dev --no-audit --no-fund --loglevel=error
  systemctl restart herkes-piste.service
  echo "Güncellendi: $(git rev-parse --short HEAD)"
fi
