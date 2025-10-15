/**
 * Error Boundary for 3D Components
 * Catches errors in Three.js rendering
 */

'use client';

import { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ThreeErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: unknown) {
        console.error('3D Component Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || <div>Error loading 3D content</div>;
        }

        return this.props.children;
    }
}
