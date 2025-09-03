import React, { useState, useMemo } from 'react';
import { calculateKPIs } from '../constants';
import MetricCard from './MetricCard';
import OperationalChart from './ProductionChart';
import OperationalDataTable from './MaterialDistributionChart';
import { OperationalData } from '../types';
import { UI_CONFIG } from '../config';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface DashboardProps {
    data: OperationalData[];
}

// --- Icon Components ---
const TotalVolumeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const AchievementIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const TripsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M1-1-1-1M17 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" />
    </svg>
);

const UtilizationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const filteredData = useMemo(() => {
        if (!filters.startDate && !filters.endDate) return data;
        const start = filters.startDate ? new Date(filters.startDate).getTime() : -Infinity;
        const end = filters.endDate ? new Date(filters.endDate).getTime() : Infinity;
        
        // Adjust end date to include the whole day
        const endOfDay = end === Infinity ? end : end + (24 * 60 * 60 * 1000 - 1);

        return data.filter(d => {
            const itemDate = new Date(d.date).getTime();
            return itemDate >= start && itemDate <= endOfDay;
        });
    }, [data, filters]);

    const { totalVolume, averagePencapaian, totalRitase, averageEU } = calculateKPIs(filteredData);
    
    const tableData = useMemo(() => {
        return [...filteredData]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, UI_CONFIG.DASHBOARD_TABLE_ROWS);
    }, [filteredData]);

    const monthlyData = useMemo(() => {
        const months = filteredData.reduce((acc, item) => {
            const date = new Date(item.date);
            const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
            
            if (!acc[monthKey]) {
                acc[monthKey] = { 
                    month: new Date(date.getUTCFullYear(), date.getUTCMonth(), 1).toLocaleDateString('id-ID', { year: '2-digit', month: 'short' }), 
                    volume: 0, 
                    targetM3: 0 
                };
            }
            acc[monthKey].volume += item.volume;
            acc[monthKey].targetM3 += item.targetM3;
            return acc;
        }, {} as Record<string, { month: string; volume: number; targetM3: number }>);

        return Object.entries(months)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([, value]) => value);
    }, [filteredData]);

    const yearlyData = useMemo(() => {
        const years = filteredData.reduce((acc, item) => {
            const year = new Date(item.date).getUTCFullYear().toString();
            if (!acc[year]) {
                acc[year] = { year, volume: 0, targetM3: 0 };
            }
            acc[year].volume += item.volume;
            acc[year].targetM3 += item.targetM3;
            return acc;
        }, {} as Record<string, { year: string; volume: number; targetM3: number }>);

        return Object.values(years).sort((a, b) => a.year.localeCompare(b.year));
    }, [filteredData]);


    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-wrap items-center justify-start gap-4">
                 <h2 className="text-md font-semibold text-white mr-4">Filter Data:</h2>
                <div className="flex items-center gap-2">
                    <label htmlFor="startDate" className="text-sm font-medium text-slate-400">Dari:</label>
                    <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-sm"/>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="endDate" className="text-sm font-medium text-slate-400">Sampai:</label>
                    <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-sm"/>
                </div>
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Total Volume" 
                    value={`${(totalVolume / 1000).toFixed(2)}k m³`}
                    icon={<TotalVolumeIcon />} 
                    description="Total volume produksi selama periode."
                />
                <MetricCard 
                    title="Pencapaian Rata-rata" 
                    value={`${averagePencapaian.toFixed(1)}%`}
                    icon={<AchievementIcon />}
                    description="Rata-rata pencapaian target harian."
                />
                <MetricCard 
                    title="Total Ritase" 
                    value={totalRitase.toLocaleString()}
                    icon={<TripsIcon />}
                    description="Akumulasi perjalanan pengangkutan material."
                />
                <MetricCard 
                    title="Avg. Utilisasi Efektif" 
                    value={`${averageEU.toFixed(1)}%`}
                    icon={<UtilizationIcon />}
                    description="Rata-rata efektivitas penggunaan waktu kerja."
                />
            </div>

            {/* Daily Chart */}
            <div className="bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-lg font-semibold mb-4 text-cyan-300">Performa Volume Harian (m³)</h2>
                <OperationalChart data={filteredData} />
            </div>

            {/* Monthly and Yearly Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700">
                    <h2 className="text-lg font-semibold mb-4 text-cyan-300">Performa Volume Bulanan (m³)</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <ComposedChart
                                data={monthlyData}
                                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" tick={{ fill: '#9ca3af' }} fontSize={12} />
                                <YAxis tick={{ fill: '#9ca3af' }} fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    labelStyle={{ color: '#d1d5db' }}
                                    formatter={(value: number, name: string) => [`${Math.round(value).toLocaleString()} m³`, name]}
                                />
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                <Bar dataKey="volume" name="Volume" fill={UI_CONFIG.CHART_COLORS.VOLUME} />
                                <Line type="monotone" dataKey="targetM3" name="Target" stroke={UI_CONFIG.CHART_COLORS.TARGET} strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700">
                    <h2 className="text-lg font-semibold mb-4 text-cyan-300">Performa Volume Tahunan (m³)</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <ComposedChart
                                data={yearlyData}
                                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="year" tick={{ fill: '#9ca3af' }} fontSize={12} />
                                <YAxis tick={{ fill: '#9ca3af' }} fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                                    labelStyle={{ color: '#d1d5db' }}
                                    formatter={(value: number, name: string) => [`${Math.round(value).toLocaleString()} m³`, name]}
                                />
                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                <Bar dataKey="volume" name="Volume" fill={UI_CONFIG.CHART_COLORS.VOLUME} />
                                <Line type="monotone" dataKey="targetM3" name="Target" stroke={UI_CONFIG.CHART_COLORS.TARGET} strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data Table */}
             <div className="bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-lg font-semibold mb-4 text-cyan-300">5 Log Operasional Terkini</h2>
                <OperationalDataTable data={tableData} />
            </div>
        </div>
    );
};

export default Dashboard;