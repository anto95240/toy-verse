"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faXmark,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    const closeTimer = setTimeout(() => handleClose(), 5000);
    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [handleClose]);

  const styles = {
    success: "bg-white border-green-500 text-slate-800",
    error: "bg-white border-red-500 text-slate-800",
    info: "bg-white border-blue-500 text-slate-800",
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
  };

  const icons = {
    success: faCheckCircle,
    error: faExclamationCircle,
    info: faInfoCircle,
  };

  return (
    <div
      className={`
        pointer-events-auto 
        relative flex items-start gap-3 p-4 rounded-lg shadow-xl border-l-4 
        transition-all duration-500 transform ease-in-out w-80
        ${styles[type]}
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}
      `}
    >
      <div className={`mt-0.5 ${iconColors[type]}`}>
        <FontAwesomeIcon icon={icons[type]} size="lg" />
      </div>
      <div className="flex-1 pr-4">
        <p className="font-semibold text-sm leading-snug">{message}</p>
      </div>
      <button
        onClick={handleClose}
        aria-label="ferme la popup"
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}
