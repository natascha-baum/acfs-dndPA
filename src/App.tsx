import { Route, Routes } from 'react-router'
import Layout from './components/Layout.tsx'
import { moduleRoutes } from './modules/registry.ts'
import Home from './pages/Home.tsx'
import NotFound from './pages/NotFound.tsx'

// Module routes come from the registry; only Home and NotFound live here.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        {moduleRoutes.map(({ path, page: Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
