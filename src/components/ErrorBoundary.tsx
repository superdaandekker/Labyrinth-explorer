// @ts-nocheck — React class component requires @types/react; Vite/esbuild builds fine without it
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen dungeon-bg text-white font-sans flex flex-col items-center justify-center gap-6 p-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-3xl shadow-lg">
            ⚠
          </div>
          <h1 className="text-2xl font-black italic tracking-tight">Something went wrong</h1>
          <p className="text-zinc-400 text-sm text-center max-w-xs">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
