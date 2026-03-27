// @ts-nocheck — React class component requires @types/react; Vite/esbuild builds fine without it
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
  errorInfo: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '', errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    this.setState({ errorInfo: info.componentStack ?? '' });
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '', errorInfo: '' });
  };

  handleClearAndReload = () => {
    try {
      localStorage.removeItem('labyrinth_save');
      localStorage.removeItem('labyrinth_leaderboard');
      localStorage.removeItem('powerupInventory');
    } catch {
      // localStorage niet beschikbaar — negeer
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen dungeon-bg text-white font-sans flex flex-col items-center justify-center gap-5 p-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-3xl shadow-lg shadow-red-500/20">
            ⚠
          </div>

          <div className="text-center max-w-xs">
            <h1 className="text-2xl font-black italic tracking-tight mb-2">Er ging iets mis</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Het spel heeft een onverwachte fout ondervonden. Probeer opnieuw of wis de opgeslagen data als het probleem aanhoudt.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-sm"
            >
              Probeer opnieuw
            </button>
            <button
              onClick={this.handleClearAndReload}
              className="w-full py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold rounded-2xl hover:bg-zinc-700 hover:scale-[1.02] active:scale-95 transition-all text-sm"
            >
              Wis opgeslagen data &amp; herlaad
            </button>
          </div>

          {(this.state.message || this.state.errorInfo) && (
            <details className="w-full max-w-xs">
              <summary className="text-[10px] uppercase tracking-widest text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors text-center select-none">
                Foutdetails
              </summary>
              <div className="mt-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-left overflow-auto max-h-40">
                {this.state.message && (
                  <p className="font-mono text-[11px] text-red-400 mb-2 break-words">{this.state.message}</p>
                )}
                {this.state.errorInfo && (
                  <pre className="font-mono text-[10px] text-zinc-500 whitespace-pre-wrap break-words leading-relaxed">
                    {this.state.errorInfo.trim()}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
