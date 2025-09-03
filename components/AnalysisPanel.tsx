import React, { useState, useCallback } from 'react';
import { generateProductionAnalysis } from '../services/geminiService';
import { OperationalData } from '../types';

interface AnalysisPanelProps {
  productionData: OperationalData[];
  totalsData: any[]; // Kept for prop compatibility, but not used
}

const GemIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
)

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ productionData }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setAnalysis('');
    try {
      const result = await generateProductionAnalysis(productionData);
      setAnalysis(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [productionData]);
  
  const formatAnalysis = (text: string) => {
    return text
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.trim().startsWith('*') || /^\d+\./.test(paragraph.trim())) {
          return (
            <li key={index} className="ml-5 list-disc text-slate-300">
              {paragraph.replace(/^\*|^\d+\./, '').trim()}
            </li>
          );
        }
        return <p key={index} className="mb-2 text-slate-300">{paragraph}</p>;
      })
      .reduce((acc, curr, index) => {
        if (curr.type === 'li' && (acc.length === 0 || acc[acc.length - 1].type !== 'ul')) {
          acc.push(<ul key={`ul-${index}`} className="space-y-2 my-3">{curr}</ul>);
        } else if (curr.type === 'li') {
          const lastElement = acc[acc.length-1];
          const newChildren = React.Children.toArray(lastElement.props.children).concat(curr);
          acc[acc.length-1] = React.cloneElement(lastElement, { children: newChildren });
        } else {
          acc.push(curr);
        }
        return acc;
      }, [] as JSX.Element[]);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-lg font-semibold text-cyan-300 mb-3 sm:mb-0">
          Analisis Performa (AI-Powered)
        </h2>
        <button
          onClick={handleGenerateAnalysis}
          disabled={isLoading}
          className="flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menganalisis...
            </>
          ) : (
            <>
              <GemIcon /> Buat Analisis
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-4 min-h-[150px] bg-slate-900/70 rounded-lg border border-slate-700">
        {isLoading && <p className="text-slate-400">Memproses data untuk mendapatkan wawasan...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {analysis && !isLoading && (
          <div className="prose prose-invert prose-sm max-w-none">
            {formatAnalysis(analysis)}
          </div>
        )}
        {!analysis && !isLoading && !error && (
            <p className="text-slate-500">Klik tombol "Buat Analisis" untuk mendapatkan wawasan berbasis AI tentang data operasional harian Anda.</p>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
