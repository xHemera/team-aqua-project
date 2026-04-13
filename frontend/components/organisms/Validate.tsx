"use client";

import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

type ValidateProps = {
  open: boolean;
  title: string;
  onYes: () => void;
  onNo: () => void;
};

export default function Validate({ open, title, onYes, onNo }: ValidateProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onNo}>
      <Card
        className="w-full max-w-sm rounded-2xl border border-[#3c3650] bg-[#15131d] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="validate-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 id="validate-title" className="text-xl font-black uppercase tracking-wide text-white">
            {title}
          </h2>

          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={onNo}>
              Non
            </Button>
            <Button type="button" onClick={onYes}>
              Oui
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
