import React, { useState } from 'react';
import { Karyawan } from '../types';

interface KaryawanDataTableProps {
  data: Karyawan[];
  logoUrl: string | null;
  onEdit?: (karyawan: Karyawan) => void;
  onDelete?: (id: number, name: string) => void;
}

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


const KaryawanDataTable: React.FC<KaryawanDataTableProps> = ({ data, logoUrl, onEdit, onDelete }) => {
  const [previewKaryawan, setPreviewKaryawan] = useState<Karyawan | null>(null);
  
  const headers = [
    { key: 'foto', label: '' },
    { key: 'nama', label: 'Nama Lengkap' },
    { key: 'posisi', label: 'Posisi' },
    { key: 'departemen', label: 'Departemen' },
    { key: 'divisi', label: 'Divisi' },
    { key: 'nik', label: 'NIK' },
    { key: 'nomor_hp', label: 'Nomor HP' },
    { key: 'status', label: 'Status' },
  ];

  if (onEdit && onDelete) {
    headers.push({ key: 'actions', label: 'Aksi' });
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-cyan-300 uppercase bg-slate-700/50">
            <tr>
              {headers.map(header => (
                <th key={header.key} scope="col" className="px-4 py-3">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr 
                key={row.id} 
                className="border-b border-slate-700 hover:bg-slate-800/80 align-middle"
              >
                <td className="px-4 py-2">
                  {row.foto_url ? (
                    <img src={row.foto_url} alt={row.nama} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-slate-700 rounded-full">
                      <UserPlaceholderIcon />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-white">{row.nama}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.posisi}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.departemen || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.divisi || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.nik}</td>
                <td className="px-4 py-3 whitespace-nowrap">{row.nomor_hp || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${row.status === 'Aktif' ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'}`}>
                      {row.status}
                  </span>
                </td>
                {onEdit && onDelete && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setPreviewKaryawan(row)} 
                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                        title="Lihat Detail"
                        aria-label="Lihat Detail"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 7.523 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-7.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                      </button>
                      <button 
                        onClick={() => onEdit(row)} 
                        className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                        title="Edit Data"
                        aria-label="Edit Data"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                      </button>
                      <button 
                        onClick={() => onDelete(row.id, row.nama)} 
                        className="text-red-500 hover:text-red-400 transition-colors duration-200"
                        title="Hapus Data"
                        aria-label="Hapus Data"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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

export default KaryawanDataTable;
