import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function ApplicationChart({ data }) {
  const COLORS = ["#22c55e", "#ef4444", "#64748b"];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
