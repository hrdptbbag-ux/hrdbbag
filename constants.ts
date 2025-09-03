import { OperationalData } from './types';

// --- CALCULATE KEY PERFORMANCE INDICATORS ---

export const calculateKPIs = (data: OperationalData[]) => {
  if (data.length === 0) {
    return {
      totalVolume: 0,
      averagePencapaian: 0,
      totalRitase: 0,
      averageEU: 0,
    };
  }

  const totalVolume = data.reduce((sum, item) => sum + item.volume, 0);
  const averagePencapaian = data.reduce((sum, item) => sum + item.pencapaian, 0) / data.length;
  const totalRitase = data.reduce((sum, item) => sum + item.ritase, 0);
  const averageEU = data.reduce((sum, item) => sum + item.eu, 0) / data.length;

  return { totalVolume, averagePencapaian, totalRitase, averageEU };
};