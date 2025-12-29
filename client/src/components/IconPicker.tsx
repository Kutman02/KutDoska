// src/components/IconPicker.tsx
import React, { useState } from "react";
import * as FeatherIcons from "react-icons/fi";
import { FiX, FiSearch } from "react-icons/fi";
import type { ComponentType } from "react";

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  disabled?: boolean;
}

// Популярные иконки Feather Icons для категорий
const popularIcons = [
  "Home", "Car", "Monitor", "Smartphone", "Camera", "Music", "Book", "Heart",
  "ShoppingBag", "Briefcase", "Coffee", "Zap", "Wifi", "MapPin", "Calendar",
  "Clock", "Star", "Gift", "Truck", "Tool", "Scissors", "Pocket", "Box",
  "Package", "ShoppingCart", "Tag", "Award", "Trophy", "DollarSign", "CreditCard",
  "Building", "Home", "Key", "Lock", "Unlock", "Shield", "Bell", "Mail",
  "MessageCircle", "Phone", "Video", "Image", "Film", "Headphones", "Radio",
  "Tv", "Laptop", "Tablet", "Watch", "Gamepad", "Cpu", "HardDrive", "Database",
  "Cloud", "Globe", "Navigation", "Compass", "Map", "Flag", "Umbrella", "Sun",
  "Moon", "Droplet", "Flame", "Wind", "Thermometer", "Activity", "TrendingUp",
  "BarChart", "PieChart", "FileText", "Folder", "Archive", "Save", "Download",
  "Upload", "Share", "Link", "Copy", "Edit", "Trash", "Plus", "Minus", "X",
  "Check", "AlertCircle", "Info", "HelpCircle", "Settings", "User", "Users",
  "UserPlus", "UserMinus", "UserCheck", "UserX", "Eye", "EyeOff", "Search",
  "Filter", "Grid", "List", "Menu", "MoreVertical", "MoreHorizontal"
];

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onIconSelect, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Получаем все доступные иконки из FeatherIcons
  const allIcons = Object.keys(FeatherIcons)
    .filter(name => name.startsWith("Fi") && name !== "FiIcon" && typeof FeatherIcons[name as keyof typeof FeatherIcons] === "function")
    .map(name => name.replace("Fi", ""))
    .sort();

  // Убираем дубликаты и создаем уникальный список
  const uniquePopularIcons = [...new Set(popularIcons)];
  const uniqueAllIcons = [...new Set(allIcons)];
  
  // Фильтруем иконки по поисковому запросу
  const filteredIcons = searchQuery
    ? uniqueAllIcons.filter(icon => 
        icon.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [...uniquePopularIcons, ...uniqueAllIcons.filter(icon => !uniquePopularIcons.includes(icon))];

  const getIconComponent = (iconName: string): ComponentType<{ className?: string }> | null => {
    const IconComponentName = `Fi${iconName}` as keyof typeof FeatherIcons;
    const IconComponent = FeatherIcons[IconComponentName] as ComponentType<{ className?: string }> | undefined;
    return IconComponent || null;
  };

  const handleIconClick = (iconName: string) => {
    onIconSelect(iconName);
    setIsOpen(false);
    setSearchQuery("");
  };

  const SelectedIcon = selectedIcon ? getIconComponent(selectedIcon) : null;

  return (
    <div className="relative">
      {/* Кнопка выбора иконки */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl shadow-inner 
          focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200
          ${disabled 
            ? 'bg-gray-100 dark:bg-slate-700 cursor-not-allowed opacity-50' 
            : 'bg-white dark:bg-slate-800 cursor-pointer hover:border-teal-400'
          }
          flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-3">
          {SelectedIcon ? (
            <>
              <SelectedIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span className="text-gray-700 dark:text-slate-300 font-medium">{selectedIcon}</span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-slate-500">Выберите иконку...</span>
          )}
        </div>
        {!disabled && (
          <span className="text-gray-400 dark:text-slate-500 text-sm">Нажмите для выбора</span>
        )}
      </button>

      {/* Модальное окно выбора иконки */}
      {isOpen && !disabled && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[200] bg-black/20"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery("");
            }}
          />
          
          {/* Модальное окно */}
          <div className="fixed z-[201] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden max-h-[80vh] flex flex-col">
            {/* Заголовок и поиск */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200">Выберите иконку</h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Поиск */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск иконки..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 dark:text-slate-200"
                  autoFocus
                />
              </div>
            </div>

            {/* Сетка иконок */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                {filteredIcons.map((iconName) => {
                  const IconComponent = getIconComponent(iconName);
                  if (!IconComponent) return null;

                  const isSelected = selectedIcon === iconName;

                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleIconClick(iconName)}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-110
                        ${isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                          : 'border-gray-200 dark:border-slate-600 hover:border-teal-300 dark:hover:border-teal-500 text-gray-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
                        }`}
                      title={iconName}
                    >
                      <IconComponent className="w-5 h-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
              
              {filteredIcons.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  Иконки не найдены
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IconPicker;

