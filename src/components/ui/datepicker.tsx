// app/components/ui/datepicker.tsx
"use client";

import React from "react";
import ReactDatePicker, { DatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
 
export const DatePicker: React.FC<DatePickerProps> = (props) => {
  return <ReactDatePicker {...props} />;
};

export default DatePicker;
