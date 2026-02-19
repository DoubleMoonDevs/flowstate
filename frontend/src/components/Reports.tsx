import { ReportPoint } from '../types';

interface Props {
  title: string;
  subtitle: string;
  points: ReportPoint[];
}

export default function Reports({ title, subtitle, points }: Props) {
  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-display font-semibold text-plum dark:text-lilac">{title}</h2>
        <p className="text-base text-slate-500 dark:text-slate-300">{subtitle}</p>
      </div>
      <div className="flex items-end gap-3 h-40">
        {points.map((point) => (
          <div key={point.label} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-t-2xl bg-gradient-to-t from-violet to-lilac/80 transition-all"
              style={{ height: `${(point.value / max) * 100}%` }}
            />
            <span className="text-sm text-slate-500">{point.label}</span>
            <span className="text-sm font-semibold text-slate-600">{point.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
