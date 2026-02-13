"use client";

import { useState, useEffect, useRef } from "react";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
} from "../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "./Toast";

export default function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  editingTx,
}) {
  const toast = useToast();

  const EMPTY_FORM = {
    title: "",
    amount: "",
    type: "EXPENSE",
    categoryName: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  };

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // State สำหรับจัดการหมวดหมู่ (Category)
  const [categories, setCategories] = useState([]);
  const [showCatSuggestions, setShowCatSuggestions] = useState(false);
  const catInputRef = useRef(null);

  // โหลดหมวดหมู่เมื่อ Modal เปิด
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setFormError("");
      setFieldErrors({});
      setTouched({});

      if (editingTx) {
        setForm({
          title: editingTx.title,
          amount: editingTx.amount,
          type: editingTx.type,
          categoryName: editingTx.category?.name || "",
          date: new Date(editingTx.date).toISOString().split("T")[0],
          note: editingTx.note || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [isOpen, editingTx]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      if (res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  // Logic การปิด Suggestion เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (catInputRef.current && !catInputRef.current.contains(event.target)) {
        setShowCatSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Validation ───
  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (!value.trim()) return "กรุณากรอกชื่อรายการ";
        if (value.length > 100) return "ชื่อรายการต้องไม่เกิน 100 ตัวอักษร";
        return "";
      case "amount":
        if (!value || Number(value) <= 0) return "จำนวนเงินต้องมากกว่า 0";
        return "";
      case "categoryName":
        if (!value.trim()) return "กรุณาเลือกหรือกรอกหมวดหมู่";
        return "";
      case "date":
        if (!value) return "กรุณาเลือกวันที่";
        return "";
      default:
        return "";
    }
  };

  const validateAll = () => {
    const errors = {};
    ["title", "amount", "categoryName", "date"].forEach((field) => {
      const err = validateField(field, form[field]);
      if (err) errors[field] = err;
    });
    setFieldErrors(errors);
    setTouched({ title: true, amount: true, categoryName: true, date: true });
    return Object.keys(errors).length === 0;
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

  const getFieldClass = (field) => {
    const base =
      "w-full px-3 py-2.5 rounded-xl bg-sky-50/50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 transition-all";
    if (touched[field] && fieldErrors[field]) {
      return `${base} border-2 border-red-300 focus:ring-red-400/50`;
    }
    return `${base} border border-sky-200 focus:ring-sky-400/50`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setFormLoading(true);
    setFormError("");

    try {
      const payload = { ...form, amount: Number(form.amount) };

      if (editingTx) {
        await updateTransaction(editingTx.id, payload);
        toast.success("แก้ไขรายการสำเร็จ! ✏️");
      } else {
        await createTransaction(payload);
        toast.success("เพิ่มรายการสำเร็จ! 🎉");
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTx) return;
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      )
    ) {
      return;
    }
    setFormLoading(true);
    try {
      await deleteTransaction(editingTx.id);
      toast.success("ลบรายการสำเร็จ! 🗑️");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.message || "เกิดข้อผิดพลาดในการลบข้อมูล";
      setFormError(msg);
      toast.error(msg);
      setFormLoading(false);
    }
  };

  // กรองหมวดหมู่ตามที่พิมพ์
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(form.categoryName.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white border border-sky-200/50 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-sky-100/50 animate-fade-in z-10">
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          {editingTx ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm animate-shake">
              {formError}
            </div>
          )}

          {/* ชื่อรายการ */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              ชื่อรายการ
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              onBlur={() => handleBlur("title")}
              className={getFieldClass("title")}
              placeholder="เช่น ค่าอาหารกลางวัน"
              disabled={formLoading}
            />
            {touched.title && fieldErrors.title && (
              <p className="text-red-500 text-xs mt-1 animate-fade-in">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* จำนวนเงิน */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                จำนวนเงิน (฿)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                onBlur={() => handleBlur("amount")}
                className={getFieldClass("amount")}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={formLoading}
              />
              {touched.amount && fieldErrors.amount && (
                <p className="text-red-500 text-xs mt-1 animate-fade-in">
                  {fieldErrors.amount}
                </p>
              )}
            </div>
            {/* ประเภท */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                ประเภท
              </label>
              <Select
                value={form.type}
                onValueChange={(value) => handleChange("type", value)}
                disabled={formLoading}
              >
                <SelectTrigger className="w-full px-3 py-2.5 h-[46px] rounded-xl bg-sky-50/50 border border-sky-200 text-slate-800 text-sm focus:ring-sky-400/50">
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent className="bg-white border-sky-200 text-slate-800">
                  <SelectItem
                    value="EXPENSE"
                    className="focus:bg-sky-50 focus:text-slate-800 cursor-pointer hover:bg-sky-50"
                  >
                    รายจ่าย
                  </SelectItem>
                  <SelectItem
                    value="INCOME"
                    className="focus:bg-sky-50 focus:text-slate-800 cursor-pointer hover:bg-sky-50"
                  >
                    รายรับ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- หมวดหมู่ --- */}
          <div className="relative" ref={catInputRef}>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              หมวดหมู่
            </label>
            <input
              type="text"
              value={form.categoryName}
              onChange={(e) => {
                handleChange("categoryName", e.target.value);
                setShowCatSuggestions(true);
              }}
              onFocus={() => setShowCatSuggestions(true)}
              onBlur={() => handleBlur("categoryName")}
              className={getFieldClass("categoryName")}
              placeholder="เลือกจากหมวดหมู่จากที่คุณมีอยู่ หรือพิมพ์เพื่อเพิ่มใหม่..."
              disabled={formLoading}
            />
            {touched.categoryName && fieldErrors.categoryName && (
              <p className="text-red-500 text-xs mt-1 animate-fade-in">
                {fieldErrors.categoryName}
              </p>
            )}
            {/* Dropdown Suggestions */}
            {showCatSuggestions && filteredCategories.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-sky-200 rounded-xl shadow-xl shadow-sky-100/30 max-h-40 overflow-y-auto">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      handleChange("categoryName", cat.name);
                      setShowCatSuggestions(false);
                    }}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-slate-800 cursor-pointer transition-colors"
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* วันที่ */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              วันที่
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              onBlur={() => handleBlur("date")}
              className={getFieldClass("date")}
              disabled={formLoading}
            />
            {touched.date && fieldErrors.date && (
              <p className="text-red-500 text-xs mt-1 animate-fade-in">
                {fieldErrors.date}
              </p>
            )}
          </div>

          {/* หมายเหตุ */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              หมายเหตุ (ไม่บังคับ)
            </label>
            <textarea
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 border border-sky-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all resize-none"
              rows={2}
              placeholder="รายละเอียดเพิ่มเติม..."
              disabled={formLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {editingTx && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={formLoading}
                className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-500 font-medium hover:bg-red-100 transition-all disabled:opacity-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={formLoading}
              className="flex-1 py-2.5 rounded-xl bg-white/80 border border-sky-200/50 text-slate-500 font-medium hover:text-slate-700 hover:bg-white transition-all disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-medium hover:from-sky-400 hover:to-blue-400 transition-all disabled:opacity-50 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              {formLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  กำลังบันทึก...
                </>
              ) : editingTx ? (
                "บันทึกการแก้ไข"
              ) : (
                "เพิ่มรายการ"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
