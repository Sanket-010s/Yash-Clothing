export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={48} className="text-neutral-text mb-4 opacity-50" />}
      <h3 className="text-lg font-semibold text-neutral-primary mb-2">{title}</h3>
      <p className="text-neutral-text text-sm mb-6 max-w-sm">{description}</p>
      {action && (
        <button className="px-4 py-2 bg-primary-gold hover:bg-primary-gold-hover text-neutral-primary font-medium rounded-lg transition-colors">
          {action}
        </button>
      )}
    </div>
  );
}
