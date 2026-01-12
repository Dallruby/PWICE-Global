import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { SAIFStats } from '../types';

interface SAIFChartProps {
  stats: SAIFStats;
  color?: string;
}

const SAIFChart: React.FC<SAIFChartProps> = ({ stats, color = "#a855f7" }) => {
  const data = [
    { subject: 'Strength (무력)', A: stats.S, fullMark: 10 },
    { subject: 'Authority (권력)', A: stats.A, fullMark: 10 },
    { subject: 'Intelligence (지력)', A: stats.I, fullMark: 10 },
    { subject: 'Finance (자본력)', A: stats.F, fullMark: 10 },
  ];

  const renderTick = (props: any) => {
    const { payload, x, y, textAnchor } = props;
    const [eng, kor] = payload.value.split(' ');

    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill="#94a3b8"
        fontSize={10}
        className="font-mono"
      >
        <tspan x={x} dy="0">{eng}</tspan>
        <tspan x={x} dy="1.1em">{kor}</tspan>
      </text>
    );
  };

  return (
    <div className="w-full h-64 font-sans text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={renderTick} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="SAIF"
            dataKey="A"
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SAIFChart;