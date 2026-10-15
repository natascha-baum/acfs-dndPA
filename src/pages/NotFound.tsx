import { Link } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'

export default function NotFound() {
  return (
    <>
      <PageHeader title="Lost in the Wilds">This path leads nowhere, adventurer.</PageHeader>
      <p style={{ textAlign: 'center' }}>
        <Link to="/">Return to the tavern</Link>
      </p>
    </>
  )
}
