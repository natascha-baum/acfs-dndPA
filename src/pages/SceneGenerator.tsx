import ComingSoon from '../components/ComingSoon.tsx'
import PageHeader from '../components/PageHeader.tsx'

export default function SceneGenerator() {
  return (
    <>
      <PageHeader title="Scene Generator" icon="scene">
        Paint the world your heroes walk into.
      </PageHeader>
      <ComingSoon milestone={3} />
    </>
  )
}
