import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OperationalData } from '../types';
import { UI_CONFIG } from '../config';

interface OperationalChartProps {
  data: OperationalData[];
}

const OperationalChart: React.FC<OperationalChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{
            top: 5, right: 20, left: -10, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => new Date(tick).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}
            tick={{ fill: '#9ca3af' }} 
            fontSize={12} 
          />
          <YAxis tick={{ fill: '#9ca3af' }} fontSize={12} />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: '#1f2937', 
                borderColor: '#374151',
                borderRadius: '0.5rem'
            }} 
            labelStyle={{ color: '#d1d5db' }}
            formatter={(value: number, name: string) => [`${value.toLocaleString()} m³`, name]}
          />
          <Legend wrapperStyle={{fontSize: "14px"}}/>
          <Bar dataKey="volume" name="Volume" fill={UI_CONFIG.CHART_COLORS.VOLUME} />
          <Line type="monotone" dataKey="targetM3" name="Target" stroke={UI_CONFIG.CHART_COLORS.TARGET} strokeWidth={2} dot={{r: 4}} activeDot={{ r: 8 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OperationalChart;
