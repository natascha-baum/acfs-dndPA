import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api/index.ts'
import { useAsync } from '../../hooks/useAsync.ts'
import { resolveDetail, type LookupRef } from './resolveDetail.ts'
import styles from './DetailDialog.module.css'

interface DetailDialogProps {
  lookup: LookupRef
  onClose: () => void
}

const loadDetail = (ref: LookupRef) => resolveDetail(ref, api)

/** Modal that shows an API entry; related entries open inside it with a back button. */
export default function DetailDialog({ lookup, onClose }: DetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [stack, setStack] = useState<LookupRef[]>([lookup])
  const current = stack[stack.length - 1]
  const state = useAsync(current, loadDetail)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  function open(next: LookupRef) {
    setStack((s) => [...s, next])
  }

  function back() {
    setStack((s) => s.slice(0, -1))
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
      aria-labelledby="detail-title"
    >
      <div className={styles.body}>
        <div className={styles.toolbar}>
          {stack.length > 1 ? (
            <button type="button" className={styles.iconButton} onClick={back}>
              ← Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {state.status === 'loading' && (
          <>
            <h2 id="detail-title" className={styles.title}>
              {current.name}
            </h2>
            <p className={styles.muted}>Consulting the archives…</p>
          </>
        )}
        {state.status === 'error' && (
          <>
            <h2 id="detail-title" className={styles.title}>
              {current.name}
            </h2>
            <p className={styles.muted}>The archives could not be reached. Please try again later.</p>
          </>
        )}
        {state.status === 'ready' && (
          <>
            <h2 id="detail-title" className={styles.title}>
              {state.data.title}
            </h2>
            {state.data.subtitle && <p className={styles.subtitle}>{state.data.subtitle}</p>}
            {state.data.facts.length > 0 && (
              <dl className={styles.facts}>
                {state.data.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {state.data.paragraphs.map((text, i) => (
              <p key={i} className={styles.paragraph}>
                {text}
              </p>
            ))}
            {state.data.sections?.map((section) => (
              <section key={section.label}>
                <h3 className={styles.linksTitle}>{section.label}</h3>
                {section.paragraphs.map((text, i) => (
                  <p key={i} className={styles.paragraph}>
                    {text}
                  </p>
                ))}
              </section>
            ))}
            {state.data.links.map((group) => (
              <section key={group.label}>
                <h3 className={styles.linksTitle}>{group.label}</h3>
                <ul className={styles.links}>
                  {group.items.map((item) => (
                    <li key={item.index}>
                      <button type="button" className={styles.link} onClick={() => open(item)}>
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </dialog>
  )
}
