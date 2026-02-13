"use client";

import { ToastProvider } from "./Toast";

export default function ClientProviders({ children }) {
    return <ToastProvider>{children}</ToastProvider>;
}
