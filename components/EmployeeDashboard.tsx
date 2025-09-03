import React, { useState, useMemo } from 'react';
import { Karyawan } from '../types';
import MetricCard from './MetricCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- Icon Components ---
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const UserCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const UserRemoveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 15.5l-5 5m0-5l5 5" />
    </svg>
);
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const UserPlaceholderIcon = ({ className = "h-6 w-6 text-slate-500" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const DetailItem = ({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) => (
    <div className={className}>
        <strong className="text-slate-400 text-sm block">{label}</strong>
        <span className="text-white">{value || '-'}</span>
    </div>
);


interface EmployeeDashboardProps {
    data: Karyawan[];
    logoUrl: string | null;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ data, logoUrl }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [previewKaryawan, setPreviewKaryawan] = useState<Karyawan | null>(null);

    const kpis = useMemo(() => {
        const totalKaryawan = data.length;
        const karyawanAktif = data.filter(k => k.status === 'Aktif').length;
        const karyawanTidakAktif = totalKaryawan - karyawanAktif;
        const posisiUnik = new Set(data.map(k => k.posisi.trim())).size;
        return { totalKaryawan, karyawanAktif, karyawanTidakAktif, posisiUnik };
    }, [data]);

    const filteredData = useMemo(() => {
        return data.filter(k => {
            const matchesSearch = searchTerm === '' ||
                k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                k.nik.includes(searchTerm) ||
                (k.departemen && k.departemen.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'Semua' || k.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [data, searchTerm, statusFilter]);

    const statusChartData = useMemo(() => [
        { name: 'Aktif', value: kpis.karyawanAktif, fill: '#4ade80' },
        { name: 'Tidak Aktif', value: kpis.karyawanTidakAktif, fill: '#f87171' }
    ], [kpis]);

    const positionChartData = useMemo(() => {
        const counts = data.reduce((acc, curr) => {
            const pos = curr.posisi || 'N/A';
            acc[pos] = (acc[pos] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, Karyawan: value })).sort((a,b) => b.Karyawan - a.Karyawan);
    }, [data]);
    
    const departmentChartData = useMemo(() => {
        const counts = data.reduce((acc, curr) => {
            const dep = curr.departemen || 'N/A';
            acc[dep] = (acc[dep] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, Karyawan: value })).sort((a,b) => b.Karyawan - a.Karyawan);
    }, [data]);


    return (
        <>
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-cyan-300">Dashboard Karyawan</h1>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Karyawan" value={kpis.totalKaryawan.toLocaleString()} icon={<UsersIcon />} description="Jumlah total karyawan terdaftar." />
                <MetricCard title="Karyawan Aktif" value={kpis.karyawanAktif.toLocaleString()} icon={<UserCheckIcon />} description="Karyawan dengan status aktif." />
                <MetricCard title="Karyawan Tdk Aktif" value={kpis.karyawanTidakAktif.toLocaleString()} icon={<UserRemoveIcon />} description="Karyawan dengan status tidak aktif." />
                <MetricCard title="Jumlah Posisi" value={kpis.posisiUnik.toLocaleString()} icon={<BriefcaseIcon />} description="Total posisi pekerjaan yang unik." />
            </div>

             {/* Filter Section */}
            <div className="bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700 flex flex-wrap items-center justify-start gap-4">
                 <h2 className="text-md font-semibold text-white mr-4">Pencarian & Filter:</h2>
                <div className="flex-grow">
                     <input type="text" placeholder="Cari berdasarkan Nama, NIK, atau Departemen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full max-w-xs px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-sm"/>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="statusFilter" className="text-sm font-medium text-slate-400">Status:</label>
                    <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-sm">
                        <option value="Semua">Semua</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                    </select>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700">
                     <h2 className="text-lg font-semibold mb-4 text-cyan-300">Distribusi Status</h2>
                     <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {statusChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                     </div>
                </div>
                <div className="lg:col-span-2 bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700">
                    <h2 className="text-lg font-semibold mb-4 text-cyan-300">Jumlah Karyawan per Posisi</h2>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                           <BarChart data={positionChartData.slice(0, 10)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} fontSize={10} interval={0} angle={-30} textAnchor="end" height={50} />
                                <YAxis tick={{ fill: '#9ca3af' }} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} formatter={(value: number) => [value, 'Karyawan']}/>
                                <Bar dataKey="Karyawan" fill="#818cf8" />
                           </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="lg:col-span-3 bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700">
                    <h2 className="text-lg font-semibold mb-4 text-cyan-300">Jumlah Karyawan per Departemen</h2>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                           <BarChart data={departmentChartData} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} fontSize={12} interval={0} angle={-45} textAnchor="end" />
                                <YAxis tick={{ fill: '#9ca3af' }} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} formatter={(value: number) => [value, 'Karyawan']}/>
                                <Bar dataKey="Karyawan" fill="#2dd4bf" />
                           </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredData.map(karyawan => (
                    <div key={karyawan.id} className="bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700 text-center flex flex-col items-center group transition-all duration-300 hover:border-cyan-500 hover:bg-slate-800">
                        {karyawan.foto_url ? (
                            <img src={karyawan.foto_url} alt={karyawan.nama} className="w-24 h-24 rounded-full object-cover border-4 border-slate-600 group-hover:border-cyan-600 transition-colors" />
                        ) : (
                            <div className="w-24 h-24 flex items-center justify-center bg-slate-700 rounded-full border-4 border-slate-600 group-hover:border-cyan-600 transition-colors">
                                <UserPlaceholderIcon className="w-12 h-12 text-slate-500" />
                            </div>
                        )}
                        <h3 className="mt-4 font-bold text-white text-md truncate w-full" title={karyawan.nama}>{karyawan.nama}</h3>
                        <p className="text-sm text-cyan-400 truncate w-full" title={karyawan.posisi}>{karyawan.posisi}</p>
                        <p className="text-xs text-slate-400 truncate w-full" title={karyawan.departemen}>{karyawan.departemen || '-'}</p>
                        <span className={`mt-2 px-2 py-0.5 text-xs font-semibold rounded-full ${karyawan.status === 'Aktif' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
                            {karyawan.status}
                        </span>
                         <button
                            onClick={() => setPreviewKaryawan(karyawan)}
                            className="mt-4 w-full bg-slate-700/80 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-300"
                        >
                            Lihat Detail
                        </button>
                    </div>
                ))}
            </div>

        </div>

       {/* --- Preview Modal --- */}
      {previewKaryawan && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 no-print" 
          aria-modal="true" 
          role="dialog"
          onClick={() => setPreviewKaryawan(null)}
        >
          <div 
            id="cv-preview"
            className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-5xl m-4 border border-slate-700/80 overflow-hidden relative print-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="printable-area bg-slate-800 text-slate-300 max-h-[90vh] overflow-y-auto">
                {logoUrl && (
                    <img src={logoUrl} alt="Watermark" className="absolute inset-0 w-1/2 h-1/2 object-contain m-auto opacity-5 pointer-events-none" />
                )}
                <header className="p-8 flex items-center justify-between border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                     {logoUrl ? (
                        <img src={logoUrl} alt="Company Logo" className="h-12 w-auto object-contain" />
                     ) : <div className="h-12"></div>}
                    <h1 className="text-2xl font-bold text-cyan-400">Portofolio Karyawan</h1>
                </header>
                
                <main className="flex flex-col md:flex-row">
                    {/* Left Column */}
                    <aside className="w-full md:w-1/3 bg-slate-900/50 p-8 space-y-6">
                        <div className="flex flex-col items-center">
                            {previewKaryawan.foto_url ? (
                                <img src={previewKaryawan.foto_url} alt={previewKaryawan.nama} className="w-32 h-32 rounded-full object-cover border-4 border-slate-600 shadow-lg" />
                            ) : (
                                <div className="w-32 h-32 flex items-center justify-center bg-slate-700 rounded-full border-4 border-slate-600 shadow-lg">
                                <UserPlaceholderIcon className="w-20 h-20 text-slate-500" />
                                </div>
                            )}
                            <h2 className="mt-4 text-2xl font-bold text-white text-center">{previewKaryawan.nama}</h2>
                            <p className="text-md text-cyan-400 text-center">{previewKaryawan.posisi}</p>
                        </div>
                        <div className="space-y-4 text-sm">
                            <h3 className="text-lg font-semibold text-cyan-400 border-b border-cyan-400/30 pb-1">Kontak & Alamat</h3>
                            <DetailItem label="Nomor HP" value={previewKaryawan.nomor_hp} />
                            <DetailItem label="Alamat KTP" value={previewKaryawan.alamat_ktp} />
                            <DetailItem label="Alamat Sekarang" value={previewKaryawan.alamat_sekarang} />
                            
                            <h3 className="text-lg font-semibold text-cyan-400 border-b border-cyan-400/30 pb-1 pt-4">Informasi Pribadi</h3>
                            <DetailItem label="Tempat, Tgl Lahir" value={`${previewKaryawan.tempat_lahir || ''}${previewKaryawan.tanggal_lahir ? `, ${new Date(previewKaryawan.tanggal_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}` : ''}`} />
                            <DetailItem label="Jenis Kelamin" value={previewKaryawan.jenis_kelamin} />
                            <DetailItem label="Agama" value={previewKaryawan.agama} />
                            <DetailItem label="Golongan Darah" value={previewKaryawan.golongan_darah} />
                            <DetailItem label="Status Perkawinan" value={previewKaryawan.status_perkawinan} />
                        </div>
                    </aside>
                    {/* Right Column */}
                    <section className="w-full md:w-2/3 p-8 space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-400 border-b border-cyan-400/30 pb-2 mb-4">Informasi Pekerjaan</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <DetailItem label="NIK" value={previewKaryawan.nik} />
                                <DetailItem label="Departemen" value={previewKaryawan.departemen} />
                                <DetailItem label="Divisi" value={previewKaryawan.divisi} />
                                <DetailItem label="Tanggal Bergabung" value={previewKaryawan.tanggal_bergabung ? new Date(previewKaryawan.tanggal_bergabung).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'} />
                                <DetailItem label="Masa Kontrak" value={previewKaryawan.masa_kontrak} />
                                <DetailItem label="Status" value={<span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full self-center w-fit ${previewKaryawan.status === 'Aktif' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>{previewKaryawan.status}</span>} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-400 border-b border-cyan-400/30 pb-2 mb-4">Data Keluarga</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <DetailItem label="Nama Ayah" value={previewKaryawan.nama_ayah} />
                                <DetailItem label="Pekerjaan Ayah" value={previewKaryawan.pekerjaan_ayah} />
                                <DetailItem label="Nama Ibu" value={previewKaryawan.nama_ibu} />
                                <DetailItem label="Pekerjaan Ibu" value={previewKaryawan.pekerjaan_ibu} />
                                <DetailItem label="Nama Pasangan" value={previewKaryawan.nama_pasangan} className="col-span-2"/>
                                <DetailItem label="Nama Anak ke-1" value={previewKaryawan.nama_anak1} />
                                <DetailItem label="Nama Anak ke-2" value={previewKaryawan.nama_anak2} />
                                <DetailItem label="Nama Anak ke-3" value={previewKaryawan.nama_anak3} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-400 border-b border-cyan-400/30 pb-2 mb-4">Riwayat Pendidikan</h3>
                             <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <DetailItem label="Pendidikan Terakhir" value={previewKaryawan.pendidikan_terakhir} className="col-span-2"/>
                                <DetailItem label="SD" value={previewKaryawan.pendidikan_sd} />
                                <DetailItem label="SMP" value={previewKaryawan.pendidikan_smp} />
                                <DetailItem label="SMA/SMK" value={previewKaryawan.pendidikan_sma} />
                                <DetailItem label="Universitas (S1)" value={previewKaryawan.pendidikan_s1} />
                                <DetailItem label="Fakultas/Jurusan (S1)" value={previewKaryawan.fakultas_s1} className="col-span-2"/>
                             </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-400 border-b border-cyan-400/30 pb-2 mb-4">Riwayat Pekerjaan Terakhir</h3>
                             <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <DetailItem label="Perusahaan" value={previewKaryawan.perusahaan_terakhir} />
                                <DetailItem label="Posisi" value={previewKaryawan.posisi_terakhir} />
                                <DetailItem label="Lama Bekerja" value={previewKaryawan.lama_bekerja_terakhir} />
                                <DetailItem label="Gaji Terakhir" value={previewKaryawan.gaji_terakhir ? `Rp ${previewKaryawan.gaji_terakhir.toLocaleString('id-ID')}` : '-'} />
                                <DetailItem label="Alamat Perusahaan" value={previewKaryawan.alamat_perusahaan_terakhir} className="col-span-2"/>
                                <DetailItem label="Alasan Berhenti" value={previewKaryawan.alasan_berhenti} className="col-span-2"/>
                             </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-400 border-b border-cyan-400/30 pb-2 mb-4">Lain - Lain</h3>
                             <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <DetailItem label="Ukuran Sepatu" value={previewKaryawan.ukuran_sepatu} />
                                <DetailItem label="Ukuran Baju" value={previewKaryawan.ukuran_baju} />
                                <DetailItem label="Hobi" value={previewKaryawan.hobi} className="col-span-2"/>
                                <DetailItem label="Tujuan Liburan Favorit" value={previewKaryawan.tujuan_liburan} className="col-span-2"/>
                                <DetailItem label="Moto Hari Ini" value={previewKaryawan.moto_hari_ini} className="col-span-2"/>
                             </div>
                        </div>
                    </section>
                </main>
            </div>
             {/* Footer Actions */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-700/80 flex justify-end gap-3 no-print">
                 <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Unduh PDF
                </button>
                <button 
                    onClick={() => setPreviewKaryawan(null)} 
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg text-sm"
                >
                    Tutup
                </button>
            </div>
          </div>
        </div>
        )}
      </>
    );
};

export default EmployeeDashboard;
