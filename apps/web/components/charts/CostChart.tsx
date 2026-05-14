'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';

const spendData = [
  { name: 'Jan', openai: 4000, anthropic: 2400, other: 2400 },
  { name: 'Feb', openai: 3000, anthropic: 1398, other: 2210 },
  { name: 'Mar', openai: 2000, anthropic: 9800, other: 2290 },
  { name: 'Apr', openai: 2780, anthropic: 3908, other: 2000 },
  { name: 'May', openai: 1890, anthropic: 4800, other: 2181 },
  { name: 'Jun', openai: 2390, anthropic: 3800, other: 2500 },
  { name: 'Jul', openai: 3490, anthropic: 4300, other: 2100 },
];

const providerData = [
  { name: 'OpenAI', value: 15400 },
  { name: 'Anthropic', value: 12000 },
  { name: 'Azure AI', value: 5000 },
  { name: 'Google Cloud', value: 3000 },
];

export function CostChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={spendData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Area type="monotone" dataKey="openai" name="OpenAI" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.8} />
          <Area type="monotone" dataKey="anthropic" name="Anthropic" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.8} />
          <Area type="monotone" dataKey="other" name="Other" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.8} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CostByProviderChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={providerData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 40,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`$${value}`, 'Spend']}
          />
          <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
