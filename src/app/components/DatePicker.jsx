"use client";

import * as React from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale"; // ภาษาไทย
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  date,
  setDate,
  label = "เลือกวันที่", // รับ Label มาแสดงเผื่อยังไม่ได้เลือก
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-sky-50/50 border-sky-200 text-slate-700 hover:bg-sky-100/50 hover:text-slate-800",
            !date && "text-slate-400",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-sky-500" />
          {date ? (
            format(date, "dd MMM yyyy", { locale: th })
          ) : (
            <span>{label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white border-sky-200 text-slate-800 shadow-lg shadow-sky-100/50"
        align="start"
      >
        <Calendar
          mode="single" // โหมดเลือกวันเดียว
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={th}
          className="bg-white text-slate-800 rounded-md border border-sky-200"
          classNames={{
            day_selected:
              "bg-sky-500 text-white hover:bg-sky-500 focus:bg-sky-500",
            day_today: "bg-sky-100 text-sky-700",
            day: "text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-md",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
