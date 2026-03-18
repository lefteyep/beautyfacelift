import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Etwas ist schiefgelaufen. Bitte laden Sie die Seite neu.
          </p>
          <button
            className="pill-btn pill-btn-outline"
            onClick={() => window.location.reload()}
          >
            Seite neu laden
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
