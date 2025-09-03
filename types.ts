export interface OperationalData {
  id?: number;          // Primary key (dari database)
  date: string;       // Tanggal (YYYY-MM-DD)
  pro: number;        // ID Proyek/Unit (0 jika kosong)
  stb: number;        // Standby (jam)
  bd: number;         // Breakdown (jam)
  wt: number;         // Waktu Tunggu (jam)
  pa: number;         // Physical Availability (%)
  ua: number;         // Use of Availability (%)
  ma: number;         // Mechanical Availability (%)
  eu: number;         // Effective Utilization (%)
  ritase: number;     // Jumlah perjalanan/trip
  volume: number;     // Volume (m³)
  averageM3: number;  // Rata-rata Volume per Ritase (m³)
  targetM3: number;   // Target Volume (m³)
  pencapaian: number; // Pencapaian Target (%)
}

export interface Karyawan {
  id: number;
  created_at?: string;

  // --- Informasi Pekerjaan ---
  departemen?: 'Crusher' | 'Keamanan' | 'HRGA' | 'Mekanik' | 'Fleet' | 'Keuangan' | 'Pengawas' | 'Mining' | 'Logistik';
  divisi?: 'Produksi' | 'HRGA' | 'Workshop' | 'General' | 'Keuangan';
  posisi: string;
  status: 'Aktif' | 'Tidak Aktif';
  tanggal_bergabung: string;
  masa_kontrak?: string;
  foto_url?: string;

  // --- Data Diri & Kontak ---
  nama: string;
  nik: string;
  alamat_ktp?: string;
  alamat_sekarang?: string; 
  jenis_kelamin?: 'Laki-laki' | 'Perempuan';
  tempat_lahir?: string;
  tanggal_lahir?: string;
  agama?: 'Islam' | 'Kristen Protestan' | 'Kristen Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu';
  golongan_darah?: 'A' | 'B' | 'AB' | 'O' | 'Tidak Tahu';
  nomor_hp?: string;

  // --- Keluarga ---
  status_perkawinan?: 'Belum Menikah' | 'Menikah' | 'Cerai Hidup' | 'Cerai Mati';
  nama_ayah?: string;
  pekerjaan_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ibu?: string;
  nama_pasangan?: string;
  nama_anak1?: string;
  nama_anak2?: string;
  nama_anak3?: string;

  // --- Riwayat Pendidikan ---
  pendidikan_terakhir?: 'SD' | 'SMP' | 'SMA/SMK' | 'D1' | 'D2' | 'D3' | 'S1' | 'S2' | 'S3';
  pendidikan_sd?: string;
  pendidikan_smp?: string;
  pendidikan_sma?: string;
  pendidikan_s1?: string;
  fakultas_s1?: string;

  // --- Riwayat Pekerjaan Terakhir ---
  perusahaan_terakhir?: string;
  alamat_perusahaan_terakhir?: string;
  alasan_berhenti?: string;
  lama_bekerja_terakhir?: string; // e.g., "2 tahun"
  posisi_terakhir?: string;
  gaji_terakhir?: number;

  // --- Lain-lain ---
  ukuran_sepatu?: string;
  ukuran_baju?: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'Lainnya';
  hobi?: string;
  tujuan_liburan?: string;
  moto_hari_ini?: string;
}

export type View = 'OPERATIONAL_DASHBOARD' | 'EMPLOYEE_DASHBOARD' | 'LOGIN' | 'ADMIN';

export type AdminView = 'OPERATIONAL' | 'EMPLOYEES' | 'MANAGEMENT';