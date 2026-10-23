import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0D0F14] p-8 text-[#F5F5F7]">
          <div className="flex w-full max-w-lg flex-col items-center rounded-3xl border border-[#2A2D35] bg-[#181B22] p-8 text-center shadow-2xl">
            <AlertTriangle size={44} className="mb-4 text-[#F87171]" />
            <h2 className="text-xl font-bold">Something went wrong. Please reload the app.</h2>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 max-h-40 w-full overflow-auto rounded-2xl bg-[#0D0F14] p-3 text-left text-xs text-[#8B8F99]">
                {this.state.error.stack}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 flex items-center gap-2 rounded-2xl bg-[#E8C468] px-5 py-3 font-bold text-[#0D0F14] transition hover:opacity-90"
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
