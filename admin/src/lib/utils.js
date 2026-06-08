import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDate(date) {
  const dateObj = new Date(date);
  // Check if date ends with 'Z' (UTC) and handle timezone conversion
  if (typeof date === 'string' && !date.includes('Z') && !date.includes('+')) {
    // If no timezone info, treat as UTC
    const utcDate = date + (date.includes('T') ? 'Z' : 'T00:00:00Z');
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }).format(new Date(utcDate));
  }
  
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).format(dateObj);
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-50 text-yellow-900',
    confirmed: 'bg-gray-100 text-gray-900',
    shipped: 'bg-purple-50 text-purple-900',
    delivered: 'bg-green-50 text-green-900',
    cancelled: 'bg-red-50 text-red-900',
  };
  return colors[status] || colors.pending;
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
