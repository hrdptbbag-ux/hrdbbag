import React from 'react';
import { OperationalData } from '../types';

interface OperationalDataTableProps {
  data: OperationalData[];
  onEdit?: (item: OperationalData) => void;
  onDelete?: (date: string) => void;
}

const OperationalDataTable: React.FC<OperationalDataTableProps> = ({ data, onEdit, onDelete }) => {
  const headers = [
    { key: 'date', label: 'Tanggal', title: 'Tanggal Pencatatan' },
    { key: 'pro', label: 'PRO', title: 'ID Proyek/Unit' },
    { key: 'stb', label: 'STB', title: 'Standby (jam)' },
    { key: 'bd', label: 'BD', title: 'Breakdown (jam)' },
    { key: 'wt', label: 'WT', title: 'Waktu Tunggu (jam)' },
    { key: 'pa', label: 'PA (%)', title: 'Physical Availability' },
    { key: 'ua', label: 'UA (%)', title: 'Use of Availability' },
    { key: 'ma', label: 'MA (%)', title: 'Mechanical Availability' },
    { key: 'eu', label: 'EU (%)', title: 'Effective Utilization' },
    { key: 'ritase', label: 'Ritase', title: 'Jumlah Perjalanan' },
    { key: 'volume', label: 'Volume (m³)', title: 'Volume Material' },
    { key: 'averageM3', label: 'Avg (m³)', title: 'Rata-rata Volume per Ritase' },
    { key: 'targetM3', label: 'Target (m³)', title: 'Target Volume' },
    { key: 'pencapaian', label: 'Pencapaian (%)', title: 'Pencapaian Target' },
  ];

  if (onEdit && onDelete) {
    headers.push({ key: 'actions', label: 'Aksi', title: 'Tindakan' });
  }

  const percentageKeys = ['pa', 'ua', 'ma', 'eu', 'pencapaian'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs text-cyan-300 uppercase bg-slate-700/50">
          <tr>
            {headers.map(header => (
              <th key={header.key} scope="col" className="px-4 py-3" title={header.title}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-slate-700 hover:bg-slate-800/80">
              {headers.map(header => {
                if (header.key === 'actions' && onEdit && onDelete) {
                  return (
                    <td key={`${header.key}-${index}`} className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => onEdit(row)} 
                          className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                          title="Edit Data"
                          aria-label="Edit Data"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => onDelete(row.date)} 
                          className="text-red-500 hover:text-red-400 transition-colors duration-200"
                          title="Hapus Data"
                          aria-label="Hapus Data"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )
                }
                return (
                  <td key={`${header.key}-${index}`} className="px-4 py-3 whitespace-nowrap">
                    {(() => {
                      const value = row[header.key as keyof OperationalData];
                      if (header.key === 'date') {
                        // Ensure date is treated as UTC to prevent timezone shifts
                        const d = new Date(row.date);
                        const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
                        return utcDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
                      }
                      if (typeof value === 'number') {
                        if (header.key === 'pro') {
                          return value === 0 ? '' : value;
                        }
                        const formattedValue = value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        if (percentageKeys.includes(header.key)) {
                          return `${formattedValue} %`;
                        }
                        return formattedValue;
                      }
                      return value;
                    })()}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OperationalDataTable;