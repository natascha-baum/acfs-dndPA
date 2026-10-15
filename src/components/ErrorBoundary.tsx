import { Component, type ReactNode } from 'react'
import { Link } from 'react-router'
import PageHeader from './PageHeader.tsx'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  failed: boolean
}

/**
 * Shows a friendly message instead of a blank page when a page crashes.
 * Give it a `key` that changes on navigation so the next page renders again.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <>
        <PageHeader title="A Spell Gone Wrong">Something broke while drawing this page.</PageHeader>
        <p className="notice">
          Your saved characters and scenes are safe. <Link to="/">Return to the tavern</Link> or{' '}
          <a href={window.location.href} onClick={() => window.location.reload()}>
            reload the page
          </a>
          .
        </p>
      </>
    )
  }
}
