import React from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export type OrderStatus = "open" | "closed" | "completed" | string;

export const formatStatus = (status: OrderStatus) => {
  switch (status) {
    case "open":
      return "Terbuka";
    case "closed":
      return "Ditutup";
    case "completed":
      return "Selesai";
    default:
      return status || "-";
  }
};

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "open":
      return "text-blue-600 bg-blue-100";
    case "closed":
      return "text-orange-600 bg-orange-100";
    case "completed":
      return "text-green-600 bg-green-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export const getStatusIcon = (status: OrderStatus): React.ReactNode => {
  switch (status) {
    case "open":
      return React.createElement(Clock, { className: "h-5 w-5 text-blue-500" });
    case "closed":
      return React.createElement(XCircle, { className: "h-5 w-5 text-orange-500" });
    case "completed":
      return React.createElement(CheckCircle, { className: "h-5 w-5 text-green-500" });
    default:
      return React.createElement(Clock, { className: "h-5 w-5 text-gray-500" });
  }
};
