import { useParams } from 'react-router'

export default function CharacterSheet() {
  const { id } = useParams()
  return (
    <>
      <h1>Character Sheet</h1>
      <p>Character {id}: coming in Milestone 4.</p>
    </>
  )
}
