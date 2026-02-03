import { useEffect, useState } from 'react';
import { getRecruiterAnalytics } from '../services/analytics';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import Spinner from './Spinner';

export default function AnalyticsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getRecruiterAnalytics();
        setData(res);
      } catch (err) {
        console.error('Analytics load error', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div className="p-4"><Spinner size={1.5}/> Loading analytics...</div>;
  if (!data) return <div className="p-4">No analytics available</div>;

  const COLORS = ['#22c55e', '#ef4444', '#64748b', '#f59e0b', '#3b82f6'];

  return (
    <div className="mt-6 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <h3 className="font-medium mb-2">Applications by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.applicationsByStatus} dataKey="value" nameKey="name" label>
                {data.applicationsByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-2">
          <h3 className="font-medium mb-2">Applications Over Time (last 14 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.applicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Top Applicant Skills</h3>
        {data.skillsDistribution.length === 0 ? (
          <p>No skill data</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.skillsDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="skill" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
