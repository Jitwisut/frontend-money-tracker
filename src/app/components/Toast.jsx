"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─── Toast Context ───
const ToastContext = createContext(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

// ─── Toast Provider ───
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (msg, dur) => addToast(msg, "success", dur),
        error: (msg, dur) => addToast(msg, "error", dur),
        info: (msg, dur) => addToast(msg, "info", dur),
        warning: (msg, dur) => addToast(msg, "warning", dur),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container — fixed top-right */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// ─── Icons ───
const ICONS = {
    success: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    ),
    info: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const STYLES = {
    success: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        icon: "text-emerald-500",
        progress: "bg-emerald-400",
    },
    error: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "text-red-500",
        progress: "bg-red-400",
    },
    warning: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: "text-amber-500",
        progress: "bg-amber-400",
    },
    info: {
        bg: "bg-sky-50",
        border: "border-sky-200",
        text: "text-sky-700",
        icon: "text-sky-500",
        progress: "bg-sky-400",
    },
};

// ─── Single Toast Item ───
function ToastItem({ toast, onRemove }) {
    const [exiting, setExiting] = useState(false);
    const style = STYLES[toast.type] || STYLES.info;
    const duration = toast.duration || 3000;

    useEffect(() => {
        const exitTimer = setTimeout(() => setExiting(true), duration - 300);
        const removeTimer = setTimeout(() => onRemove(toast.id), duration);
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, duration, onRemove]);

    return (
        <div
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-slate-200/50 backdrop-blur-xl min-w-[300px] max-w-[420px] ${style.bg} ${style.border} ${exiting ? "animate-toast-out" : "animate-toast-in"}`}
        >
            {/* Icon */}
            <div className={`shrink-0 mt-0.5 ${style.icon}`}>
                {ICONS[toast.type] || ICONS.info}
            </div>

            {/* Message */}
            <p className={`text-sm font-medium flex-1 ${style.text}`}>
                {toast.message}
            </p>

            {/* Close Button */}
            <button
                onClick={() => {
                    setExiting(true);
                    setTimeout(() => onRemove(toast.id), 300);
                }}
                className={`shrink-0 mt-0.5 ${style.icon} hover:opacity-70 transition-opacity`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Progress Bar */}
            <div className={`absolute bottom-0 left-0 h-0.5 rounded-b-xl ${style.progress}`}
                style={{ animation: `toast-progress ${duration}ms linear forwards` }}
            />
        </div>
    );
}
