import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import toast, { Toaster } from "react-hot-toast";
import { FiSave, FiTag, FiImage, FiX } from "react-icons/fi"; // Новые иконки

// Классы для стилизации кнопок Tiptap
const TiptapButtonClass = (isActive) => 
  `p-2 rounded-md text-sm font-medium transition duration-200 
   ${isActive 
     ? "bg-lime-600 text-white shadow-md hover:bg-lime-700" 
     : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
   }`;

const EditNotes = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [activeTab, setActiveTab] = useState("content"); // Состояние для активной вкладки (content | media)
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Напишите здесь свою заметку...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none p-4", 
      },
    },
  });

  // Fetch existing note
  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch note");

        const data = await res.json();
        setTitle(data.title || "");
        setTags(data.tags?.join(", ") || "");
        setImageUrl(data.imageUrl || "");
        editor?.commands.setContent(data.content || "");
      } catch (err) {
        toast.error("Не удалось загрузить заметку для редактирования");
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (editor && id) fetchNote();
  }, [editor, id]);

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Загрузка изображения не удалась");

      const data = await res.json();
      setImageUrl(data.imageUrl);
      toast.success("Изображение успешно загружено!");
    } catch (err) {
      toast.error("Ошибка загрузки изображения");
      console.error("Image upload error:", err.message);
    } finally {
        setLoading(false);
    }
  };

  // Handle update note
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title.trim() || !editor?.getText().trim()) {
        toast.error("Заголовок и содержание не могут быть пустыми.");
        return;
    }

    const content = editor.getHTML();
    const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8080/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, tags: tagArray, imageUrl }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success("Заметка успешно обновлена!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      toast.error("Ошибка обновления");
      console.error("Update error:", err.message);
    } finally {
        setLoading(false);
    }
  };

  // --- HTML для вкладки "Метаданные/Медиа" ---
  const MetadataTab = (
    <div className="space-y-4 p-4">
        {/* Tags Input */}
        <div className="flex items-center gap-3 border p-3 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
            <FiTag className="w-5 h-5 text-lime-600 dark:text-lime-400" />
            <input
                type="text"
                placeholder="Теги (через запятую)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-transparent dark:text-gray-200 focus:outline-none"
            />
        </div>

        {/* Image Upload */}
        <div className="border border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-4">
            <label 
                htmlFor="image-upload" 
                className={`flex items-center justify-center w-full p-3 rounded-lg font-medium cursor-pointer transition duration-200 
                          ${imageUrl ? 'bg-lime-100 dark:bg-lime-900 text-lime-700 border border-lime-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>
                <FiImage className="w-5 h-5 mr-2" />
                {imageUrl ? "Изображение загружено (Нажмите для смены)" : "Загрузить новое изображение"}
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="hidden"
                />
            </label>

            {/* Image Preview */}
            {imageUrl && (
                <div className="relative mt-4">
                    <img
                        src={imageUrl}
                        alt="Note Cover"
                        className="w-full max-h-64 object-contain rounded-lg"
                    />
                    <button 
                        type="button" 
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs hover:bg-red-700 transition flex items-center justify-center w-6 h-6"
                        title="Удалить изображение"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    </div>
  );

  if (!editor || loading) {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center text-lg text-lime-600 dark:text-lime-400">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {loading ? "Загрузка данных заметки..." : "Инициализация редактора..."}
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100 dark:bg-gray-950">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        
        {/* Заголовок Рабочей Области */}
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Редактирование: <span className="text-lime-600 dark:text-lime-400">{title || "Безымянная заметка"}</span>
            </h2>
        </header>

        <form onSubmit={handleUpdate}>
            
            {/* Поле Заголовка */}
            <div className="p-4 border-b dark:border-gray-700">
                <input
                    type="text"
                    placeholder="Заголовок заметки"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 text-2xl font-bold bg-transparent dark:text-white focus:outline-none"
                    required
                />
            </div>

            {/* Навигация по вкладкам */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => setActiveTab("content")}
                    className={`px-6 py-3 text-sm font-semibold transition duration-200 
                        ${activeTab === "content" 
                            ? "border-b-4 border-lime-500 text-lime-600 dark:text-lime-400" 
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                >
                    Содержание
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("media")}
                    className={`px-6 py-3 text-sm font-semibold transition duration-200 
                        ${activeTab === "media" 
                            ? "border-b-4 border-lime-500 text-lime-600 dark:text-lime-400" 
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                >
                    Метаданные / Медиа
                </button>
            </div>

            {/* Контент вкладок */}
            <div className="p-0">
                {activeTab === "content" && (
                    <div className="space-y-4">
                        {/* Toolbar */}
                        {editor && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 shadow-inner flex gap-2 flex-wrap border-b dark:border-gray-600">
                                {[
                                    ["Жирный", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
                                    ["Курсив", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
                                    ["H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 })],
                                    ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 })],
                                    ["•Список", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
                                    ["</>", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock")],
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

                        {/* Editor Content */}
                        <div className="bg-white dark:bg-gray-800 min-h-[400px]">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                )}

                {activeTab === "media" && MetadataTab}
            </div>

            {/* Кнопка Сохранения (Фиксирована внизу) */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-lime-600 text-white px-6 py-3 font-bold rounded-lg shadow-lg hover:bg-lime-700 transition disabled:bg-gray-400"
                >
                    <FiSave className="w-5 h-5" />
                    {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditNotes;