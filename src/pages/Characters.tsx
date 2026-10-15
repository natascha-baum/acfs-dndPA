import ComingSoon from '../components/ComingSoon.tsx'
import PageHeader from '../components/PageHeader.tsx'

export default function Characters() {
  return (
    <>
      <PageHeader title="My Characters" icon="characters">
        Every legend is written down somewhere.
      </PageHeader>
      <ComingSoon milestone={4} />
    </>
  )
}
