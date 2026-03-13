"use client";

import { useState, useRef, useCallback } from "react";
import { createTransaction } from "../lib/api";
import { useToast } from "./Toast";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SlipUploadModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // ผลลัพธ์ที่ AI อ่านได้
  const [slipData, setSlipData] = useState(null);

  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setScanning(false);
    setSaving(false);
    setError(null);
    setSlipData(null);
    setIsDragging(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // ตรวจสอบประเภทไฟล์
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น");
      return;
    }

    // ตรวจสอบขนาดไฟล์ (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
    setSlipData(null);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files?.[0]);
  };

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
  }, []);

  // ส่งรูปไปให้ AI สแกน
  const handleScan = async () => {
    if (!file) return;

    setScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append("slip", file);

    try {
      const response = await fetch(`${API_BASE}/api/slip`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("สแกนสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }

      const result = await response.json();

      if (result.success) {
        setSlipData({
          title: result.data.receiver || "โอนเงิน",
          date: result.data.date || new Date().toISOString().split("T")[0],
          amount: result.data.amount || "",
          receiver: result.data.receiver || "",
          type: result.data.type === "รายรับ" ? "INCOME" : "EXPENSE",
          categoryName: result.data.category || "อื่นๆ",
          reference: result.data.Reference || "",
          note: result.data.Reference
            ? `Ref: ${result.data.Reference}`
            : "",
        });
        toast.success("สแกนสลิปสำเร็จ! 🎉");
      }
    } catch (err) {
      setError(err.message);
      toast.error("สแกนสลิปไม่สำเร็จ");
    } finally {
      setScanning(false);
    }
  };

  // บันทึกรายการลง Database
  const handleSave = async () => {
    if (!slipData) return;

    if (!slipData.amount || Number(slipData.amount) <= 0) {
      setError("กรุณาตรวจสอบจำนวนเงิน");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createTransaction({
        title: slipData.title,
        amount: Number(slipData.amount),
        type: slipData.type,
        categoryName: slipData.categoryName,
        date: slipData.date,
        note: slipData.note,
      });

      toast.success("บันทึกรายการสำเร็จ! 💰");
      onSuccess();
      handleClose();
    } catch (err) {
      const msg = err.message || "เกิดข้อผิดพลาดในการบันทึก";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setSlipData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white border border-sky-200/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-sky-100/50 animate-fade-in z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">สแกนสลิป</h2>
              <p className="text-xs text-slate-400">อัปโหลดสลิปโอนเงิน ให้ AI อ่านข้อมูลอัตโนมัติ</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-xl text-sm mb-4 animate-shake">
            {error}
          </div>
        )}

        {/* Upload Area — แสดงเมื่อยังไม่ได้สแกน */}
        {!slipData && (
          <>
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-4 group
                ${isDragging
                  ? "border-sky-400 bg-sky-50/50 scale-[1.02]"
                  : preview
                    ? "border-sky-300 bg-sky-50/30"
                    : "border-sky-200 bg-sky-50/20 hover:border-sky-300 hover:bg-sky-50/30"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
              />

              {preview ? (
                <div className="space-y-3">
                  <img
                    src={preview}
                    alt="Slip Preview"
                    className="max-h-52 mx-auto rounded-xl object-contain shadow-lg shadow-sky-100/50 border border-sky-200/30"
                  />
                  <p className="text-xs text-slate-400">
                    {file?.name} • {(file?.size / 1024).toFixed(0)} KB
                  </p>
                  <p className="text-xs text-sky-400">คลิกเพื่อเปลี่ยนรูป</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Upload Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-600 font-medium">
                      ลากไฟล์มาวางที่นี่ หรือ <span className="text-sky-500">คลิกเพื่อเลือกไฟล์</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">รองรับ JPG, PNG, WEBP (ไม่เกิน 5MB)</p>
                  </div>
                </div>
              )}
            </div>

            {/* Scan Button */}
            <button
              onClick={handleScan}
              disabled={!file || scanning}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold hover:from-sky-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
            >
              {scanning ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>AI กำลังอ่านสลิป...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>สแกนสลิป</span>
                </>
              )}
            </button>
          </>
        )}

        {/* Result Area — แสดงเมื่อ AI อ่านข้อมูลได้แล้ว */}
        {slipData && (
          <div className="space-y-4 animate-fade-in">
            {/* Success Banner */}
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-emerald-700 text-sm font-medium">AI อ่านสลิปสำเร็จ!</p>
                <p className="text-emerald-500 text-xs">ตรวจสอบข้อมูลด้านล่างก่อนบันทึก</p>
              </div>
            </div>

            {/* Mini Preview */}
            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Slip"
                  className="h-24 rounded-xl object-contain opacity-60 border border-sky-200/30"
                />
              </div>
            )}

            {/* Editable Fields */}
            <div className="space-y-3">
              {/* ชื่อรายการ */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ชื่อรายการ</label>
                <input
                  type="text"
                  value={slipData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 text-slate-800 text-sm border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* จำนวนเงิน */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">จำนวนเงิน (฿)</label>
                  <input
                    type="number"
                    value={slipData.amount}
                    onChange={(e) => handleFieldChange("amount", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 text-slate-800 text-sm border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* ประเภท */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">ประเภท</label>
                  <select
                    value={slipData.type}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 text-slate-800 text-sm border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                  >
                    <option value="EXPENSE">รายจ่าย</option>
                    <option value="INCOME">รายรับ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* หมวดหมู่ */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">หมวดหมู่</label>
                  <select
                    value={slipData.categoryName}
                    onChange={(e) => handleFieldChange("categoryName", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 text-slate-800 text-sm border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                  >
                    <option value="อาหาร">🍔 อาหาร</option>
                    <option value="ช้อปปิ้ง">🛍️ ช้อปปิ้ง</option>
                    <option value="เดินทาง">🚗 เดินทาง</option>
                    <option value="บิลและค่าใช้จ่าย">📄 บิลและค่าใช้จ่าย</option>
                    <option value="อื่นๆ">📦 อื่นๆ</option>
                  </select>
                </div>

                {/* วันที่ */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">วันที่</label>
                  <input
                    type="date"
                    value={slipData.date}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 text-slate-800 text-sm border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                  />
                </div>
              </div>

              {/* ผู้รับเงิน */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ผู้รับเงิน</label>
                <input
                  type="text"
                  value={slipData.receiver}
                  onChange={(e) => handleFieldChange("receiver", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 text-slate-800 text-sm border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                  readOnly
                />
              </div>

              {/* หมายเหตุ */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  value={slipData.note}
                  onChange={(e) => handleFieldChange("note", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sky-50/50 text-slate-800 text-sm border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                  placeholder="รายละเอียดเพิ่มเติม..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSlipData(null);
                  setError(null);
                }}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-white/80 border border-sky-200/50 text-slate-500 font-medium hover:text-slate-700 hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                สแกนใหม่
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold hover:from-emerald-400 hover:to-green-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    บันทึกรายการ
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
