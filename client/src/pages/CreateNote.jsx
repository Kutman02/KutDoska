import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FiImage, FiTag, FiLock, FiUnlock, FiSend } from "react-icons/fi"; // Новые иконки

// Классы для стилизации кнопок Tiptap
const TiptapButtonClass = (isActive) => 
  `p-2 rounded-lg text-sm font-medium transition duration-200 
   ${isActive 
     ? "bg-purple-600 text-white shadow-md hover:bg-purple-700" 
     : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
   }`;

const CreateNote = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState(""); 
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false); 

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Напишите здесь свою заметку...</p>",
    editorProps: {
      attributes: {
        // Добавляем класс для стилизации содержимого редактора
        class: "prose dark:prose-invert max-w-none focus:outline-none p-4", 
      },
    },
  });

  const handleImageUpload = async (selectedFile) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Имитация загрузки
      setLoading(true); 
      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Не удалось загрузить изображение");

      const data = await res.json();
      setImageUrl(data.imageUrl); 
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = editor?.getText();

    if (!title.trim() || !content.trim()) {
      alert("Пожалуйста, заполните заголовок и содержание.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Пользователь не аутентифицирован");
        return;
      }

      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await fetch(
        "http://localhost:8080/api/notes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            content,
            imageUrl,
            tags: tagArray,
            isPublic, 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Не удалось создать заметку.");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Ошибка при создании заметок:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 💡 Измененный фон
    <div className="min-h-screen p-8 bg-purple-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 border-b-2 border-purple-400 pb-2">
          Новая Идея / Заметка
        </h2>

        {/* Форма обернута в карточку */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
          
          {/* 1. Заголовок */}
          <div className="relative">
            <input
              type="text"
              placeholder="Заголовок заметки (обязательно)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 text-lg border-b-2 border-gray-300 dark:border-gray-700 focus:border-purple-500 bg-transparent dark:text-white focus:outline-none transition duration-200 font-semibold"
            />
          </div>

          {/* 2. Поле Тегов */}
          <div className="flex items-center gap-3 border p-3 rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <FiTag className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <input
              type="text"
              placeholder="Теги (разделяйте запятыми: работа, идеи, личное)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-transparent dark:text-gray-200 focus:outline-none"
            />
          </div>

          {/* 3. Tiptap Toolbar */}
          {editor && (
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex gap-3 flex-wrap shadow-inner">
              {[
                ["Жирный", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
                ["Курсив", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
                ["H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 })],
                ["•Список", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
                ["Нумеров.", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList")],
                ["Код </>", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock")],
              ].map(([label, handler, isActive]) => (
                <button
                  key={label}
                  type="button"
                  onClick={handler}
                  className={TiptapButtonClass(isActive)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* 4. Редактор */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl min-h-[300px] shadow-inner">
            <EditorContent editor={editor} />
          </div>

          {/* 5. Изображение и Настройки Публичности (Один ряд) */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
            
            {/* Флажок для публичности */}
            <div className={`flex items-center space-x-3 p-3 rounded-lg w-full sm:w-1/2 cursor-pointer 
                            transition duration-200 ${isPublic 
                              ? 'bg-pink-100 dark:bg-pink-900 border border-pink-500' 
                              : 'bg-gray-100 dark:bg-gray-700 border border-transparent hover:border-purple-300'}`}
                 onClick={() => setIsPublic(!isPublic)}>
              
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="hidden" 
              />
              {isPublic ? (
                  <FiUnlock className="w-5 h-5 text-pink-600" />
              ) : (
                  <FiLock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
              <label htmlFor="isPublic" className="text-gray-800 dark:text-gray-200 font-medium select-none">
                {isPublic ? "Публичная (Видно всем)" : "Частная (Только для вас)"}
              </label>
            </div>
            
            {/* Загрузка Изображения */}
            <label 
                htmlFor="image-upload" 
                className={`flex items-center justify-center w-full sm:w-1/2 p-3 rounded-lg font-medium cursor-pointer transition duration-200 
                          ${imageUrl ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 border border-purple-500' : 'bg-purple-500 text-white hover:bg-purple-600'}`}>
                <FiImage className="w-5 h-5 mr-2" />
                {imageUrl ? "Изображение загружено" : "Загрузить обложку"}
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        handleImageUpload(file);
                    }}
                    className="hidden"
                />
            </label>
          </div>
          {/* Конец ряда */}

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-2">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full max-h-64 object-contain rounded-lg"
              />
              <button 
                type="button" 
                onClick={() => setImageUrl("")}
                className="absolute top-4 right-4 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700 transition"
              >
                  X
              </button>
            </div>
          )}


          {/* Кнопка Отправки */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3 text-lg font-bold rounded-xl shadow-lg hover:bg-pink-700 transition duration-300 transform hover:-translate-y-0.5"
          >
            {loading ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Сохранение...
                </>
            ) : (
                <>
                    <FiSend className="w-5 h-5" />
                    Создать и Опубликовать
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateNote;