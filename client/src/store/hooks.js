// src/store/hooks.js
import { useDispatch, useSelector } from 'react-redux';

// Типизированные хуки для использования в компонентах
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

