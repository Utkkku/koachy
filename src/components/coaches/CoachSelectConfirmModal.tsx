'use client';

interface CoachSelectConfirmModalProps {
  isOpen: boolean;
  coachName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CoachSelectConfirmModal({
  isOpen,
  coachName,
  onCancel,
  onConfirm,
}: CoachSelectConfirmModalProps) {
  if (!isOpen) return null;

  const displayName = coachName.trim() || 'Bu';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="coach-select-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 border-0 cursor-default"
        onClick={onCancel}
        aria-label="Kapat"
      />
      <div className="relative bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-8">
        <h2 id="coach-select-title" className="text-xl font-black text-black mb-4 pr-8">
          Koç seçimi
        </h2>
        <p className="text-base font-medium text-gray-800 leading-relaxed mb-8">
          <span className="font-black text-indigo-700">{displayName}</span> koçunu seçmek mi istiyorsunuz?
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white text-black font-black text-sm border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Hayır
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-3 bg-indigo-600 text-white font-black text-sm border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Evet, devam et
          </button>
        </div>
      </div>
    </div>
  );
}
