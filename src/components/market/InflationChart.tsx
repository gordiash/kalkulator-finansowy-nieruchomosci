"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type InflationData = {
	date: string;
	cpi_yoy: number;
	core_inflation: number;
};

type InflationHistory = Array<{
	date: string;
	cpi_yoy?: number;
	core_inflation?: number;
}>;

export default function InflationChart() {
	const [currentData, setCurrentData] = useState<InflationData | null>(null);
	const [cpiHistory, setCpiHistory] = useState<InflationHistory>([]);
	const [coreHistory, setCoreHistory] = useState<InflationHistory>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchInflationData = async () => {
			try {
				setLoading(true);
				setError(null);
				
				// Pobierz aktualne dane
				try {
					const currentRes = await fetch('/api/market/inflation?type=current');
					if (currentRes.ok) {
						const current = await currentRes.json();
						if (current.data) {
							setCurrentData(current.data);
						}
					}
				} catch (err) {
					console.warn('Nie udało się pobrać aktualnych danych o inflacji:', err);
				}

				// Pobierz historię CPI z nowego endpointu
				try {
					const cpiRes = await fetch('/api/market/cpi?type=history&months=24');
					if (cpiRes.ok) {
						const cpi = await cpiRes.json();
						if (cpi.data && Array.isArray(cpi.data)) {
							// Konwertuj format danych do oczekiwanego przez komponent
							const formattedData = cpi.data.map((item: any) => ({
								date: item.date.slice(0, 7), // YYYY-MM format
								cpi_yoy: item.value
							}));
							setCpiHistory(formattedData);
						}
					}
				} catch (err) {
					console.warn('Nie udało się pobrać historii CPI:', err);
				}

				// Pobierz historię inflacji bazowej
				try {
					const coreRes = await fetch('/api/market/inflation?type=core_history&months=24');
					if (coreRes.ok) {
						const core = await coreRes.json();
						if (core.data && Array.isArray(core.data)) {
							setCoreHistory(core.data);
						}
					}
				} catch (err) {
					console.warn('Nie udało się pobrać historii inflacji bazowej:', err);
				}
			} catch (err) {
				setError('Wystąpił błąd podczas pobierania danych o inflacji');
				console.error('Błąd podczas pobierania danych o inflacji:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchInflationData();
	}, []);

	if (loading) {
		return (
			<div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50">
				<div className="animate-pulse">
					<div className="h-6 bg-slate-700 rounded mb-4"></div>
					<div className="h-4 bg-slate-700 rounded mb-2"></div>
					<div className="h-4 bg-slate-700 rounded w-3/4"></div>
				</div>
			</div>
		);
	}

	// Sprawdź czy są jakieś dane do wyświetlenia
	const hasAnyData = currentData || cpiHistory.length > 0 || coreHistory.length > 0;

	if (error) {
		return (
			<div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50">
				<div className="text-center">
					<p className="text-red-400 text-lg font-semibold mb-2">Błąd</p>
					<p className="text-sm text-slate-400 mb-4">{error}</p>
					<button 
						onClick={() => window.location.reload()} 
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
					>
						Spróbuj ponownie
					</button>
				</div>
			</div>
		);
	}

	// Jeśli nie ma żadnych danych, pokaż informację
	if (!hasAnyData) {
		return (
			<div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50">
				<div className="text-center">
					<p className="text-slate-400 text-lg font-semibold mb-2">Brak danych</p>
					<p className="text-sm text-slate-500 mb-4">Nie udało się pobrać danych o inflacji</p>
					<button 
						onClick={() => window.location.reload()} 
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
					>
						Odśwież stronę
					</button>
				</div>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50"
		>
			<h3 className="text-2xl font-bold text-white mb-6">Dane o inflacji z NBP</h3>
			
			{currentData && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<div className="bg-slate-700/50 p-4 rounded-xl">
						<div className="text-3xl font-bold text-red-400 mb-2">
							{currentData.cpi_yoy.toFixed(1)}%
						</div>
						<div className="text-white font-semibold mb-1">Inflacja CPI (r/r)</div>
						<div className="text-slate-400 text-sm">Data: {currentData.date}</div>
					</div>
					
					{currentData.core_inflation > 0 && (
						<div className="bg-slate-700/50 p-4 rounded-xl">
							<div className="text-3xl font-bold text-orange-400 mb-2">
								{currentData.core_inflation.toFixed(1)}%
							</div>
							<div className="text-white font-semibold mb-1">Inflacja bazowa (r/r)</div>
							<div className="text-slate-400 text-sm">Data: {currentData.date}</div>
						</div>
					)}
				</div>
			)}

			{cpiHistory.length > 0 && (
				<div className="mb-6">
					<h4 className="text-lg font-semibold text-white mb-4">Historia inflacji CPI (ostatnie 24 miesiące)</h4>
					<div className="bg-slate-700/30 p-4 rounded-xl overflow-x-auto">
						<div className="flex space-x-2 min-w-max">
							{cpiHistory.map((item, idx) => (
								<div key={idx} className="flex flex-col items-center">
									<div 
										className="w-3 bg-red-400 rounded-sm"
										style={{ 
											height: `${Math.max(10, Math.abs(item.cpi_yoy || 0) * 2)}px`,
											backgroundColor: (item.cpi_yoy || 0) < 0 ? '#60a5fa' : '#f87171'
										}}
									></div>
									<div className="text-xs text-slate-400 mt-1 w-12 text-center">
										{item.date.slice(5, 7)}/{item.date.slice(2, 4)}
									</div>
								</div>
							))}
						</div>
						<div className="flex justify-between text-xs text-slate-400 mt-2">
							<span>0%</span>
							<span>10%</span>
							<span>20%</span>
						</div>
					</div>
				</div>
			)}

			{coreHistory.length > 0 && (
				<div>
					<h4 className="text-lg font-semibold text-white mb-4">Historia inflacji bazowej (ostatnie 24 miesiące)</h4>
					<div className="bg-slate-700/30 p-4 rounded-xl overflow-x-auto">
						<div className="flex space-x-2 min-w-max">
							{coreHistory.map((item, idx) => (
								<div key={idx} className="flex flex-col items-center">
									<div 
										className="w-3 bg-orange-400 rounded-sm"
										style={{ 
											height: `${Math.max(10, Math.abs(item.core_inflation || 0) * 2)}px`,
											backgroundColor: (item.core_inflation || 0) < 0 ? '#60a5fa' : '#fb923c'
										}}
									></div>
									<div className="text-xs text-slate-400 mt-1 w-12 text-center">
										{item.date.slice(5, 7)}/{item.date.slice(2, 4)}
									</div>
								</div>
							))}
						</div>
						<div className="flex justify-between text-xs text-slate-400 mt-2">
							<span>0%</span>
							<span>10%</span>
							<span>20%</span>
						</div>
					</div>
				</div>
			)}

			<div className="mt-6 text-xs text-slate-400 text-center">
				Źródło: Narodowy Bank Polski (NBP)
			</div>
		</motion.div>
	);
}
