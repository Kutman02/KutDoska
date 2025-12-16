import React, { useState } from 'react';

/**
 * Основной компонент, представляющий страницу чатов.
 * Теперь с адаптивностью и логикой переключения активного чата.
 */
function Chats() {
  // Исходные данные
  const initialChatList = [
    { id: 1, name: "Иван Иванов", lastMessage: "ОК, завтра встречаемся?", time: "10:30", unread: 2 },
    { id: 2, name: "Рабочая группа", lastMessage: "Презентация готова!", time: "Вчера", unread: 0 },
    { id: 3, name: "Елена", lastMessage: "Спасибо за помощь!", time: "1 дек", unread: 5 },
  ];

  // Данные сообщений (Заглушка, в реальном приложении это был бы объект с ключами по ID чата)
  const allMessages = {
    1: [
      { id: 101, text: "Привет! Как дела?", sender: "other", time: "10:28" },
      { id: 102, text: "Отлично, а у тебя?", sender: "me", time: "10:29" },
      { id: 103, text: "Тоже хорошо. Готов к проекту?", sender: "other", time: "10:30" },
    ],
    2: [
      { id: 201, text: "Презентация у HR-отдела.", sender: "other", time: "11:00" },
      { id: 202, text: "Всё понял.", sender: "me", time: "11:05" },
    ],
    3: [
      { id: 301, text: "Рада была помочь!", sender: "other", time: "09:00" },
    ],
  };

  // 1. Состояние: ID активного чата. По умолчанию - первый чат в списке.
  const [activeChatId, setActiveChatId] = useState(initialChatList[0].id);
  // 2. Состояние: Для мобильной версии - показываем список (true) или чат (false)?
  const [isChatListVisible, setIsChatListVisible] = useState(true); 

  // Вычисляем активный чат и его сообщения
  const activeChat = initialChatList.find(chat => chat.id === activeChatId);
  const messages = allMessages[activeChatId] || [];

  /**
   * Обработчик выбора чата
   * @param {number} id - ID выбранного чата
   */
  const handleChatSelect = (id) => {
    setActiveChatId(id);
    // На мобильных устройствах, при выборе чата, скрываем список и показываем чат
    setIsChatListVisible(false);
  };
  
  // Обработчик кнопки "Назад" (для мобильной версии)
  const handleGoBack = () => {
    setIsChatListVisible(true);
  };

  // --- Рендеринг ---
  return (
    // Общий контейнер
    <div className="flex h-screen w-full max-w-7xl mx-auto shadow-xl border border-gray-200 rounded-lg overflow-hidden">
      
      {/* -------------------- 1. Боковая панель со списком чатов (Sidebar) -------------------- */}
      <aside 
        // На md и выше всегда видно (flex), на меньших экранах, если !isChatListVisible, то скрываем (hidden)
        className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white ${
          isChatListVisible ? 'flex' : 'hidden md:flex'
        }`}
      >
        
        <header className="p-4 border-b border-gray-200">
          <input 
            type="text" 
            placeholder="Поиск по чатам..." 
            className="w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </header>

        <div className="flex-grow overflow-y-auto">
          {initialChatList.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => handleChatSelect(chat.id)} // <--- Обработчик клика
              className={`flex items-center p-3 border-b border-gray-100 cursor-pointer transition duration-150 ease-in-out ${
                chat.id === activeChatId // Проверяем активный ID
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold mr-3">
                {chat.name[0]}
              </div>
              <div className="flex-grow min-w-0">
                <span className="text-sm font-semibold truncate block">{chat.name}</span>
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              <div className="text-right flex flex-col items-end space-y-1">
                <span className="text-xs text-gray-400">{chat.time}</span>
                {chat.unread > 0 && (
                  <span className="text-xs font-bold text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      
      {/* -------------------- 2. Основная область чата (Main Area) -------------------- */}
      <main 
        // На md и выше всегда видно (flex), на меньших экранах, если isChatListVisible, то скрываем (hidden)
        className={`flex-1 flex flex-col bg-gray-100 ${
          isChatListVisible ? 'hidden md:flex' : 'flex'
        }`}
      >
        
        {/* Заголовок чата */}
        <header className="p-4 bg-white border-b border-gray-200 flex items-center flex-shrink-0">
          
          {/* Кнопка Назад (видна только на мобильных) */}
          <button 
            onClick={handleGoBack} 
            className="md:hidden p-2 mr-2 text-gray-500 hover:text-blue-600"
          >
            ←
          </button>

          {activeChat ? (
            <>
              <div className="w-10 h-10 bg-green-500 text-white flex items-center justify-center rounded-full font-bold mr-3">
                {activeChat.name[0]}
              </div>
              <div className="flex-grow">
                <span className="text-base font-semibold block">{activeChat.name}</span>
                <span className="text-xs text-green-600">Онлайн</span>
              </div>
              <div className="flex space-x-3">
                <button className="text-gray-500 hover:text-blue-600 transition">📞</button>
                <button className="text-gray-500 hover:text-blue-600 transition">⚙️</button>
              </div>
            </>
          ) : (
            <span className="text-gray-500 italic">Выберите чат, чтобы начать общение</span>
          )}
        </header>

        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-200">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md relative ${
                  msg.sender === 'me' 
                    ? 'bg-lime-200 rounded-br-sm' 
                    : 'bg-white rounded-tl-sm'
                }`}
              >
                <p className="text-sm text-gray-800">{msg.text}</p>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-500 mr-2">{msg.time}</span>
                  {msg.sender === 'me' && (
                    <span className="text-xs text-blue-500">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Поле ввода сообщения */}
        <footer className="p-4 bg-white border-t border-gray-200 flex items-center flex-shrink-0">
          <button className="p-2 text-gray-500 hover:text-blue-600 transition text-xl">
            📎
          </button>
          <input 
            type="text" 
            placeholder="Напишите сообщение..." 
            className="flex-grow mx-3 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          <button className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition text-lg">
            🚀
          </button>
        </footer>
      </main>
      
    </div>
  );
}

export default Chats;