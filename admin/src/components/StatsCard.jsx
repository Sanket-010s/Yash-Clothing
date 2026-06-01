import { cn } from '../lib/utils';

export default function StatsCard({
  icon: Icon,
  title,
  value,
  subtext,
  onClick,
  isLoading = false,
  className = '',
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg p-6 border border-neutral-border shadow-sm hover:shadow-md transition-shadow',
        onClick && 'cursor-pointer hover:border-primary-gold',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-neutral-text text-sm font-medium mb-2">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-neutral-bg rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-primary-gold">{value}</p>
          )}
          {subtext && (
            <p className="text-xs text-neutral-text mt-2">{subtext}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-neutral-bg rounded-lg">
            <Icon size={24} className="text-primary-gold" />
          </div>
        )}
      </div>
    </div>
  );
}
