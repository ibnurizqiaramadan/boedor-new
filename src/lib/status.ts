import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export type OrderStatus = 'open' | 'closed' | 'completed' | string;

export const formatStatus = (status: OrderStatus) => {
  switch (status) {
    case 'open':
      return 'Terbuka';
    case 'closed':
      return 'Ditutup';
    case 'completed':
      return 'Selesai';
    default:
      return status || '-';
  }
};

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'open':
      return 'text-blue-400 bg-blue-400/15';
    case 'closed':
      return 'text-orange-400 bg-orange-400/15';
    case 'completed':
      return 'text-green-400 bg-green-400/15';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusIcon = (status: OrderStatus): React.ReactNode => {
  switch (status) {
    case 'open':
      return React.createElement(Clock, { className: 'h-5 w-5 text-blue-400' });
    case 'closed':
      return React.createElement(XCircle, { className: 'h-5 w-5 text-orange-400' });
    case 'completed':
      return React.createElement(CheckCircle, { className: 'h-5 w-5 text-green-400' });
    default:
      return React.createElement(Clock, { className: 'h-5 w-5 text-gray-500' });
  }
};
