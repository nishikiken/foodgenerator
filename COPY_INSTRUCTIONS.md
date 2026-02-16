# 📋 Инструкция по копированию файлов

## Куда копировать

Целевая директория: `C:\Users\Nishiki\Documents\GitHub\foodgenerator`

## Команды для копирования

Открой PowerShell или CMD в текущей директории и выполни:

```powershell
# Создать целевую директорию (если не существует)
mkdir C:\Users\Nishiki\Documents\GitHub\foodgenerator

# Скопировать все файлы
copy foodgenerator\* C:\Users\Nishiki\Documents\GitHub\foodgenerator\

# Скопировать шрифт (если нужен)
copy fortnitebattlefest.ttf C:\Users\Nishiki\Documents\GitHub\foodgenerator\
```

Или используй проводник Windows:
1. Открой папку `foodgenerator` в текущей директории
2. Выдели все файлы (Ctrl+A)
3. Скопируй (Ctrl+C)
4. Перейди в `C:\Users\Nishiki\Documents\GitHub\foodgenerator`
5. Вставь (Ctrl+V)

## Файлы для копирования

- ✅ `index.html` - основная страница
- ✅ `style.css` - стили (VFX Studio theme)
- ✅ `app.js` - логика приложения
- ✅ `README.md` - документация
- ⚠️ `fortnitebattlefest.ttf` - шрифт (опционально, уже есть в родительской папке)

## После копирования

1. Открой `index.html` в браузере для проверки
2. Инициализируй Git репозиторий:
   ```bash
   cd C:\Users\Nishiki\Documents\GitHub\foodgenerator
   git init
   git add .
   git commit -m "Initial commit: Food Generator bot"
   ```

3. Создай репозиторий на GitHub и запуш:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/foodgenerator.git
   git branch -M main
   git push -u origin main
   ```

## Готово! 🎉

Теперь можешь интегрировать приложение в Telegram бота.
