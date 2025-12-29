// src/components/CreateAd/ImageUploader.tsx
import React from "react";
import { FiImage, FiX, FiUpload } from "react-icons/fi";
import type { ImageUploaderProps } from "../../types/component.types";

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onUpload, onRemove }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="space-y-4">
        {/* Скелетная область для загрузки - показывается только если нет фото */}
        {images.length === 0 && (
            <label
                className="relative flex flex-col items-center justify-center w-full min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] rounded-md border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 hover:border-teal-500 dark:hover:border-teal-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpload(e.target.files)}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-3 sm:gap-4 text-center p-6 sm:p-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                        <FiUpload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-slate-500" />
                    </div>
                    <div>
                        <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-slate-300 mb-1">
                            Нажмите для загрузки фото
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                            или перетащите фото сюда
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                            До 5 фотографий
                        </p>
                    </div>
                </div>
            </label>
        )}

        {/* Галерея превью */}
        {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {images.map((imgUrl: string, index: number) => (
                <div key={index} className="relative border-2 border-dashed border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 rounded-md p-2">
                  <img
                    src={imgUrl}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-32 sm:h-40 object-cover rounded-md"
                  />
                  <button 
                    type="button" 
                    onClick={() => onRemove(index)}
                    className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 text-white p-1.5 rounded-full font-bold text-xs hover:bg-red-600 dark:hover:bg-red-700 transition-colors touch-manipulation active:scale-90"
                  >
                    <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/70 dark:bg-slate-900/80 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{images.length}
                  </div>
                </div>
              ))}
              {/* Скелетное место для добавления еще фото (если меньше 5) */}
              {images.length < 5 && (
                <label
                    className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-md min-h-[128px] sm:min-h-[160px] cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors touch-manipulation active:scale-95"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpload(e.target.files)}
                        className="hidden"
                    />
                    <FiImage className="w-8 h-8 text-gray-400 dark:text-slate-500 mb-2" />
                    <p className="text-xs text-gray-500 dark:text-slate-400 text-center px-2">
                        Добавить фото
                    </p>
                </label>
              )}
            </div>
        )}
    </div>
  );
};

export default ImageUploader;