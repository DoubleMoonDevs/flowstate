interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface Props {
  items: Notification[];
  onDismiss: (id: number) => void;
  onPause?: (id: number) => void;
  onResume?: (id: number) => void;
}

export default function Notifications({ items, onDismiss, onPause, onResume }: Props) {
  if (!items.length) return null;

  return (
    <div className="fixed right-6 top-6 space-y-3 z-50">
      {items.map((item) => (
        <div
          key={item.id}
          className="card px-5 py-4 flex items-center gap-3 border-l-4"
          style={{
            borderColor: item.type === 'error' ? '#fb7185' : item.type === 'success' ? '#10b981' : '#0ea5e9'
          }}
          onMouseEnter={() => onPause?.(item.id)}
          onMouseLeave={() => onResume?.(item.id)}
        >
          <div className="flex-1">
            <p className="text-base font-semibold">{item.message}</p>
          </div>
          <button className="text-sm text-slate-500" onClick={() => onDismiss(item.id)}>
            fechar
          </button>
        </div>
      ))}
    </div>
  );
}
