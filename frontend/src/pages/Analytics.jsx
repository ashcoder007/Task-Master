import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, Loader, PageHeader } from "../components/ui";
import { api } from "../lib/api";

const colors = ["#111827", "#0f766e", "#b45309"];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/dashboard/stats").then(({ data }) => setStats(data.data)); }, []);
  if (!stats) return <Loader />;

  const status = ["TODO", "IN_PROGRESS", "DONE"].map((name) => ({ name: name.replace("_", " "), value: stats.status[name] || 0 }));
  const priority = ["LOW", "MEDIUM", "HIGH"].map((name) => ({ name, value: stats.priority[name] || 0 }));

  return (
    <>
      <PageHeader title="Analytics" description="Compact workspace health and task distribution." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Chart title="Status distribution" data={status} />
        <Chart title="Priority distribution" data={priority} />
      </div>
    </>
  );
}

function Chart({ title, data }) {
  return <Card className="p-5"><h2 className="mb-4 font-semibold">{title}</h2><div className="h-80"><ResponsiveContainer><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>{data.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></Card>;
}
