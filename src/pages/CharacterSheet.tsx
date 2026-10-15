import { useParams } from 'react-router'
import ComingSoon from '../components/ComingSoon.tsx'
import PageHeader from '../components/PageHeader.tsx'

export default function CharacterSheet() {
  const { id } = useParams()
  return (
    <>
      <PageHeader title="Character Sheet" icon="characters">
        Character {id}
      </PageHeader>
      <ComingSoon milestone={4} />
    </>
  )
}
