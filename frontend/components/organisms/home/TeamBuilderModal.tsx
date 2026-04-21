import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/atoms/Button";
import FeatureModalFrame from "@/components/molecules/home/FeatureModalFrame";

type TeamCharacter = {
  id: string;
  name: string;
  portrait: string;
};

type TeamBuilderModalProps = {
  open: boolean;
  characters: TeamCharacter[];
  teamSlots: Array<string | null>;
  onClose: () => void;
  onDropToSlot: (slotIndex: number, characterId: string) => void;
  onClearSlot: (slotIndex: number) => void;
};

type DragState = {
  id: string;
  portrait: string;
  name: string;
  x: number;
  y: number;
};

type PendingDragState = {
  id: string;
  portrait: string;
  name: string;
  startX: number;
  startY: number;
};

// Organism: modal Team Builder avec drag and drop en front-only.
export default function TeamBuilderModal({
  open,
  characters,
  teamSlots,
  onClose,
  onDropToSlot,
  onClearSlot,
}: TeamBuilderModalProps) {
  const getCharacter = (id: string | null) => characters.find((character) => character.id === id) ?? null;
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pendingDragRef = useRef<PendingDragState | null>(null);
  const activeDragRef = useRef<DragState | null>(null);
  const suppressClickForIdRef = useRef<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragState | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const getSlotIndexAtPoint = (clientX: number, clientY: number) => {
    for (let index = 0; index < slotRefs.current.length; index += 1) {
      const slot = slotRefs.current[index];
      if (!slot) {
        continue;
      }

      const rect = slot.getBoundingClientRect();
      const isInside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      if (isInside) {
        return index;
      }
    }
    return null;
  };

  useEffect(
    () => () => {
      pendingDragRef.current = null;
      activeDragRef.current = null;
      setDragPreview(null);
      setHoveredSlot(null);
    },
    [],
  );

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  return (
    <FeatureModalFrame open={open} title="Team Builder" icon="fa-people-group" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {characters.map((character) => (
            <button
              key={character.id}
              type="button"
              onPointerDown={(event) => {
                if (event.button !== 0) {
                  return;
                }

                pendingDragRef.current = {
                  id: character.id,
                  portrait: character.portrait,
                  name: character.name,
                  startX: event.clientX,
                  startY: event.clientY,
                };

                const handlePointerMove = (moveEvent: PointerEvent) => {
                  const pending = pendingDragRef.current;
                  const active = activeDragRef.current;
                  if (!pending && !active) {
                    return;
                  }

                  if (!active && pending) {
                    const distanceX = moveEvent.clientX - pending.startX;
                    const distanceY = moveEvent.clientY - pending.startY;
                    const movedEnough = Math.hypot(distanceX, distanceY) >= 6;
                    if (!movedEnough) {
                      return;
                    }

                    const started: DragState = {
                      id: pending.id,
                      portrait: pending.portrait,
                      name: pending.name,
                      x: moveEvent.clientX,
                      y: moveEvent.clientY,
                    };
                    activeDragRef.current = started;
                    pendingDragRef.current = null;
                    suppressClickForIdRef.current = started.id;
                    setDragPreview(started);
                  }

                  const current = activeDragRef.current;
                  if (!current) {
                    return;
                  }

                  const updated: DragState = {
                    ...current,
                    x: moveEvent.clientX,
                    y: moveEvent.clientY,
                  };
                  activeDragRef.current = updated;
                  setDragPreview(updated);
                  setHoveredSlot(getSlotIndexAtPoint(moveEvent.clientX, moveEvent.clientY));
                };

                const handlePointerUp = (upEvent: PointerEvent) => {
                  window.removeEventListener("pointermove", handlePointerMove);
                  window.removeEventListener("pointerup", handlePointerUp);

                  const current = activeDragRef.current;
                  if (current) {
                    const slotIndex = getSlotIndexAtPoint(upEvent.clientX, upEvent.clientY);
                    if (slotIndex !== null) {
                      onDropToSlot(slotIndex, current.id);
                    }
                  }

                  pendingDragRef.current = null;
                  activeDragRef.current = null;
                  setDragPreview(null);
                  setHoveredSlot(null);
                };

                window.addEventListener("pointermove", handlePointerMove);
                window.addEventListener("pointerup", handlePointerUp, { once: true });
              }}
              onClick={() => {
                if (suppressClickForIdRef.current === character.id) {
                  suppressClickForIdRef.current = null;
                  return;
                }

                const freeSlot = teamSlots.findIndex((slot) => slot === null);
                onDropToSlot(freeSlot === -1 ? 0 : freeSlot, character.id);
              }}
              className="select-none overflow-hidden rounded-lg border-2 border-[#433556] bg-[#171220] text-left touch-none hover:border-[#7a6599]"
            >
              <div className="relative aspect-[3/4] w-full">
                <Image src={character.portrait} alt={character.name} fill draggable={false} className="pointer-events-none object-cover" />
              </div>
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#ead9aa]">
                {character.name}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {teamSlots.map((slotCharacterId, index) => {
            const selected = getCharacter(slotCharacterId);
            return (
              <div
                key={`team-slot-${index}`}
                ref={(element) => {
                  slotRefs.current[index] = element;
                }}
                className={`relative overflow-hidden rounded-xl border border-dashed bg-[#120f17] ${
                  hoveredSlot === index ? "border-[#e6c55a]" : "border-[#6b5a84]"
                }`}
              >
                {selected ? (
                  <>
                    <div className="relative aspect-[3/4] w-full">
                      <Image src={selected.portrait} alt={selected.name} fill className="object-cover" />
                    </div>
                    <div className="flex items-center justify-between bg-[#1a1422] px-2 py-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ead9aa]">
                        {selected.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => onClearSlot(index)}
                        className="text-xs text-[#e6c55a]"
                        aria-label={`Clear slot ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center text-xs font-semibold uppercase tracking-wider text-[#7b6d93]">
                    Slot {index + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button type="button" variant="secondary" onClick={onClose} className="w-full font-bold uppercase tracking-wider">
          Done
        </Button>
      </div>

      {isMounted && dragPreview
        ? createPortal(
            <div
              className="pointer-events-none fixed left-0 top-0 z-[9999] w-[128px] overflow-hidden rounded-lg border-2 border-[#7a6599] bg-[#171220] shadow-2xl"
              style={{ transform: `translate(${dragPreview.x - 64}px, ${dragPreview.y + 12}px)` }}
            >
              <div className="relative aspect-[3/4] w-full">
                <Image src={dragPreview.portrait} alt={dragPreview.name} fill className="object-cover" />
              </div>
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#ead9aa]">{dragPreview.name}</div>
            </div>,
            document.body,
          )
        : null}
    </FeatureModalFrame>
  );
}
