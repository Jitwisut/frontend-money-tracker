"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../lib/api";
import { useToast } from "../components/Toast";

export default function LoginPage() {
    const router = useRouter();
    const toast = useToast();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (name, value) => {
        switch (name) {
            case "username":
                if (!value.trim()) return "กรุณากรอกชื่อผู้ใช้";
                if (value.length < 3) return "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
                return "";
            case "password":
                if (!value) return "กรุณากรอกรหัสผ่าน";
                if (value.length < 6) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
                return "";
            default:
                return "";
        }
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const err = validateField(field, form[field]);
        setFieldErrors((prev) => ({ ...prev, [field]: err }));
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (touched[field]) {
            const err = validateField(field, value);
            setFieldErrors((prev) => ({ ...prev, [field]: err }));
        }
    };

    const validateAll = () => {
        const errors = {};
        ["username", "password"].forEach((field) => {
            const err = validateField(field, form[field]);
            if (err) errors[field] = err;
        });
        setFieldErrors(errors);
        setTouched({ username: true, password: true });
        return Object.keys(errors).length === 0;
    };

    const getFieldClass = (field) => {
        const base = "w-full px-4 py-3 rounded-xl bg-sky-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all";
        if (touched[field] && fieldErrors[field]) {
            return `${base} border-2 border-red-300 focus:ring-red-400/50 focus:border-red-400/50`;
        }
        return `${base} border border-sky-200 focus:ring-sky-400/50 focus:border-sky-400/50`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setError("");
        setLoading(true);
        try {
            await login(form.username, form.password);
            toast.success("เข้าสู่ระบบสำเร็จ! 🎉");
            router.push("/dashboard");
        } catch (err) {
            const msg = err.message || "เข้าสู่ระบบไม่สำเร็จ";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f4fd] via-[#f0f7ff] to-white px-4">
            <div className="w-full max-w-md animate-fade-in">
                {/* Logo / Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 mb-4 shadow-lg shadow-sky-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Expense Tracker</h1>
                    <p className="text-slate-500 mt-2">เข้าสู่ระบบเพื่อจัดการค่าใช้จ่ายของคุณ</p>
                </div>

                {/* Card */}
                <div className="bg-white/70 backdrop-blur-xl border border-sky-200/50 rounded-2xl p-8 shadow-xl shadow-sky-100/50">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">ชื่อผู้ใช้</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) => handleChange("username", e.target.value)}
                                onBlur={() => handleBlur("username")}
                                className={getFieldClass("username")}
                                placeholder="username"
                                disabled={loading}
                            />
                            {touched.username && fieldErrors.username && (
                                <p className="text-red-500 text-xs mt-1 animate-fade-in">{fieldErrors.username}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">รหัสผ่าน</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                onBlur={() => handleBlur("password")}
                                className={getFieldClass("password")}
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            {touched.password && fieldErrors.password && (
                                <p className="text-red-500 text-xs mt-1 animate-fade-in">{fieldErrors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold hover:from-sky-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    กำลังเข้าสู่ระบบ...
                                </span>
                            ) : (
                                "เข้าสู่ระบบ"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-sm">
                            ยังไม่มีบัญชี?{" "}
                            <a href="/register" className="text-sky-500 hover:text-sky-600 font-medium transition-colors">
                                สมัครสมาชิก
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
