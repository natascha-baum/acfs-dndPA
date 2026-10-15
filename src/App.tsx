import { Route, Routes } from 'react-router'
import Layout from './components/Layout.tsx'
import Home from './pages/Home.tsx'
import CharacterGenerator from './pages/CharacterGenerator.tsx'
import SceneGenerator from './pages/SceneGenerator.tsx'
import Characters from './pages/Characters.tsx'
import CharacterSheet from './pages/CharacterSheet.tsx'
import PlayerSheetView from './pages/PlayerSheetView.tsx'
import NotFound from './pages/NotFound.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="generate/character" element={<CharacterGenerator />} />
        <Route path="generate/scene" element={<SceneGenerator />} />
        <Route path="characters" element={<Characters />} />
        <Route path="characters/:id" element={<CharacterSheet />} />
        <Route path="characters/player/:id" element={<PlayerSheetView />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
