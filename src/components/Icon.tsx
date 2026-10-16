import type { ModuleIcon } from '../modules/registry.ts'

type IconName = ModuleIcon | 'flourish'

interface IconProps {
  name: IconName
  className?: string
}

// Hand-drawn line icons; they inherit their color from `currentColor`.
export default function Icon({ name, className }: IconProps) {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (name) {
    case 'd20':
      return (
        <svg viewBox="0 0 64 64" {...common}>
          <polygon points="32,3 57,17 57,47 32,61 7,47 7,17" />
          <polygon points="32,16 47,41 17,41" />
          <path d="M32 3 32 16M7 17 32 16 57 17M7 17 17 41M57 17 47 41M7 47 17 41M57 47 47 41M17 41 32 61 47 41" />
        </svg>
      )
    case 'npc':
      return (
        <svg viewBox="0 0 64 64" {...common}>
          {/* Hooded stranger */}
          <path d="M32 6c-10 0-17 9-17 21 0 6-3 10-7 14l6 2c3 9 10 15 18 15s15-6 18-15l6-2c-4-4-7-8-7-14 0-12-7-21-17-21Z" />
          <path d="M22 30c2-7 6-11 10-11s8 4 10 11c-2 8-6 13-10 13s-8-5-10-13Z" />
          <circle cx="28" cy="31" r="1.2" fill="currentColor" />
          <circle cx="36" cy="31" r="1.2" fill="currentColor" />
        </svg>
      )
    case 'scene':
      return (
        <svg viewBox="0 0 64 64" {...common}>
          {/* Mountains, moon and a castle tower */}
          <circle cx="48" cy="14" r="5" />
          <path d="M4 54 22 26l10 14 8-10 20 24Z" />
          <path d="M18 54V42h3v3h3v-3h3v3h3v-3h3v12" />
          <path d="M22 54v-5a2 2 0 0 1 4 0v5" />
        </svg>
      )
    case 'characters':
      return (
        <svg viewBox="0 0 64 64" {...common}>
          {/* Open spellbook with a quill */}
          <path d="M6 16c9-3 18-2 26 4 8-6 17-7 26-4v34c-9-3-18-2-26 4-8-6-17-7-26-4Z" />
          <path d="M32 20v34" />
          <path d="M12 24c5-1 10 0 14 2M12 31c5-1 10 0 14 2M38 26c4-2 9-3 14-2M38 33c4-2 9-3 14-2" />
          <path d="M52 4 40 22l-1 4 3-2L54 6" />
        </svg>
      )
    case 'book':
      return (
        <svg viewBox="0 0 64 64" {...common}>
          {/* Closed tome with clasps and a bookmark ribbon */}
          <path d="M14 8h34a4 4 0 0 1 4 4v44H18a4 4 0 0 1-4-4Z" />
          <path d="M14 52a4 4 0 0 1 4-4h34" />
          <path d="M22 8v40M42 48v12l-4-3-4 3V48" />
          <path d="M30 20h14M30 27h10" />
        </svg>
      )
    case 'flourish':
      return (
        <svg viewBox="0 0 240 24" {...common} strokeWidth={1.2}>
          <path d="M4 12h86M150 12h86" />
          <path d="M90 12c8 0 12-8 20-8 6 0 10 4 10 8s4 8 10 8c8 0 12-8 20-8" />
          <path d="M90 12c8 0 12 8 20 8 6 0 10-4 10-8s4-8 10-8c8 0 12 8 20 8" />
          <path d="m120 6 4 6-4 6-4-6Z" fill="currentColor" />
        </svg>
      )
  }
}
