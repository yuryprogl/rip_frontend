#!/bin/bash
set -e

# Папка проекта (по умолчанию текущая)
PROJECT_DIR="${1:-.}"
# Итоговый файл
OUTPUT_FILE="${2:-project_flattened.txt}"

# Расширения файлов, которые хотим включить
INCLUDE_EXTENSIONS=("js" "jsx" "ts" "tsx" "css" "html" "json" "yaml" "yml" "md" "env" 
"cfg" "ini" "toml" "py")

# Директории, которые исключаем
EXCLUDE_DIRS=("node_modules" ".git" "venv" "env" ".cache" "build" "dist" "__pycache__" 
"migrations" "static" "media" ".idea" ".vscode")

# Очистим старый файл
> "$OUTPUT_FILE"

echo "📂 Сканируем проект: $PROJECT_DIR"
echo "⏳ Формируем файл: $OUTPUT_FILE"

# Функция проверки исключений
should_exclude() {
  local path="$1"
  for dir in "${EXCLUDE_DIRS[@]}"; do
    if [[ "$path" == *"/$dir"* ]]; then
      return 0
    fi
  done
  return 1
}

# Основной цикл
while IFS= read -r -d '' file; do
  should_exclude "$file" && continue

  # Проверка расширений
  match=false
  for ext in "${INCLUDE_EXTENSIONS[@]}"; do
    if [[ "$file" == *.$ext ]]; then
      match=true
      break
    fi
  done
  $match || continue

  # Добавляем путь к файлу как заголовок
  rel_path="${file#$PROJECT_DIR/}"
  echo -e "\n\n### FILE: $rel_path\n" >> "$OUTPUT_FILE"
  echo 
"================================================================================" >> 
"$OUTPUT_FILE"

  # Добавляем содержимое
  cat "$file" >> "$OUTPUT_FILE" 2>/dev/null || echo "⚠️ [Ошибка чтения]" >> 
"$OUTPUT_FILE"

  echo -e 
"\n================================================================================" 
>> "$OUTPUT_FILE"

done < <(find "$PROJECT_DIR" -type f -print0)

# Статистика
FILES_COUNT=$(grep -c "^### FILE:" "$OUTPUT_FILE" || echo 0)
echo -e "\n📊 ИТОГО: $FILES_COUNT файлов собрано в $OUTPUT_FILE"
echo "✅ Готово."