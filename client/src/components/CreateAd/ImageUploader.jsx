// src/components/CreateAd/ImageUploader.jsx
import { FiImage, FiX } from "react-icons/fi";

const ImageUploader = ({ images, onUpload, onRemove }) => {
  return (
    <div className="space-y-4">
        {/* Кнопка загрузки */}
        <label 
            className={`flex items-center justify-center w-full p-3 rounded-xl font-bold cursor-pointer transition duration-200 
                      shadow-lg hover:shadow-xl
                      ${images.length > 0 
                        ? 'bg-teal-100 text-teal-700 border border-teal-500 shadow-teal-200' 
                        : 'bg-teal-500 text-white hover:bg-teal-600 shadow-teal-400/50'}`}>
            <FiImage className="w-5 h-5 mr-2" />
            {images.length > 0 ? `Загружено ${images.length}/5 фото` : "Загрузить фото товара (до 5 шт.)"}
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onUpload(e.target.files)}
                className="hidden"
            />
        </label>

        {/* Галерея превью */}
        {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((imgUrl, index) => (
                <div key={index} className="relative border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-2 shadow-inner">
                  <img
                    src={imgUrl}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg shadow-md"
                  />
                  <button 
                    type="button" 
                    onClick={() => onRemove(index)}
                    className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full font-bold text-xs hover:bg-red-600 transition shadow-lg"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{images.length}
                  </div>
                </div>
              ))}
            </div>
        )}
    </div>
  );
};

export default ImageUploader;