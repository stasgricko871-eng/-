#!/usr/bin/env bash
echo "===================================================="
echo " Deltarune: Meow Meow Last Chance"
echo " Запуск игры..."
echo "===================================================="

if ! command -v node >/dev/null 2>&1; then
    echo "[ОШИБКА] Node.js не установлен! Установите с https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Устанавливаем зависимости..."
    npm install
fi

if [ ! -f "dist/index.html" ]; then
    echo "Собираем игру..."
    npm run build
fi

echo "Запускаем локальный сервер..."
npx tsx serve_game.ts
