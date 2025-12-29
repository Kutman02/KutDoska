// src/hooks/useAdActions.ts
import React from "react";
import toast from "react-hot-toast";
import type { Ad } from "../types/ad.types";

interface UseAdActionsOptions {
    setPublicAds: React.Dispatch<React.SetStateAction<Ad[]>>;
}

interface UseAdActionsReturn {
    handleDelete: (adId: string) => Promise<void>;
}

/**
 * Хук для обработки действий над объявлениями, например, удаления.
 * Теперь не показывает подтверждение - это должно быть сделано в компоненте.
 */
const useAdActions = ({ setPublicAds }: UseAdActionsOptions): UseAdActionsReturn => {

    const handleDelete = async (adId: string): Promise<void> => {
        try {
            const token = localStorage.getItem("token"); 
            if (!token) {
                toast.error("Не авторизован.");
                return;
            }

            const response = await fetch(`http://localhost:8080/api/ads/${adId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ошибка удаления");
            }

            toast.success("Объявление успешно удалено!");
            // Обновляем список, используя переданный setPublicAds
            setPublicAds((prevAds: Ad[]) => prevAds.filter((ad: Ad) => ad._id !== adId));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка при удалении.";
            toast.error(errorMessage);
        }
    };

    return { handleDelete };
};

export default useAdActions;