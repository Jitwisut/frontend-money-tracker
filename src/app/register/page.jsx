"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "../lib/api";
import { useToast } from "../components/Toast";

export default function RegisterPage() {
    const router = useRouter();
    const toast = useToast();
    const [form, setForm] = useState({ username: "", password: "", name: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (name, value) => {
        switch (name) {
            case "name":
                if (!value.trim()) return "กรุณากรอกชื่อ-นามสกุล";
                if (value.length < 2) return "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร";
                return "";
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
        ["name", "username", "password"].forEach((field) => {
            const err = validateField(field, form[field]);
            if (err) errors[field] = err;
        });
        setFieldErrors(errors);
        setTouched({ name: true, username: true, password: true });
        return Object.keys(errors).length === 0;
    };

    const getFieldClass = (field) => {
        const base = "w-full px-4 py-3 rounded-xl bg-sky-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all";
        if (touched[field] && fieldErrors[field]) {
            return `${base} border-2 border-red-300 focus:ring-red-400/50 focus:border-red-400/50`;
        }
        return `${base} border border-sky-200 focus:ring-emerald-400/50 focus:border-emerald-400/50`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setError("");
        setLoading(true);
        try {
            await register(form.username, form.password, form.name);
            toast.success("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ 🎉");
            router.push("/login");
        } catch (err) {
            const msg = err.message || "สมัครสมาชิกไม่สำเร็จ";
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4 shadow-lg shadow-emerald-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">สมัครสมาชิก</h1>
                    <p className="text-slate-500 mt-2">สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
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
                            <label className="block text-sm font-medium text-slate-600 mb-2">ชื่อ-นามสกุล</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                onBlur={() => handleBlur("name")}
                                className={getFieldClass("name")}
                                placeholder="ชื่อของคุณ"
                                disabled={loading}
                            />
                            {touched.name && fieldErrors.name && (
                                <p className="text-red-500 text-xs mt-1 animate-fade-in">{fieldErrors.name}</p>
                            )}
                        </div>

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
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    กำลังสมัครสมาชิก...
                                </span>
                            ) : (
                                "สมัครสมาชิก"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-sm">
                            มีบัญชีอยู่แล้ว?{" "}
                            <a href="/login" className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors">
                                เข้าสู่ระบบ
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
