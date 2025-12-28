import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// Импортируем расширение Placeholder
import Placeholder from "@tiptap/extension-placeholder"; 

interface AdEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const AdEditor: React.FC<AdEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
        StarterKit,
        // Добавляем расширение Placeholder
        Placeholder.configure({
            // Текст, который будет отображаться
            placeholder: 'Введите подробное описание товара, его состояние и характеристики...', 
            // Класс для стилизации (делаем его бледным/прозрачным)
            emptyEditorClass: 'is-editor-empty', 
        }),
    ],
    // Начинаем с пустого контента
    content: content, 
    onUpdate: ({ editor }) => {
      // Сохраняем HTML 
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // Стили самого поля ввода текста
        class: "prose dark:prose-invert max-w-none focus:outline-none text-gray-800 dark:text-slate-200 min-h-[150px] text-lg prose-headings:text-gray-900 dark:prose-headings:text-slate-100 prose-p:text-gray-800 dark:prose-p:text-slate-200", 
      },
    },
  });

  return (
    // Обертка, которая имитирует стиль обычного input
    <div className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md p-4 focus-within:ring-2 focus-within:ring-teal-400 dark:focus-within:ring-teal-500 focus-within:bg-white dark:focus-within:bg-slate-600 transition duration-200 cursor-text"
         onClick={() => editor?.commands.focus()}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default AdEditor;