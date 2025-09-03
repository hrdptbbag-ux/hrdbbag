import React, { useState, useMemo, useEffect, useRef } from 'react';
import { OperationalData, Karyawan, AdminView } from '../types';
import OperationalDataTable from './MaterialDistributionChart';
import KaryawanDataTable from './KaryawanDataTable';
import * as XLSX from 'xlsx';
import { DATA_CONFIG, ADMIN_CREDENTIALS } from '../config';

interface AdminPageProps {
  operationalData: OperationalData[];
  karyawanData: Karyawan[];
  onAddData: (newData: Omit<OperationalData, 'id'>) => Promise<void>;
  onUpdateData: (updatedData: OperationalData) => Promise<void>;
  onDeleteData: (date: string) => Promise<boolean>;
  onDeleteAll: () => Promise<boolean>;
  onAddBulkData: (newDataList: Omit<OperationalData, 'id'>[]) => Promise<void>;
  onAddKaryawan: (newKaryawan: Omit<Karyawan, 'id' | 'created_at'>) => Promise<void>;
  onUpdateKaryawan: (updatedKaryawan: Karyawan) => Promise<void>;
  onDeleteKaryawan: (id: number) => Promise<boolean>;
  onDeleteAllKaryawan: () => Promise<boolean>;
  onAddBulkKaryawan: (newKaryawanList: Omit<Karyawan, 'id' | 'created_at'>[]) => Promise<void>;
  onSetLogo: (logoUrl: string) => void;
  logoUrl: string | null;
  setNotification: (notification: { message: string; type: 'success' | 'error' } | null) => void;
}

// --- INITIAL STATES ---
const initialOperationalInputState = {
  date: new Date().toISOString().split('T')[0],
  pro: 0, stb: 0, bd: 0,
  ritase: 0, volume: 0, targetM3: DATA_CONFIG.DEFAULT_TARGET_M3,
};
const initialCalculatedState = {
    wt: 0, pa: 0, ua: 0, ma: 0, eu: 0, averageM3: 0, pencapaian: 0,
};
// Diurutkan sesuai alur pengisian data baru
const initialKaryawanInputState: Omit<Karyawan, 'id' | 'created_at'> = {
  // Informasi Pekerjaan
  departemen: 'Mining',
  divisi: 'Produksi',
  posisi: '',
  status: 'Aktif',
  tanggal_bergabung: new Date().toISOString().split('T')[0],
  masa_kontrak: '',
  foto_url: '',
  // Data Diri & Kontak
  nama: '',
  nik: '',
  alamat_ktp: '',
  alamat_sekarang: '',
  jenis_kelamin: 'Laki-laki',
  tempat_lahir: '',
  tanggal_lahir: '',
  agama: 'Islam',
  golongan_darah: 'Tidak Tahu',
  nomor_hp: '',
  // Keluarga
  status_perkawinan: 'Belum Menikah',
  nama_ayah: '',
  pekerjaan_ayah: '',
  nama_ibu: '',
  pekerjaan_ibu: '',
  nama_pasangan: '',
  nama_anak1: '',
  nama_anak2: '',
  nama_anak3: '',
  // Riwayat Pendidikan
  pendidikan_terakhir: 'SMA/SMK',
  pendidikan_sd: '',
  pendidikan_smp: '',
  pendidikan_sma: '',
  pendidikan_s1: '',
  fakultas_s1: '',
  // Riwayat Pekerjaan Terakhir
  perusahaan_terakhir: '',
  alamat_perusahaan_terakhir: '',
  alasan_berhenti: '',
  lama_bekerja_terakhir: '',
  posisi_terakhir: '',
  gaji_terakhir: 0,
  // Lain-lain
  ukuran_sepatu: '',
  ukuran_baju: 'L',
  hobi: '',
  tujuan_liburan: '',
  moto_hari_ini: '',
};

// --- FORM FIELD DEFINITIONS ---
const operationalInputFields = [
    { key: 'pro', label: 'PRO', step: '0.01' }, { key: 'stb', label: 'STB', step: '0.01' },
    { key: 'bd', label: 'BD', step: '0.01' }, { key: 'ritase', label: 'Ritase', step: '1' },
    { key: 'volume', label: 'Volume', step: '0.01' }, { key: 'targetM3', label: 'Target M3', step: '0.01' },
];

const karyawanInputFields = {
    informasiPekerjaan: [
        { key: 'departemen', label: 'Departemen', type: 'select', options: ['Crusher', 'Keamanan', 'HRGA', 'Mekanik', 'Fleet', 'Keuangan', 'Pengawas', 'Mining', 'Logistik'] },
        { key: 'divisi', label: 'Divisi', type: 'select', options: ['Produksi', 'HRGA', 'Workshop', 'General', 'Keuangan'] },
        { key: 'posisi', label: 'Posisi/Jabatan Saat Ini', type: 'text', required: true },
        { key: 'status', label: 'Status Karyawan', type: 'select', options: ['Aktif', 'Tidak Aktif'] },
        { key: 'tanggal_bergabung', label: 'Tanggal Bergabung', type: 'date' },
        { key: 'masa_kontrak', label: 'Masa Kontrak', type: 'text', placeholder: 'Contoh: 1 Tahun' },
        { key: 'foto_url', label: 'URL Foto', type: 'url', className: 'md:col-span-full' },
    ],
    dataDiri: [
        { key: 'nama', label: 'Nama Lengkap', type: 'text', className: 'md:col-span-2', required: true },
        { key: 'nik', label: 'NIK (Nomor KTP)', type: 'text', required: true },
        { key: 'alamat_ktp', label: 'Alamat (sesuai KTP)', type: 'textarea', className: 'md:col-span-2' },
        { key: 'alamat_sekarang', label: 'Alamat Sekarang', type: 'textarea', className: 'md:col-span-2' },
        { key: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'] },
        { key: 'tempat_lahir', label: 'Tempat Lahir', type: 'text' },
        { key: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date' },
        { key: 'agama', label: 'Agama', type: 'select', options: ['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Khonghucu'] },
        { key: 'golongan_darah', label: 'Gol. Darah', type: 'select', options: ['A', 'B', 'AB', 'O', 'Tidak Tahu']},
        { key: 'nomor_hp', label: 'Nomor HP', type: 'tel', placeholder: '08...' },
    ],
    keluarga: [
        { key: 'status_perkawinan', label: 'Status Perkawinan', type: 'select', options: ['Belum Menikah', 'Menikah', 'Cerai Hidup', 'Cerai Mati'], className: 'md:col-span-2' },
        { key: 'nama_ayah', label: 'Nama Ayah', type: 'text' },
        { key: 'pekerjaan_ayah', label: 'Pekerjaan Ayah', type: 'text' },
        { key: 'nama_ibu', label: 'Nama Ibu', type: 'text' },
        { key: 'pekerjaan_ibu', label: 'Pekerjaan Ibu', type: 'text' },
        { key: 'nama_pasangan', label: 'Nama Istri/Suami', type: 'text', className: 'md:col-span-2' },
        { key: 'nama_anak1', label: 'Nama Anak ke-1', type: 'text' },
        { key: 'nama_anak2', label: 'Nama Anak ke-2', type: 'text' },
        { key: 'nama_anak3', label: 'Nama Anak ke-3', type: 'text' },
    ],
    pendidikan: [
        { key: 'pendidikan_terakhir', label: 'Pendidikan Terakhir', type: 'select', options: ['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3'], className: 'md:col-span-full' },
        { key: 'pendidikan_sd', label: 'Nama SD', type: 'text' },
        { key: 'pendidikan_smp', label: 'Nama SMP', type: 'text' },
        { key: 'pendidikan_sma', label: 'Nama SMA/SMK', type: 'text' },
        { key: 'pendidikan_s1', label: 'Universitas (S1)', type: 'text' },
        { key: 'fakultas_s1', label: 'Fakultas/Jurusan (S1)', type: 'text', className: 'md:col-span-2' },
    ],
    riwayatPekerjaan: [
        { key: 'perusahaan_terakhir', label: 'Nama Perusahaan Terakhir', type: 'text', className: 'md:col-span-2' },
        { key: 'alamat_perusahaan_terakhir', label: 'Alamat Perusahaan Terakhir', type: 'textarea', className: 'md:col-span-2' },
        { key: 'alasan_berhenti', label: 'Alasan Berhenti', type: 'textarea', className: 'md:col-span-2' },
        { key: 'lama_bekerja_terakhir', label: 'Lama Pekerjaan', type: 'text', placeholder: 'Contoh: 2 Tahun' },
        { key: 'posisi_terakhir', label: 'Posisi/Jabatan Terakhir', type: 'text' },
        { key: 'gaji_terakhir', label: 'Gaji Terakhir (Rp)', type: 'number', step: '1000' },
    ],
    lainLain: [
        { key: 'ukuran_sepatu', label: 'Ukuran Sepatu Safety', type: 'text' },
        { key: 'ukuran_baju', label: 'Ukuran Baju PDH', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Lainnya'] },
        { key: 'hobi', label: 'Hobi', type: 'text' },
        { key: 'tujuan_liburan', label: 'Tujuan Liburan/Hiburan', type: 'text' },
        { key: 'moto_hari_ini', label: 'Kata-kata Hari Ini', type: 'textarea', className: 'md:col-span-full' },
    ]
};

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <>
        <h3 className="md:col-span-full text-lg font-semibold text-cyan-400 mt-6 mb-2 border-b border-slate-600 pb-2">{title}</h3>
        {children}
    </>
);

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);


const AdminPage: React.FC<AdminPageProps> = (props) => {
  const { 
    operationalData, karyawanData, onAddData, onUpdateData, onDeleteData, 
    onDeleteAll, onAddBulkData, onAddKaryawan, onUpdateKaryawan, onDeleteKaryawan, onDeleteAllKaryawan, 
    onAddBulkKaryawan, onSetLogo, logoUrl, setNotification
  } = props;
  
  const [currentView, setCurrentView] = useState<AdminView>('OPERATIONAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- Operational State ---
  const [opFormData, setOpFormData] = useState(initialOperationalInputState);
  const [opCalculatedData, setOpCalculatedData] = useState(initialCalculatedState);
  const [opFilters, setOpFilters] = useState({ startDate: '', endDate: '' });
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // --- Karyawan State ---
  const [karyawanFormData, setKaryawanFormData] = useState(initialKaryawanInputState);
  const [editingKaryawan, setEditingKaryawan] = useState<Karyawan | null>(null);
  
  // --- Management State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'OPERATIONAL' | 'KARYAWAN' | null>(null);
  const [authCreds, setAuthCreds] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    operational: { step: 'idle' as 'idle' | 'confirm', input: '' },
    karyawan: { step: 'idle' as 'idle' | 'confirm', input: '' },
  });

  const isAuthValid = useMemo(() => 
    authCreds.username === ADMIN_CREDENTIALS.USERNAME && authCreds.password === ADMIN_CREDENTIALS.PASSWORD,
    [authCreds]
  );

  // --- OPERATIONAL LOGIC ---
  useEffect(() => {
    const { pro, stb, bd, volume, targetM3, ritase } = opFormData;
    const wt = pro + stb + bd;
    const pa = wt > 0 ? ((pro + stb) / wt) * 100 : 0;
    const ma = pa;
    const ua = (pro + stb) > 0 ? (pro / (pro + stb)) * 100 : 0;
    const eu = wt > 0 ? (pro / wt) * 100 : 0;
    const averageM3 = ritase > 0 ? volume / ritase : 0;
    const pencapaian = targetM3 > 0 ? (volume / targetM3) * 100 : 0;
    setOpCalculatedData({ wt, pa, ua, ma, eu, averageM3, pencapaian });
  }, [opFormData]);

  const handleOpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOpFormData(prev => ({ ...prev, [name]: name === 'date' ? value : Number(value) }));
  };

  const handleOpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const completeData = { ...opFormData, ...opCalculatedData };
    try {
        if (editingDate) {
            const originalItem = operationalData.find(item => item.date === editingDate);
            if (originalItem) await onUpdateData({ ...completeData, id: originalItem.id });
             setNotification({ message: 'Data operasional berhasil diperbarui.', type: 'success' });
        } else {
            await onAddData(completeData);
            setNotification({ message: 'Data operasional berhasil ditambahkan.', type: 'success' });
        }
        setOpFormData(initialOperationalInputState);
        setEditingDate(null);
    } catch (error: any) {
        console.error("Failed to save operational data:", error);
        let dbErrorMessage = 'Terjadi kesalahan tak terduga.';
        if (error && typeof error === 'object' && typeof error.message === 'string') {
            dbErrorMessage = error.message;
        } else if (typeof error === 'string') {
            dbErrorMessage = error;
        }
        const finalMessage = `Gagal menyimpan data operasional: ${dbErrorMessage}`;
        setNotification({ message: finalMessage, type: 'error' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleOpEdit = (item: OperationalData) => {
    setEditingDate(item.date);
    const { date, pro, stb, bd, ritase, volume, targetM3 } = item;
    setOpFormData({ date, pro, stb, bd, ritase, volume, targetM3 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleOpDelete = async (date: string) => {
    if (window.confirm(`Yakin ingin menghapus data tanggal ${date}?`)) {
        const success = await onDeleteData(date);
        if (success) {
            setNotification({ message: 'Data berhasil dihapus.', type: 'success' });
        } else {
            setNotification({ message: 'Gagal menghapus data. Periksa konsol untuk detail.', type: 'error' });
        }
    }
  };
  
  const filteredOperationalData = useMemo(() => {
    if (!opFilters.startDate && !opFilters.endDate) return operationalData;
    const start = opFilters.startDate ? new Date(opFilters.startDate).getTime() : 0;
    const end = opFilters.endDate ? new Date(opFilters.endDate).getTime() + 86399999 : Infinity;
    return operationalData.filter(d => {
        const itemDate = new Date(d.date).getTime();
        return itemDate >= start && itemDate <= end;
    });
  }, [operationalData, opFilters]);

  const handleDownloadOpTemplate = () => {
    const headers = ['date', 'pro', 'stb', 'bd', 'ritase', 'volume', 'targetM3'];
    const exampleData = [
      { date: '2025-07-20', pro: 18, stb: 2, bd: 4, ritase: 100, volume: 1100, targetM3: 1050 },
      { date: '2025-07-21', pro: 20, stb: 1, bd: 3, ritase: 110, volume: 1250, targetM3: 1050 },
      { date: '2025-07-22', pro: 15, stb: 5, bd: 4, ritase: 90, volume: 950, targetM3: 1050 }
    ];
    const wsData = [headers, ...exampleData.map(row => headers.map(header => row[header as keyof typeof row]))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Operasional");
    XLSX.writeFile(wb, "template_operasional_bbag.xlsx");
  };

  const handleOpFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            setIsSubmitting(true);
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) throw new Error("File Excel kosong.");
            
            const requiredHeaders = ['date', 'pro', 'stb', 'bd', 'ritase', 'volume', 'targetM3'];
            const fileHeaders = Object.keys(json[0]);
            for (const header of requiredHeaders) {
                if (!fileHeaders.includes(header)) {
                    throw new Error(`Kolom wajib "${header}" tidak ditemukan.`);
                }
            }

            const newDataList = json.map((row, index) => {
                if (!row.date) throw new Error(`Baris ${index + 2}: Kolom 'date' wajib diisi.`);
                
                const pro = Number(row.pro) || 0;
                const stb = Number(row.stb) || 0;
                const bd = Number(row.bd) || 0;
                const ritase = Number(row.ritase) || 0;
                const volume = Number(row.volume) || 0;
                const targetM3 = Number(row.targetM3) || DATA_CONFIG.DEFAULT_TARGET_M3;
                
                // Handle Excel date format
                const date = row.date instanceof Date 
                    ? new Date(row.date.getTime() - (row.date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] 
                    : String(row.date);

                const wt = pro + stb + bd;
                const pa = wt > 0 ? ((pro + stb) / wt) * 100 : 0;
                const ua = (pro + stb) > 0 ? (pro / (pro + stb)) * 100 : 0;
                const eu = wt > 0 ? (pro / wt) * 100 : 0;
                const averageM3 = ritase > 0 ? volume / ritase : 0;
                const pencapaian = targetM3 > 0 ? (volume / targetM3) * 100 : 0;

                return {
                    date, pro, stb, bd, ritase, volume, targetM3,
                    wt, pa, ua, ma: pa, eu, averageM3, pencapaian
                };
            });
            
            await onAddBulkData(newDataList);
            setNotification({ message: `${newDataList.length} data operasional berhasil diunggah.`, type: 'success' });

        } catch (error: any) {
            console.error("Gagal mengunggah data operasional:", error);
            setNotification({ message: `Gagal mengunggah file: ${error.message}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsBinaryString(file);
  };


  // --- KARYAWAN LOGIC ---
  const handleKaryawanInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumberInput = type === 'number';
    setKaryawanFormData(prev => ({...prev, [name]: isNumberInput ? (value === '' ? '' : Number(value)) : value}));
  };
  
  const handleKaryawanSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        if (editingKaryawan) {
             const dataToUpdate: Karyawan = {
                ...editingKaryawan,
                ...karyawanFormData,
                gaji_terakhir: Number(karyawanFormData.gaji_terakhir) || 0,
            };
            await onUpdateKaryawan(dataToUpdate);
            setNotification({ message: `Data ${editingKaryawan.nama} berhasil diperbarui.`, type: 'success' });
            setEditingKaryawan(null);
        } else {
            const dataToAdd = {
                ...karyawanFormData,
                gaji_terakhir: Number(karyawanFormData.gaji_terakhir) || 0,
            };
            await onAddKaryawan(dataToAdd);
            setNotification({ message: 'Data karyawan baru berhasil ditambahkan.', type: 'success' });
        }
        setKaryawanFormData(initialKaryawanInputState);
      } catch (error: any) {
           console.error("Failed to save employee data:", error);
           let dbErrorMessage = 'Terjadi kesalahan tak terduga.';
           if (error && typeof error === 'object' && typeof error.message === 'string') {
               dbErrorMessage = error.message;
           } else if (typeof error === 'string') {
               dbErrorMessage = error;
           }
           const finalMessage = `Gagal menyimpan data karyawan: ${dbErrorMessage}`;
           setNotification({ message: finalMessage, type: 'error' });
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleKaryawanEdit = (karyawan: Karyawan) => {
    setEditingKaryawan(karyawan);
    
    const formDataFromKaryawan: any = {};
    Object.keys(initialKaryawanInputState).forEach(key => {
        const k = key as keyof Karyawan;
        const value = karyawan[k];
        formDataFromKaryawan[k] = value !== null && value !== undefined ? value : initialKaryawanInputState[k as keyof typeof initialKaryawanInputState];
    });

    formDataFromKaryawan.tanggal_bergabung = karyawan.tanggal_bergabung ? new Date(karyawan.tanggal_bergabung).toISOString().split('T')[0] : '';
    formDataFromKaryawan.tanggal_lahir = karyawan.tanggal_lahir ? new Date(karyawan.tanggal_lahir).toISOString().split('T')[0] : '';
    
    setKaryawanFormData(formDataFromKaryawan);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKaryawanDelete = async (id: number, name: string) => {
    if (window.confirm(`Yakin ingin menghapus data karyawan "${name}"?`)) {
        const success = await onDeleteKaryawan(id);
        if (success) {
            setNotification({ message: 'Data karyawan berhasil dihapus.', type: 'success' });
        } else {
            setNotification({ message: 'Gagal menghapus data karyawan.', type: 'error' });
        }
    }
  };

  const handleDownloadTemplate = () => {
    const headers = Object.keys(initialKaryawanInputState);
    const exampleData = [
        { ...initialKaryawanInputState, nama: "Budi Santoso", nik: "3201234567890001", posisi: "Operator Excavator", departemen: "Mining", divisi: "Produksi", status: "Aktif", tanggal_bergabung: "2022-08-15", nomor_hp: "081234567890", tempat_lahir: "Bandung", tanggal_lahir: "1990-05-20", jenis_kelamin: "Laki-laki", agama: "Islam", status_perkawinan: "Menikah", pendidikan_terakhir: "SMA/SMK" },
        { ...initialKaryawanInputState, nama: "Siti Aminah", nik: "3202345678900002", posisi: "Staff HRGA", departemen: "HRGA", divisi: "HRGA", status: "Aktif", tanggal_bergabung: "2023-01-20", nomor_hp: "082345678901", tempat_lahir: "Jakarta", tanggal_lahir: "1995-11-12", jenis_kelamin: "Perempuan", agama: "Islam", status_perkawinan: "Belum Menikah", pendidikan_terakhir: "S1" },
        { ...initialKaryawanInputState, nama: "Agus Wijaya", nik: "3203456789000003", posisi: "Mekanik Senior", departemen: "Mekanik", divisi: "Workshop", status: "Aktif", tanggal_bergabung: "2021-05-10", nomor_hp: "083456789012", tempat_lahir: "Surabaya", tanggal_lahir: "1988-03-25", jenis_kelamin: "Laki-laki", agama: "Kristen Protestan", status_perkawinan: "Menikah", pendidikan_terakhir: "SMK" }
    ];

    const wsData = [headers, ...exampleData.map(row => headers.map(header => row[header as keyof typeof row] ?? ""))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Karyawan");
    XLSX.writeFile(wb, "template_karyawan_bbag.xlsx");
};

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            setIsSubmitting(true);
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) {
                throw new Error("File Excel kosong atau format tidak sesuai.");
            }
            
            const requiredHeaders = ['nama', 'nik', 'posisi'];
            const fileHeaders = Object.keys(json[0]);
            for (const header of requiredHeaders) {
                if (!fileHeaders.includes(header)) {
                    throw new Error(`Kolom wajib "${header}" tidak ditemukan di file Excel.`);
                }
            }

            const newKaryawanList: Omit<Karyawan, 'id' | 'created_at'>[] = json.map((row, index) => {
                if (!row.nama || !row.nik || !row.posisi) {
                    throw new Error(`Baris ${index + 2}: Kolom 'nama', 'nik', dan 'posisi' wajib diisi.`);
                }
                
                const formatDate = (date: any): string | undefined => {
                    if (date instanceof Date && !isNaN(date.getTime())) {
                        const d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                        return d.toISOString().split('T')[0];
                    }
                    return undefined;
                };

                const processedRow = { ...initialKaryawanInputState };
                for (const key in initialKaryawanInputState) {
                    if (row[key] !== undefined && row[key] !== null) {
                        // @ts-ignore
                        processedRow[key] = row[key];
                    }
                }

                return {
                    ...processedRow,
                    tanggal_bergabung: formatDate(row.tanggal_bergabung) || new Date().toISOString().split('T')[0],
                    tanggal_lahir: formatDate(row.tanggal_lahir),
                    gaji_terakhir: Number(row.gaji_terakhir) || 0,
                };
            });
            
            await onAddBulkKaryawan(newKaryawanList);
            setNotification({ message: `${newKaryawanList.length} data karyawan berhasil diunggah.`, type: 'success' });

        } catch (error: any) {
            console.error("Failed to upload employee data:", error);
            setNotification({ message: `Gagal mengunggah file: ${error.message}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsBinaryString(file);
};


  // --- MANAGEMENT LOGIC ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const result = event.target?.result as string;
        onSetLogo(result);
        setNotification({ message: 'Logo perusahaan berhasil diperbarui.', type: 'success' });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };
  
  const handleBackupAllData = () => {
    try {
        const opSheet = XLSX.utils.json_to_sheet(operationalData);
        const karySheet = XLSX.utils.json_to_sheet(karyawanData);
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, opSheet, 'Data Operasional');
        XLSX.utils.book_append_sheet(workbook, karySheet, 'Data Karyawan');
        
        XLSX.writeFile(workbook, `Backup_PT_BBAG_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error("Failed to backup data:", error);
        setNotification({ message: 'Gagal membuat file backup.', type: 'error' });
    }
  };

  const openDeleteModal = (type: 'OPERATIONAL' | 'KARYAWAN') => {
    setDeleteType(type);
    setIsDeleteModalOpen(true);
    setAuthCreds({ username: '', password: '' });
    setAuthError('');
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteType(null);
    setDeleteConfirmation({
        operational: { step: 'idle', input: '' },
        karyawan: { step: 'idle', input: '' },
    });
  };
  
  const handleConfirmDelete = async () => {
    if (!isAuthValid) {
        setAuthError('Username atau password salah.');
        return;
    }
    
    const actionText = deleteType === 'OPERATIONAL' 
        ? 'semua data operasional' 
        : 'semua data karyawan';
        
    if (window.confirm(`INI AKAN MENGHAPUS PERMANEN ${actionText}. Anda benar-benar yakin?`)) {
        setIsSubmitting(true);
        let success = false;
        try {
            if (deleteType === 'OPERATIONAL') {
                success = await onDeleteAll();
            } else if (deleteType === 'KARYAWAN') {
                success = await onDeleteAllKaryawan();
            }

            if (success) {
                setNotification({ message: `Berhasil menghapus ${actionText}.`, type: 'success' });
                closeDeleteModal();
            } else {
                setNotification({ message: `Gagal menghapus ${actionText}. Periksa konsol untuk detail.`, type: 'error' });
            }
        } catch (error) { // Catch any unexpected errors from the async calls
            console.error(`Unexpected error during mass delete of ${actionText}:`, error);
            setNotification({ message: `Terjadi kesalahan tak terduga saat menghapus ${actionText}.`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    }
  };
  
  // --- COMMON UI LOGIC ---
  const renderTabs = () => (
    <div className="mb-6 border-b border-slate-700 no-print">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button onClick={() => setCurrentView('OPERATIONAL')} className={`${currentView === 'OPERATIONAL' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>
                Data Operasional
            </button>
            <button onClick={() => setCurrentView('EMPLOYEES')} className={`${currentView === 'EMPLOYEES' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>
                Data Karyawan
            </button>
            <button onClick={() => setCurrentView('MANAGEMENT')} className={`${currentView === 'MANAGEMENT' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>
                Manajemen
            </button>
        </nav>
    </div>
  );

  const renderKaryawanFormField = (field: any) => {
    const { key, label, type, options, placeholder, className, required } = field;
    return (
        <div key={key} className={className || ''}>
            <label htmlFor={key} className="block text-sm font-medium text-slate-400">{label}</label>
            {type === 'select' ? (
                <select id={key} name={key} value={karyawanFormData[key as keyof typeof karyawanFormData] as string} onChange={handleKaryawanInputChange} className="mt-1 w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500">
                    {options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <textarea id={key} name={key} value={karyawanFormData[key as keyof typeof karyawanFormData] as string} onChange={handleKaryawanInputChange} className="mt-1 w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" rows={2} placeholder={placeholder || ''}></textarea>
            ) : (
                <input type={type} id={key} name={key} value={karyawanFormData[key as keyof typeof karyawanFormData] as any} onChange={handleKaryawanInputChange} className="mt-1 w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" required={required} placeholder={placeholder || ''} />
            )}
        </div>
    );
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-cyan-300 no-print">Admin - Manajemen Data</h1>
      {renderTabs()}

      {/* --- OPERATIONAL VIEW --- */}
      {currentView === 'OPERATIONAL' && (
        <div className="space-y-8">
          <section className="bg-slate-800/60 p-6 rounded-xl shadow-lg border border-slate-700 no-print">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {editingDate ? `Edit Data Tanggal ${new Date(editingDate).toLocaleDateString('id-ID')}` : 'Input Data Operasional Baru'}
            </h2>
            <form onSubmit={handleOpSubmit} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="col-span-full lg:col-span-1">
                    <label htmlFor="date" className="block text-sm font-medium text-slate-400 capitalize">Tanggal</label>
                    <input type="date" id="date" name="date" value={opFormData.date} onChange={handleOpInputChange} className="mt-1 w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" required disabled={!!editingDate} />
                </div>
                {operationalInputFields.map(({ key, label, step }) => (
                    <div key={key}> <label htmlFor={key} className="block text-sm font-medium text-slate-400">{label}</label> <input type="number" id={key} name={key} value={opFormData[key as keyof typeof opFormData]} onChange={handleOpInputChange} className="mt-1 w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500" required step={step} /> </div>
                ))}
                <div className="col-span-full border-t border-slate-700 my-4"></div>
                <h3 className="col-span-full text-lg font-semibold text-cyan-400 -mt-2 mb-2">Metrik Terkalkulasi</h3>
                {Object.entries({ 'WT (Jam)': opCalculatedData.wt, 'PA (%)': opCalculatedData.pa, 'UA (%)': opCalculatedData.ua, 'MA (%)': opCalculatedData.ma, 'EU (%)': opCalculatedData.eu, 'Average (m³)': opCalculatedData.averageM3, 'Pencapaian (%)': opCalculatedData.pencapaian }).map(([label, value]) => (
                    <div key={label}> <label className="block text-sm font-medium text-slate-400">{label}</label> <input type="text" value={value.toFixed(2)} className="mt-1 w-full px-3 py-2 text-cyan-300 bg-slate-900/50 border border-slate-700 rounded-lg cursor-not-allowed" disabled /> </div>
                ))}
                <div className="col-span-full flex justify-end items-end gap-3 pt-4">
                    {editingDate && <button type="button" onClick={() => { setEditingDate(null); setOpFormData(initialOperationalInputState); }} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg">Batal</button>}
                    <button type="submit" disabled={isSubmitting} className={`${editingDate ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white font-bold py-2 px-6 rounded-lg disabled:bg-slate-500`}>
                        {isSubmitting ? 'Menyimpan...' : (editingDate ? 'Update Data' : 'Tambah Data')}
                    </button>
                </div>
            </form>
          </section>

          <section className="bg-slate-800/60 p-6 rounded-xl shadow-lg border border-slate-700 no-print">
            <h2 className="text-xl font-semibold mb-4 text-white">Input Data Operasional Massal</h2>
            <p className="text-sm text-slate-400 mb-4">Unggah data operasional beberapa hari sekaligus menggunakan file Excel. Unduh template terlebih dahulu untuk memastikan format yang benar.</p>
            <div className="flex flex-wrap gap-4">
                <button onClick={handleDownloadOpTemplate} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Unduh Template
                </button>
                <label htmlFor="op-upload" className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors duration-300">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Unggah Excel
                </label>
                <input id="op-upload" ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls" onChange={handleOpFileUpload} />
            </div>
          </section>
          
          <section id="operational-data-section" className="bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-cyan-300">Log Data Operasional ({filteredOperationalData.length} entri)</h2>
              <button onClick={() => window.print()} className="no-print inline-flex items-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Unduh PDF
              </button>
            </div>
            <OperationalDataTable data={filteredOperationalData} onEdit={handleOpEdit} onDelete={handleOpDelete} />
          </section>

        </div>
      )}

      {/* --- EMPLOYEES VIEW --- */}
      {currentView === 'EMPLOYEES' && (
        <div className="space-y-8">
            <section className="bg-slate-800/60 p-6 rounded-xl shadow-lg border border-slate-700 no-print">
                <h2 className="text-xl font-semibold mb-4 text-white">
                     {editingKaryawan ? `Edit Data Karyawan: ${editingKaryawan.nama}` : 'Input Data Karyawan Baru'}
                </h2>
                <form onSubmit={handleKaryawanSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormSection title="Informasi Pekerjaan">{karyawanInputFields.informasiPekerjaan.map(renderKaryawanFormField)}</FormSection>
                    <FormSection title="Data Diri & Kontak">{karyawanInputFields.dataDiri.map(renderKaryawanFormField)}</FormSection>
                    <FormSection title="Data Keluarga">{karyawanInputFields.keluarga.map(renderKaryawanFormField)}</FormSection>
                    <FormSection title="Riwayat Pendidikan">{karyawanInputFields.pendidikan.map(renderKaryawanFormField)}</FormSection>
                    <FormSection title="Riwayat Pekerjaan Terakhir">{karyawanInputFields.riwayatPekerjaan.map(renderKaryawanFormField)}</FormSection>
                    <FormSection title="Lain-lain">{karyawanInputFields.lainLain.map(renderKaryawanFormField)}</FormSection>
                    
                     <div className="md:col-span-full flex justify-end items-end gap-3 pt-4">
                         {editingKaryawan && (
                            <button type="button" onClick={() => { setEditingKaryawan(null); setKaryawanFormData(initialKaryawanInputState); }} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg">
                                Batal
                            </button>
                        )}
                        <button type="submit" disabled={isSubmitting} className={`${editingKaryawan ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white font-bold py-2 px-6 rounded-lg disabled:bg-slate-500`}>
                            {isSubmitting ? 'Menyimpan...' : (editingKaryawan ? 'Update Data' : 'Tambah Data')}
                        </button>
                    </div>
                </form>
            </section>

            <section className="bg-slate-800/60 p-6 rounded-xl shadow-lg border border-slate-700 no-print">
                <h2 className="text-xl font-semibold mb-4 text-white">Input Data Massal</h2>
                <p className="text-sm text-slate-400 mb-4">Unggah data beberapa karyawan sekaligus menggunakan file Excel. Unduh template terlebih dahulu untuk memastikan format yang benar.</p>
                <div className="flex flex-wrap gap-4">
                    <button onClick={handleDownloadTemplate} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Unduh Template
                    </button>
                    <label htmlFor="karyawan-upload" className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors duration-300">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Unggah Excel
                    </label>
                    <input id="karyawan-upload" ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                </div>
            </section>

            <section className="bg-slate-800/60 p-4 rounded-xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-semibold mb-4 text-cyan-300">Daftar Karyawan ({karyawanData.length} orang)</h2>
                <KaryawanDataTable 
                    data={karyawanData} 
                    logoUrl={logoUrl} 
                    onEdit={handleKaryawanEdit}
                    onDelete={handleKaryawanDelete}
                />
            </section>
        </div>
      )}

      {/* --- MANAGEMENT VIEW --- */}
      {currentView === 'MANAGEMENT' && (
        <div className="space-y-8 no-print">
          <section className="bg-slate-800/60 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Logo Perusahaan</h2>
            <p className="text-sm text-slate-400 mb-4">Unggah logo perusahaan untuk ditampilkan di header aplikasi. Logo akan disimpan di perangkat Anda.</p>
            <label htmlFor="logo-upload" className="inline-flex items-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer transition-colors duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Pilih Logo
            </label>
            <input id="logo-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml, image/webp" onChange={handleLogoUpload} />
          </section>

          <section className="bg-slate-800/60 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Cadangkan Data</h2>
            <p className="text-sm text-slate-400 mb-4">Unduh semua data operasional dan data karyawan dalam satu file Excel (.xlsx).</p>
            <button onClick={handleBackupAllData} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Backup Semua Data (Excel)
            </button>
          </section>
          
          <section className="bg-red-900/20 p-6 rounded-xl shadow-lg border-2 border-red-500/50 space-y-6">
              <div>
                  <h2 className="text-xl font-semibold mb-2 text-red-300">
                      <WarningIcon />
                      Zona Berbahaya
                  </h2>
                  <p className="text-sm text-slate-400">
                      Tindakan di bagian ini akan mengakibatkan kehilangan data secara permanen dan tidak dapat diurungkan. Harap lanjutkan dengan sangat hati-hati.
                  </p>
              </div>
              
              {/* Operational Data Deletion */}
              <div className="bg-slate-800/40 p-4 rounded-lg border border-red-500/30">
                  <h3 className="font-semibold text-white">Hapus Semua Data Operasional</h3>
                  <p className="text-sm text-slate-400 mt-1">
                      Tindakan ini akan menghapus seluruh catatan log operasional dari database.
                  </p>
                  {deleteConfirmation.operational.step === 'idle' ? (
                      <button 
                          onClick={() => setDeleteConfirmation(p => ({ ...p, operational: { ...p.operational, step: 'confirm' }}))}
                          className="mt-4 inline-flex items-center bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                      >
                          Hapus Data Operasional...
                      </button>
                  ) : (
                      <div className="mt-4 space-y-3">
                          <label htmlFor="op-delete-confirm" className="block text-sm font-medium text-yellow-300">
                              Untuk konfirmasi, ketik <code className="bg-black/50 px-1 py-0.5 rounded-sm">hapus semua data operasional</code> di bawah ini:
                          </label>
                          <input
                              id="op-delete-confirm"
                              type="text"
                              value={deleteConfirmation.operational.input}
                              onChange={(e) => setDeleteConfirmation(p => ({...p, operational: { ...p.operational, input: e.target.value }}))}
                              className="w-full max-w-sm px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                              autoComplete="off"
                          />
                          <div className="flex gap-3">
                              <button 
                                  onClick={() => openDeleteModal('OPERATIONAL')}
                                  disabled={deleteConfirmation.operational.input !== 'hapus semua data operasional'}
                                  className="inline-flex items-center bg-red-800 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                              >
                                  Konfirmasi Hapus
                              </button>
                              <button 
                                  onClick={() => setDeleteConfirmation(p => ({ ...p, operational: { step: 'idle', input: '' }}))}
                                  className="inline-flex items-center bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                              >
                                  Batal
                              </button>
                          </div>
                      </div>
                  )}
              </div>

              {/* Karyawan Data Deletion */}
              <div className="bg-slate-800/40 p-4 rounded-lg border border-red-500/30">
                  <h3 className="font-semibold text-white">Hapus Semua Data Karyawan</h3>
                  <p className="text-sm text-slate-400 mt-1">
                      Tindakan ini akan menghapus seluruh data karyawan dari database.
                  </p>
                  {deleteConfirmation.karyawan.step === 'idle' ? (
                      <button 
                          onClick={() => setDeleteConfirmation(p => ({ ...p, karyawan: { ...p.karyawan, step: 'confirm' }}))}
                          className="mt-4 inline-flex items-center bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                      >
                          Hapus Data Karyawan...
                      </button>
                  ) : (
                      <div className="mt-4 space-y-3">
                          <label htmlFor="karyawan-delete-confirm" className="block text-sm font-medium text-yellow-300">
                              Untuk konfirmasi, ketik <code className="bg-black/50 px-1 py-0.5 rounded-sm">hapus semua data karyawan</code> di bawah ini:
                          </label>
                          <input
                              id="karyawan-delete-confirm"
                              type="text"
                              value={deleteConfirmation.karyawan.input}
                              onChange={(e) => setDeleteConfirmation(p => ({...p, karyawan: { ...p.karyawan, input: e.target.value }}))}
                              className="w-full max-w-sm px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                              autoComplete="off"
                          />
                          <div className="flex gap-3">
                              <button 
                                  onClick={() => openDeleteModal('KARYAWAN')}
                                  disabled={deleteConfirmation.karyawan.input !== 'hapus semua data karyawan'}
                                  className="inline-flex items-center bg-red-800 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                              >
                                  Konfirmasi Hapus
                              </button>
                              <button 
                                  onClick={() => setDeleteConfirmation(p => ({ ...p, karyawan: { step: 'idle', input: '' }}))}
                                  className="inline-flex items-center bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                              >
                                  Batal
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </section>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" aria-modal="true" role="dialog">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 border border-slate-700">
            <h2 className="text-lg font-bold text-red-400">Konfirmasi Penghapusan Data</h2>
            <p className="text-sm text-slate-300 mt-2 mb-4">
              Untuk melanjutkan, masukkan kredensial admin Anda. Tindakan ini akan menghapus permanen semua data {deleteType === 'OPERATIONAL' ? 'operasional' : 'karyawan'}.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="auth-username" className="block text-sm font-medium text-slate-400">Username</label>
                <input 
                  type="text" 
                  id="auth-username" 
                  autoComplete="username"
                  value={authCreds.username} 
                  onChange={(e) => { setAuthCreds(p => ({...p, username: e.target.value})); setAuthError(''); }}
                  className="mt-1 w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="block text-sm font-medium text-slate-400">Password</label>
                <input 
                  type="password" 
                  id="auth-password"
                  autoComplete="current-password"
                  value={authCreds.password} 
                  onChange={(e) => { setAuthCreds(p => ({...p, password: e.target.value})); setAuthError(''); }}
                  className="mt-1 w-full px-3 py-2 text-white bg-slate-700 border border-slate-600 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              {authError && <p className="text-sm text-red-400 text-center">{authError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeDeleteModal} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg">
                Batal
              </button>
              <button 
                onClick={handleConfirmDelete} 
                disabled={!isAuthValid || isSubmitting}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg"
              >
                {isSubmitting ? 'Menghapus...' : 'Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
