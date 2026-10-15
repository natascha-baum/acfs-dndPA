import ComingSoon from '../components/ComingSoon.tsx'
import PageHeader from '../components/PageHeader.tsx'

export default function CharacterGenerator() {
  return (
    <>
      <PageHeader title="NPC Generator" icon="npc">
        A stranger steps out of the shadows…
      </PageHeader>
      <ComingSoon milestone={2} />
    </>
  )
}
