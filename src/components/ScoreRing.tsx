export default function ScoreRing({ value }: { value: number }) {
  const percent = Math.round(value * 100);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative grid h-12 w-12 shrink-0 place-items-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          strokeWidth="4"
          className="stroke-line"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-accent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value)}
        />
      </svg>
      <span className="text-xs font-semibold">{percent}%</span>
    </div>
  );
}