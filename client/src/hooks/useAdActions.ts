// src/hooks/useAdActions.js
import toast from "react-hot-toast";

/**
 * Хук для обработки действий над объявлениями, например, удаления.
 * @param {object} options
 * @param {function} options.setPublicAds - Функция для обновления локального списка объявлений.
 */
const useAdActions = ({ setPublicAds }) => {

    const handleDelete = async (adId) => {
        if (!window.confirm("Вы уверены, что хотите удалить это объявление?")) return;
        try {
            const token = localStorage.getItem("token"); 
            if (!token) return toast.error("Не авторизован.");

            const response = await fetch(`http://localhost:8080/api/ads/${adId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Ошибка удаления");

            toast.success("Объявление успешно удалено!");
            // Обновляем список, используя переданный setPublicAds
            setPublicAds(prevAds => prevAds.filter(ad => ad._id !== adId));
        } catch (error) {
            toast.error(error.message || "Неизвестная ошибка при удалении.");
        }
    };

    return { handleDelete };
};

export default useAdActions;