#!/usr/bin/env bash
# Herkes Piste — tek satırlık sunucu kurulumu (Ubuntu / Debian)
# Kullanım:  curl -fsSL https://raw.githubusercontent.com/olcaydunder/herkes-piste/main/kur.sh | bash
# Başka bir TikTok hesabı için:  ... | bash -s -- kullaniciadi
set -euo pipefail

KULLANICI="${1:-herkes.piste}"
DEPO="https://github.com/olcaydunder/herkes-piste.git"
DIZIN="/opt/herkes-piste"
export DEBIAN_FRONTEND=noninteractive

if [ "$(id -u)" -ne 0 ]; then echo "Bu kurulum root olarak çalışmalı (sudo -i)."; exit 1; fi
say() { printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }

say "Paketler hazırlanıyor"
apt-get update -y -qq
apt-get install -y -qq curl git ca-certificates gnupg debian-keyring debian-archive-keyring apt-transport-https >/dev/null

if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 20 ]; then
  say "Node.js 22 kuruluyor"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi

if ! command -v caddy >/dev/null 2>&1; then
  say "Caddy (HTTPS) kuruluyor"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y -qq
  apt-get install -y -qq caddy >/dev/null
fi

# 80/443'ü tutan başka bir web sunucusu varsa durdur (boş sunucu için)
for s in apache2 nginx; do
  if systemctl is-active --quiet "$s" 2>/dev/null; then
    say "$s durduruluyor (80/443 portları Caddy'ye lazım)"
    systemctl disable --now "$s" || true
  fi
done

say "Oyun indiriliyor"
if [ -d "$DIZIN/.git" ]; then
  git -C "$DIZIN" fetch -q origin main
  git -C "$DIZIN" reset -q --hard origin/main
else
  git clone -q "$DEPO" "$DIZIN"
fi
cd "$DIZIN"
npm ci --omit=dev --no-audit --no-fund --loglevel=error

if [ ! -f "$DIZIN/.env" ]; then
  printf 'TIKTOK_KULLANICI=%s\nPORT=3000\n# İsteğe bağlı: https://www.eulerstream.com adresinden alınan anahtar\nEULER_API_KEY=\n' "$KULLANICI" > "$DIZIN/.env"
fi
chmod 600 "$DIZIN/.env"

say "Servis kuruluyor"
cat > /etc/systemd/system/herkes-piste.service <<EOF
[Unit]
Description=Herkes Piste oyun sunucusu
After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=$DIZIN
EnvironmentFile=$DIZIN/.env
ExecStart=/usr/bin/env node server.js
Restart=always
RestartSec=3
DynamicUser=yes
ProtectSystem=strict
ProtectHome=yes
NoNewPrivileges=yes

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/herkes-piste-guncelle.service <<EOF
[Unit]
Description=Herkes Piste GitHub'dan güncelleme

[Service]
Type=oneshot
ExecStart=/bin/bash $DIZIN/guncelle.sh
EOF

cat > /etc/systemd/system/herkes-piste-guncelle.timer <<EOF
[Unit]
Description=Herkes Piste'yi 2 dakikada bir güncelle

[Timer]
OnBootSec=1min
OnUnitActiveSec=2min

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now herkes-piste.service >/dev/null
systemctl restart herkes-piste.service
systemctl enable --now herkes-piste-guncelle.timer >/dev/null

say "HTTPS adresi ayarlanıyor"
IP="$(curl -4 -fsS --max-time 8 https://api.ipify.org || hostname -I | awk '{print $1}')"
ALAN="$(echo "$IP" | tr '.' '-').sslip.io"
cat > /etc/caddy/Caddyfile <<EOF
$ALAN {
	encode gzip
	reverse_proxy 127.0.0.1:3000
}
EOF
systemctl enable caddy >/dev/null 2>&1 || true
systemctl restart caddy

if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null
fi

sleep 3
if curl -fsS --max-time 5 http://127.0.0.1:3000/saglik >/dev/null; then DURUM="çalışıyor"; else DURUM="başlatılıyor"; fi

printf '\n\033[1;32m================================================\033[0m\n'
printf '\033[1;32m  HAZIR! Oyun sunucusu %s\033[0m\n' "$DURUM"
printf '  TikTok hesabı : @%s\n' "$KULLANICI"
printf '  Oyun adresi   : https://%s\n' "$ALAN"
printf '  Deneme modu   : https://%s/?demo\n' "$ALAN"
printf '\033[1;32m================================================\033[0m\n\n'
