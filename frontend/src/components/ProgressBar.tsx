interface Props {
  value: number;
}

export default function ProgressBar({ value }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-violet to-lilac transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
