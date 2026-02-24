"use client";

import Image from "next/image";
import { useState } from "react";
import ectoplasme from "../images/tony.jpg";

export default function GamePage() {
	const [showMenu, setShowMenu] = useState(false);
	const Bench = Array.from({ length: 1 }, (_, i) => i);
	const Prize = Array.from({ length: 6 }, (_, i) => i);
	const Hand = Array.from({ length: 1 }, (_, i) => i);

	return (
		<div className="min-h-screen flex flex-col relative overflow-hidden">
			<div className="absolute inset-0 -z-10">
				<Image
					src={ectoplasme}
					alt="Background"
					fill
					className="object-cover"
					priority
				/>
			</div>
            
			{/* Main Content */}
			<main className="flex-1 relative">
				<div className="absolute inset-0 bg-black/40 shadow-2xl border border-white/20 overflow-hidden">
					{/* Menu Button */}
					<button
						onClick={() => setShowMenu(true)}
						className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-lg border border-white/10 flex items-center justify-center text-white font-bold text-xl transition-colors"
					>
						<i className="fa-solid fa-gear"></i>
					</button>

					{/* Opponent Header */}
					<div className="absolute top-4 right-16 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full border border-white/10">
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-500 shadow-inner"></div>
						<div className="text-white font-bold">sunmiaou</div>
					</div>

					{/* Left Stack */}
					<div className="absolute left-14 bottom-30">
						<div className="grid grid-cols-2 gap-0">
							{Prize.map((slot) => {
								const col = slot % 2;
								const row = Math.floor(slot / 2);
								return (
									<div
										key={`left-prize-${slot}`}
										className="w-20 h-28 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
										style={{
											marginLeft: col === 1 ? "-40px" : "0px",
											marginTop: row > 0 ? "-20px" : "0px",
											transform: col === 1 ? "translateY(12px)" : "none",
										}}
									></div>
								);
							})}
						</div>
					</div>

					{/* Right Stack */}
					<div className="absolute right-6 top-28">
						<div className="grid grid-cols-2 gap-0">
							{Prize.map((slot) => {
								const col = slot % 2;
								const row = Math.floor(slot / 2);
								return (
									<div
										key={`right-prize-${slot}`}
										className="w-20 h-28 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
										style={{
											marginLeft: col === 1 ? "-40px" : "0px",
											marginTop: row > 0 ? "-20px" : "0px",
											transform: col === 1 ? "translateY(12px)" : "none",
										}}
									></div>
								);
							})}
						</div>
					</div>

                    {/*active top pokemon*/}
					<div className="absolute bottom-127 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Bench.map((slot) => (
							<div
								key={`top-pokemon-${slot}`}
								className="w-32 h-45 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>

                     {/*active bottom pokemon*/}
					<div className="absolute bottom-75 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Bench.map((slot) => (
							<div
								key={`bottom-pokemon-${slot}`}
								className="w-32 h-45 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>

                    {/* top Bench */}
					<div className="absolute bottom-177 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Bench.map((slot) => (
							<div
								key={`top-bench-${slot}`}
								className="w-170 h-35 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>

                    {/* bottom Bench */}
					<div className="absolute bottom-33 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Bench.map((slot) => (
							<div
								key={`bottom-bench-${slot}`}
								className="w-170 h-35 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>


                    {/* top Hand */}
					<div className="absolute bottom-215 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`top-hand-${slot}`}
								className="w-200 h-15 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>

                    {/* top deck*/}
					<div className="absolute left-70 top-30 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`top-deck-${slot}`}
								className="w-28.5 h-40 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>

                    {/* top discard*/}
					<div className="absolute left-35 top-20 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`top-discard-${slot}`}
								className="w-28.5 h-40 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>

					{/* Bottom Hand */}
					<div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`bottom-hand-${slot}`}
								className="w-200 h-30 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>

                    {/* bottom deck*/}
					<div className="absolute left-400 bottom-40 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`bottom-deck-${slot}`}
								className="w-28.5 h-40 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>

                    {/* bottom discard*/}
					<div className="absolute left-435 bottom-30 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`bottom-discard-${slot}`}
								className="w-28.5 h-40 rounded-xl bg-gray-900/70 border border-white/10 shadow-lg"
							></div>
						))}
					</div>

					{/* Player Tag */}
					<div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-full border border-white/10">
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-500 shadow-inner"></div>
						<div className="text-white font-bold">xHemera_</div>
					</div>
				</div>
			</main>

			{/* Menu Popup */}
			{showMenu && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
					<div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-white/20">
						<div className="flex flex-col gap-4 min-w-[200px]">
							<button
								onClick={() => setShowMenu(false)}
								className="bg-gray-600 hover:bg-gray-500 text-white font-bold text-lg py-3 px-6 rounded-lg transition-colors uppercase"
							>
								Resume
							</button>
							<button
								onClick={() => window.location.href = '/home'}
								className="bg-red-600 hover:bg-red-500 text-white font-bold text-lg py-3 px-6 rounded-lg transition-colors uppercase"
							>
								Forfait
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
