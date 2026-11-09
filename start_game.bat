@echo off
chcp 65001 > nul
echo ====================================================
echo  Deltarune: Meow Meow Last Chance
echo  Запуск игры...
echo ====================================================

REM Проверяем наличие Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не установлен!
    echo Для запуска игры на ПК установите бесплатный Node.js с официального сайта:
    echo https://nodejs.org/
    echo.
    echo После установки снова запустите этот файл.
    pause
    exit /b
)

REM Проверяем наличие node_modules
if not exist "node_modules\" (
    echo Устанавливаем необходимые компоненты (только при первом запуске)...
    call npm install
)

REM Проверяем наличие собранного билда dist
if not exist "dist\index.html" (
    echo Собираем игру...
    call npm run build
)

echo Запускаем игру и открываем браузер...
call npx tsx serve_game.ts

pause
