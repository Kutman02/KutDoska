import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// Импортируем расширение Placeholder
import Placeholder from "@tiptap/extension-placeholder"; 

const AdEditor = ({ content, onChange }) => {
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
        class: "prose max-w-none focus:outline-none text-gray-800 min-h-[150px] text-lg", 
      },
    },
  });

  return (
    // Обертка, которая имитирует стиль обычного input
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 focus-within:ring-2 focus-within:ring-teal-400 focus-within:bg-white transition duration-200 cursor-text"
         onClick={() => editor?.commands.focus()}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default AdEditor;