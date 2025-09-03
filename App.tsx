import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage';
import { View, OperationalData, Karyawan } from './types';
import { APP_CONFIG } from './config';
import { supabase, supabaseInitializationError } from './services/supabaseClient';

function App() {
  const [view, setView] = useState<View>('OPERATIONAL_DASHBOARD');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [operationalData, setOperationalData] = useState<OperationalData[]>([]);
  const [karyawanData, setKaryawanData] = useState<Karyawan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchData = useCallback(async () => {
    if (!supabase) {
        // This case is primarily handled by the initialization check, but serves as a fallback.
        setError(supabaseInitializationError || "Klien Supabase tidak berhasil diinisialisasi.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);
    
    const operationalPromise = supabase
      .from('operational_data')
      .select('*')
      .order('date', { ascending: false });

    const karyawanPromise = supabase
      .from('karyawan')
      .select('*')
      .order('nama', { ascending: true });

    const [operationalResult, karyawanResult] = await Promise.all([operationalPromise, karyawanPromise]);

    if (operationalResult.error || karyawanResult.error) {
      const opError = operationalResult.error;
      const karError = karyawanResult.error;

      if (opError) console.error('Supabase error (operational_data):', opError);
      if (karError) console.error('Supabase error (karyawan):', karError);

      let errorMessages: string[] = [];
      if (opError) {
        errorMessages.push(`Data Operasional: ${opError.message}`);
      }
      if (karError) {
        errorMessages.push(`Data Karyawan: ${karError.message}`);
      }

      setError(`Gagal memuat data dari database.\n\nDetail Kesalahan:\n- ${errorMessages.join('\n- ')}\n\nPastikan konfigurasi Supabase (URL & Kunci Anon) sudah benar dan RLS policy telah diterapkan.`);
    } else {
      setOperationalData(operationalResult.data || []);
      setKaryawanData(karyawanResult.data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (supabaseInitializationError) {
        setError(supabaseInitializationError);
        setIsLoading(false);
        return;
    }
    fetchData();
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, [fetchData]);

  const handleNavigate = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const handleLogin = useCallback((success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      setView('ADMIN');
      setNotification({ message: 'Selamat datang, Admin!', type: 'success' });
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setView('OPERATIONAL_DASHBOARD');
  }, []);
  
  const handleSetLogo = useCallback((base64Url: string) => {
    localStorage.setItem('companyLogo', base64Url);
    setLogoUrl(base64Url);
  }, []);

  // --- Operational Data CRUD Operations ---
  const handleAddData = async (newData: Omit<OperationalData, 'id'>) => {
    if (!supabase) throw new Error("Koneksi Supabase tidak tersedia.");
    const { data, error } = await supabase
      .from('operational_data')
      .insert([newData])
      .select();
    
    if (error) throw error;
    if (data) {
        setOperationalData(prev => [...prev, ...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  const handleUpdateData = async (updatedData: OperationalData) => {
    if (!supabase) throw new Error("Koneksi Supabase tidak tersedia.");
    const { data, error } = await supabase
        .from('operational_data')
        .update(updatedData)
        .eq('date', updatedData.date)
        .select();

    if (error) throw error;
    if(data) {
        setOperationalData(prev => prev.map(item => item.date === updatedData.date ? data[0] : item));
    }
  };

  const handleDeleteData = async (dateToDelete: string): Promise<boolean> => {
    if (!supabase) throw new Error("Koneksi Supabase tidak tersedia.");
    const { error } = await supabase
      .from('operational_data')
      .delete()
      .eq('date', dateToDelete);

    if (error) {
        console.error("Supabase delete error (operational):", error);
        return false;
    }
    setOperationalData(prev => prev.filter(item => item.date !== dateToDelete));
    return true;
  };

  const handleDeleteAll = async (): Promise<boolean> => {
    if (!supabase) throw new Error("Koneksi Supabase tidak tersedia.");
    const { error } = await supabase
        .from('operational_data')
        .delete()
        .neq('date', '1900-01-01'); // A safe way to delete all rows

    if (error) {
        console.error("Supabase delete all error (operational):", error);
        return false;
    }
    setOperationalData([]);
    return true;
  };

  // --- Karyawan Data CRUD Operations ---
  const handleAddKaryawan = async (newKaryawan: Omit<Karyawan, 'id' | 'created_at'>) => {
    if (!supabase) throw new Error("Koneksi Supabase tidak tersedia.");
    const { data, error } = await supabase
      .from('karyawan')
      .insert([newKaryawan])
      .select();
    
    if (error) throw error;
    if (data) {
        setKaryawanData(prev => [...prev, ...data].sort((a, b) => a.nama.localeCompare(b.nama)));
    }
  };
  
  const handleUpdateKaryawan = async (updatedKaryawan: Karyawan) => {
    if (!supabase) throw new Error("Koneksi Supabase tidak tersedia.");
    const { data, error } = await supabase
        .from('karyawan')
        .update(updatedKaryawan)
        .eq('id', updatedKaryawan.id)
        .select();

    if (error) throw error;
    if(data) {
        setKaryawanData(prev => prev.map(item => item.id === updatedKaryawan.id ? data[0] : item).sort((a, b) => a.nama.localeCompare(b.nama)));
    }
  };

  const handleDeleteKaryawan = async (id: number): Promise<boolean> => {
    if (!supabase) throw new Error("Koneksi Supabase tidak tersedia.");
    const { error } = await supabase
      .from('karyawan')
      .delete()
      .eq('id', id);

    if (error) {
        console.error("Supabase delete error (karyawan):", error);
        return false;
    }
    setKaryawanData(prev => prev.filter(item => item.id !== id));
    return true;
  };

  const handleAddBulkKaryawan = async (newKaryawanList: Omit<Karyawan, 'id' | 'created_at'>[]) => {
    if (!supabase) throw new Error("Koneksi Supabase tidak tersedia.");
    const { data, error } = await supabase
      .from('karyawan')
      .insert(newKaryawanList)
      .select();
    
    if (error) throw error;
    if (data) {
        setKaryawanData(prev => [...prev, ...data].sort((a, b) => a.nama.localeCompare(b.nama)));
    }
  };
  
  const handleDeleteAllKaryawan = async (): Promise<boolean> => {
    if (!supabase) throw new Error("Koneksi Supabase tidak tersedia.");
    const { error } = await supabase
        .from('karyawan')
        .delete()
        .neq('id', -1);

    if (error) {
        console.error("Supabase delete all error (karyawan):", error);
        return false;
    }
    setKaryawanData([]);
    return true;
  };


  const renderContent = () => {
    if (isLoading && !error) {
        return <div className="text-center p-10">Memuat data...</div>;
    }
    if (error) {
      // Check if it's a configuration error to provide a more specific title
      const isConfigError = error.includes("Konfigurasi");
      return (
        <div className="text-center p-10 max-w-2xl mx-auto">
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-red-300 mb-4">
                  {isConfigError ? 'Terjadi Kesalahan Konfigurasi Kredensial' : 'Terjadi Kesalahan Koneksi'}
                </h3>
                <pre className="text-left text-red-300 whitespace-pre-wrap font-mono text-sm bg-slate-900 p-4 rounded-md">{error}</pre>
            </div>
        </div>
      )
    }

    switch (view) {
      case 'LOGIN':
        return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'ADMIN':
        return isLoggedIn ? <AdminPage 
                                operationalData={operationalData} 
                                onAddData={handleAddData}
                                onUpdateData={handleUpdateData}
                                onDeleteData={handleDeleteData}
                                onDeleteAll={handleDeleteAll}
                                karyawanData={karyawanData}
                                onAddKaryawan={handleAddKaryawan}
                                onUpdateKaryawan={handleUpdateKaryawan}
                                onDeleteKaryawan={handleDeleteKaryawan}
                                onDeleteAllKaryawan={handleDeleteAllKaryawan}
                                onAddBulkKaryawan={handleAddBulkKaryawan}
                                onSetLogo={handleSetLogo}
                                logoUrl={logoUrl}
                                setNotification={setNotification}
                             /> : <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'EMPLOYEE_DASHBOARD':
        return <EmployeeDashboard data={karyawanData} logoUrl={logoUrl} />;
      case 'OPERATIONAL_DASHBOARD':
      default:
        return <Dashboard data={operationalData} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans">
      {notification && (
        <div className={`fixed top-20 right-5 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm transition-all duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} role="alert">
            <div className="flex justify-between items-center">
                <p className="mr-4">{notification.message}</p>
                <button onClick={() => setNotification(null)} className="p-1 rounded-full hover:bg-black/20" aria-label="Tutup">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
      )}
      <Header 
        logoUrl={logoUrl}
        isLoggedIn={isLoggedIn}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        view={view}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
       <footer className="text-center p-4 text-xs text-slate-500">
          {APP_CONFIG.FOOTER_TEXT}
      </footer>
    </div>
  );
}

export default App;