#!/bin/sh
echo "===================================================="
echo " Deltarune: Meow Meow Last Chance (Termux Android)"
echo "===================================================="

if ! command -v node >/dev/null 2>&1; then
    echo "[!] Node.js не найден в Termux."
    echo "Установите командой: pkg install nodejs-lts"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей (1-й запуск)..."
    npm install
fi

echo "Запуск сервера игры на телефоне..."
echo "После запуска откройте в браузере: http://localhost:3000"
npm run dev -- --host 0.0.0.0 --port 3000
