import { getStatusColor } from '../lib/utils';
import { cn } from '../lib/utils';

export default function StatusBadge({ status, className = '' }) {
  const colorClass = getStatusColor(status);
  
  const labelMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-xs font-semibold inline-block',
      colorClass,
      className
    )}>
      {labelMap[status] || status}
    </span>
  );
}
