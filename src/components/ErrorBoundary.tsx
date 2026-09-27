import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// Catches render crashes anywhere below (e.g. unexpected API shapes) and
// shows a recoverable screen instead of a blank page.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('SaagarSathi render crash:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-full flex items-center justify-center p-6 bg-sky-50/30">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-md border border-sky-100 rounded-2xl p-6 text-center shadow-lg">
            <div className="text-2xl mb-2">⚠️</div>
            <h2 className="font-semibold text-slate-900">Something failed to display</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              The app hit an unexpected display error (your data is safe). Reload to recover —
              and if it repeats, note what you tapped before this appeared.
            </p>
            <p className="text-[11px] text-slate-400 mt-2 font-mono break-words">
              {this.state.error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2.5 bg-sky-600 text-white text-xs font-medium rounded-xl hover:bg-sky-700 cursor-pointer"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
