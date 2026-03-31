"use client";

import { useEffect, useState } from "react";
import AppPageShell from "@/components/AppPageShell";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

// Plateau de jeu (maquette statique) + menu pause
export default function GamePage() {
	const [showMenu, setShowMenu] = useState(false);

	useEffect(() => {
		const handleEscapeModal = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			setShowMenu(false);
		};

		document.addEventListener("keydown", handleEscapeModal);
		return () => {
			document.removeEventListener("keydown", handleEscapeModal);
		};
	}, []);

	// Collections de slots pour afficher les zones du plateau
	const Bench = Array.from({ length: 1 }, (_, i) => i);
	const Prize = Array.from({ length: 6 }, (_, i) => i);
	const Hand = Array.from({ length: 1 }, (_, i) => i);

	return (
		<AppPageShell mainClassName="min-h-screen" containerClassName="max-w-none min-h-screen px-0 py-0">
            
			{/* Plateau principal */}
			<main className="relative z-10 flex-1">
				<div className="absolute inset-0 overflow-hidden rounded-3xl border border-[#3c3650] bg-[#15131d]/85 shadow-2xl backdrop-blur-md">
					{/* Menu Button */}
					<Button
						type="button"
						onClick={() => setShowMenu(true)}
						variant="ghost"
						className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-[#3c3650] bg-[#242033] text-xl font-bold text-white transition-colors hover:bg-[#302a45]"
					>
						<i className="fa-solid fa-gear"></i>
					</Button>

					{/* Opponent Header */}
					<div className="absolute top-4 right-16 flex items-center gap-3 rounded-full border border-[#3c3650] bg-[#242033] px-4 py-2">
						<div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#b4a8ff] to-[#5f538f] shadow-inner"></div>
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
										className="h-28 w-20 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
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
										className="h-28 w-20 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
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
								className="h-45 w-32 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>

                     {/*active bottom pokemon*/}
					<div className="absolute bottom-75 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Bench.map((slot) => (
							<div
								key={`bottom-pokemon-${slot}`}
								className="h-45 w-32 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>

                    {/* top Bench */}
					<div className="absolute bottom-177 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Bench.map((slot) => (
							<div
								key={`top-bench-${slot}`}
								className="h-35 w-170 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>

                    {/* bottom Bench */}
					<div className="absolute bottom-33 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Bench.map((slot) => (
							<div
								key={`bottom-bench-${slot}`}
								className="h-35 w-170 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>


                    {/* top Hand */}
					<div className="absolute bottom-215 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`top-hand-${slot}`}
								className="h-15 w-200 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>

                    {/* top deck*/}
					<div className="absolute left-70 top-30 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`top-deck-${slot}`}
								className="h-40 w-28.5 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>

                    {/* top discard*/}
					<div className="absolute left-35 top-20 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`top-discard-${slot}`}
								className="h-40 w-28.5 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>

					{/* Bottom Hand */}
					<div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`bottom-hand-${slot}`}
								className="h-30 w-200 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>

                    {/* bottom deck*/}
					<div className="absolute left-400 bottom-40 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`bottom-deck-${slot}`}
								className="h-40 w-28.5 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>

                    {/* bottom discard*/}
					<div className="absolute left-435 bottom-30 left-1/2 -translate-x-1/2 flex items-center gap-3">
						{Hand.map((slot) => (
							<div
								key={`bottom-discard-${slot}`}
								className="h-40 w-28.5 rounded-xl border border-[#3c3650] bg-[#242033] shadow-lg"
							></div>
						))}
					</div>

					{/* Player Tag */}
					<div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-full border border-[#3c3650] bg-[#242033] px-4 py-2">
						<div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#b4a8ff] to-[#5f538f] shadow-inner"></div>
						<div className="text-white font-bold">xHemera_</div>
					</div>
				</div>
			</main>

			{/* Popup pause / abandon */}
			{showMenu && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
					<Card className="rounded-2xl bg-[#15131d] p-8">
						<div className="flex flex-col gap-4 min-w-[200px]">
							<Button
								type="button"
								onClick={() => setShowMenu(false)}
								variant="secondary"
								className="h-auto rounded-lg px-6 py-3 text-lg font-bold uppercase text-white"
							>
								Resume
							</Button>
							<Button
								type="button"
								onClick={() => {
									window.location.href = "/home";
								}}
								className="h-auto rounded-lg border-red-400/80 bg-red-500/90 px-6 py-3 text-lg font-bold uppercase text-white hover:bg-red-500"
							>
								Forfait
							</Button>
						</div>
					</Card>
				</div>
			)}
		</AppPageShell>
	);
}
