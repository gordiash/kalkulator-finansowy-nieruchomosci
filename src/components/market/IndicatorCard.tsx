"use client";

import { motion } from "framer-motion";

type Props = {
	label: string;
	value: string;
	note?: string;
	accent?: "blue" | "green" | "yellow" | "purple" | "red" | "orange";
};

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
	blue: "text-blue-400",
	green: "text-green-400",
	yellow: "text-yellow-400",
	purple: "text-purple-400",
	red: "text-red-400",
	orange: "text-orange-400",
};

export default function IndicatorCard({ label, value, note, accent = "blue" }: Props) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.4 }}
			className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
		>
			<div className={`text-2xl font-bold ${accentMap[accent]} mb-1`}>{value}</div>
			<div className="text-white font-semibold">{label}</div>
			{note && <div className="text-slate-400 text-xs mt-1">{note}</div>}
		</motion.div>
	);
}
