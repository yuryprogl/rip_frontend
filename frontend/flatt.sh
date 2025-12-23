#!/bin/bash
set -e

# Папка проекта (по умолчанию текущая)
PROJECT_DIR="${1:-.}"
# Итоговый файл
OUTPUT_FILE="${2:-project_flattened.txt}"

# Проверка директории
if [[ ! -d "$PROJECT_DIR" ]]; then
    echo "❌ Ошибка: директория '$PROJECT_DIR' не существует" >&2
    exit 1
fi

# Расширения файлов, которые хотим включить
INCLUDE_EXTENSIONS=("js" "jsx" "ts" "tsx" "css" "html" "json" "yaml" "yml" "md" "env" 
"cfg" "ini" "toml" "py")

# Директории, которые исключаем
EXCLUDE_DIRS=("node_modules" ".git" "venv" "env" ".cache" "build" "dist" "__pycache__" 
"migrations" "static" "media" ".idea" ".vscode")

# Создаём временный файл
TEMP_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE"' EXIT

echo "📂 Сканируем проект: $PROJECT_DIR"
echo "⏳ Формируем файл: $OUTPUT_FILE"

# Счётчики
TOTAL_FILES=0
PROCESSED_FILES=0

# Собираем аргументы исключения для find
FIND_EXCLUDE_ARGS=()
for dir in "${EXCLUDE_DIRS[@]}"; do
    FIND_EXCLUDE_ARGS+=(-name "$dir" -prune -o)
done

# Основной цикл
while IFS= read -r -d '' file; do
    # Проверка расширений
    match=false
    for ext in "${INCLUDE_EXTENSIONS[@]}"; do
        if [[ "$file" == *.$ext ]]; then
            match=true
            break
        fi
    done
    $match || continue

    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    # Добавляем путь к файлу как заголовок
    rel_path="${file#$PROJECT_DIR/}"
    echo -e "\n\n### FILE: $rel_path\n" >> "$TEMP_FILE"
    echo "================================================================================" >> "$TEMP_FILE"

    # Добавляем содержимое с проверкой
    if [[ -r "$file" ]]; then
        if file "$file" 2>/dev/null | grep -q "text"; then
            cat "$file" >> "$TEMP_FILE" 2>/dev/null || echo "⚠️ [Ошибка чтения]" >> "$TEMP_FILE"
        else
            echo "[Бинарный файл, содержимое пропущено]" >> "$TEMP_FILE"
        fi
    else
        echo "⚠️ [Нет прав на чтение]" >> "$TEMP_FILE"
    fi

    echo -e "\n================================================================================" >> "$TEMP_FILE"
    PROCESSED_FILES=$((PROCESSED_FILES + 1))
    
done < <(find "$PROJECT_DIR" "${FIND_EXCLUDE_ARGS[@]}" -type f -print0)

# Перемещаем временный файл в итоговый
mv "$TEMP_FILE" "$OUTPUT_FILE"

# Статистика
echo -e "\n📊 ИТОГО:"
echo "  • Всего проверено файлов: $TOTAL_FILES"
echo "  • Обработано файлов: $PROCESSED_FILES"
echo "  • Результат сохранён в: $OUTPUT_FILE"
echo "  • Размер файла: $(du -h "$OUTPUT_FILE" 2>/dev/null | cut -f1 || echo 'неизвестно')"
echo "✅ Готово."