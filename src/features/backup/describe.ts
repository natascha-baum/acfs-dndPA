import type { BackupSummary } from '../../lib/backup.ts'

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

/** "2 NPCs, 1 scene and 0 player characters" */
export function describeSummary(summary: BackupSummary): string {
  return [
    plural(summary.characters, 'NPC', 'NPCs'),
    plural(summary.scenes, 'scene', 'scenes'),
    plural(summary.playerSheets, 'player character', 'player characters'),
  ]
    .join(', ')
    .replace(/, ([^,]*)$/, ' and $1')
}
