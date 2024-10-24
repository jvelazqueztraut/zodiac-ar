import Error from 'next/error';
import React from 'react';

import { isBrowser } from 'template/utils/platform';

interface ErrorBoundaryProps {
  children: React.ReactNode | React.ReactNode[];
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state: {
    hasError: boolean;
    error: any;
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Error
          statusCode={
            Number.isSafeInteger(this.state.error?.statusCode)
              ? this.state.error?.statusCode
              : isBrowser()
              ? 400
              : 500
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
