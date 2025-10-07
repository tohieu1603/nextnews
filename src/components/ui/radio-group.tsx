"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
// import { CircleIcon } from "lucide-react"; // Không cần nữa

import { cn } from "./utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "relative aspect-square size-5 shrink-0 rounded-full border-2 outline-none transition-[border-color,box-shadow,background-color]",
        // ----- Unchecked: làm viền + nền mờ để dễ thấy trên dark -----
        "data-[state=unchecked]:border-white/45 data-[state=unchecked]:bg-white/[0.06] hover:data-[state=unchecked]:bg-white/[0.12]",
        // ----- Checked: viền/nền theo primary -----
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/20",
        // ----- Focus ring cho accessibility -----
        "focus-visible:ring-[3px] focus-visible:ring-primary/40",
        // ----- Trạng thái lỗi/disabled -----
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        {/* chấm tròn rõ ràng trong mọi nền */}
        <span className="block h-2.25 w-2.25 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
