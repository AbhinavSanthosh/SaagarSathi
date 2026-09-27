import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-xs text-amber-800">
      <WifiOff size={14} />
      <span>You're offline — showing last synced data. Verdicts may be stale.</span>
    </div>
  );
}
