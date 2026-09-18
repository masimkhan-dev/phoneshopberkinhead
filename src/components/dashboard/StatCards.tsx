import { SummaryCard } from "@/components/ui/summary-card";

export function DashboardStatCards({
  stats,
}: {
  stats: { label: string; value: string | number; change: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <SummaryCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          subtitle={stat.change}
          accentColor="brand"
        />
      ))}
    </div>
  );
}

