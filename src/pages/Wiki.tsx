import { useState } from 'react'
import { Link, useParams } from 'react-router'
import PageHeader from '../components/PageHeader.tsx'
import DetailDialog from '../features/detail/DetailDialog.tsx'
import type { LookupRef } from '../features/detail/resolveDetail.ts'
import { WIKI_CATEGORIES, filterEntries, findCategory } from '../features/wiki/categories.ts'
import { useAsync } from '../hooks/useAsync.ts'
import { api } from '../lib/api/index.ts'
import type { ApiList } from '../lib/api/types.ts'
import styles from './Wiki.module.css'

const loadList = (path: string) => api.get<ApiList>(path)

export default function Wiki() {
  const { category: id } = useParams()
  const category = findCategory(id)
  // The search stays when switching tabs, e.g. "fire" in Spells and in Monsters.
  const [query, setQuery] = useState('')
  const [lookup, setLookup] = useState<LookupRef | null>(null)
  const list = useAsync(category.listPath, loadList)
  const entries = list.status === 'ready' ? filterEntries(list.data.results, query) : []

  return (
    <>
      <PageHeader title="Wiki" icon="book">
        Every scroll in the archive, one search away.
      </PageHeader>

      <nav className={styles.tabs} aria-label="Wiki categories">
        {WIKI_CATEGORIES.map((c) => (
          <Link
            key={c.id}
            to={`/wiki/${c.id}`}
            className={`${styles.tab} ${c.id === category.id ? styles.active : ''}`}
            aria-current={c.id === category.id ? 'page' : undefined}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <div className={`field ${styles.search}`}>
        <label htmlFor="wiki-search">Search {category.label.toLowerCase()}</label>
        <input
          id="wiki-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name contains…"
          autoComplete="off"
        />
      </div>

      {list.status === 'loading' && <p className="notice">Consulting the archives…</p>}
      {list.status === 'error' && (
        <div className="notice">
          <p>The archives could not be reached.</p>
          <button type="button" className="btn" onClick={list.retry}>
            Try again
          </button>
        </div>
      )}
      {list.status === 'ready' && (
        <>
          <p className={styles.count} aria-live="polite">
            {entries.length} of {list.data.results.length} {category.label.toLowerCase()}
          </p>
          {entries.length === 0 ? (
            <p className="notice">Nothing found. Try a shorter search.</p>
          ) : (
            <ul className={styles.list}>
              {entries.map((entry) => (
                <li key={entry.index}>
                  <button
                    type="button"
                    className={styles.entry}
                    onClick={() => setLookup({ kind: category.kind, index: entry.index, name: entry.name })}
                  >
                    {entry.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {lookup && <DetailDialog key={`${lookup.kind}/${lookup.index}`} lookup={lookup} onClose={() => setLookup(null)} />}
    </>
  )
}
