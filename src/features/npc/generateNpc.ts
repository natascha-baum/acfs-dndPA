import type {
  ApiList,
  Choice,
  Class,
  ClassLevel,
  ClassSpellRef,
  Equipment,
  EquipmentCategory,
  Option,
  Race,
  Subrace,
  Trait,
} from '../../lib/api/types.ts'
import { defaultRng, pick, pickMany, type Rng } from '../../lib/random.ts'
import type {
  Ability,
  ApiRef,
  Character,
  EquipmentEntry,
  NpcOptions,
  SpellRef,
} from '../../types/models.ts'
import {
  abilityModifier,
  ABILITIES,
  applyBonuses,
  applyImprovements,
  armorClass,
  assignStandardArray,
  highestSpellSlot,
  hitPoints,
  leveledSpellCount,
  proficiencyBonus,
} from './rules.ts'
import {
  ABILITY_PRIORITY,
  APPEARANCE,
  DEFAULT_PRIORITY,
  ENCOUNTER_HOOKS,
  ENEMY_HOOKS,
  GENDERS,
  NAMES,
  PERSONALITY,
  ROLES,
  type NpcRole,
} from './tables.ts'

/** The part of the API client the generator needs (easy to fake in tests). */
export interface NpcApi {
  get<T>(path: string): Promise<T>
}

interface Deps {
  api: NpcApi
  rng?: Rng
  id?: string
  now?: Date
}

const isAbility = (index: string): index is Ability => (ABILITIES as string[]).includes(index)

export function rollName(raceIndex: string, gender: string, rng: Rng = defaultRng): string {
  const names = NAMES[raceIndex] ?? NAMES.human
  const firstNames =
    gender === 'Female' ? names.female : gender === 'Male' ? names.male : [...names.female, ...names.male]
  return `${pick(firstNames, rng)} ${pick(names.family, rng)}`
}

export const rollPersonality = (rng: Rng = defaultRng) => pick(PERSONALITY, rng)

export function rollAppearance(rng: Rng = defaultRng): string {
  const [a, b] = pickMany(APPEARANCE, 2, rng)
  return `Notable for ${a} and ${b}.`
}

export function rollHook(role: NpcRole, rng: Rng = defaultRng): string {
  return pick(role === 'enemy' ? ENEMY_HOOKS : ENCOUNTER_HOOKS, rng)
}

/** Resolves a "choose N from ..." block into concrete items. */
async function resolveChoice(choice: Choice, api: NpcApi, rng: Rng): Promise<EquipmentEntry[]> {
  const from = choice.from
  if (from.equipment_category) {
    const category = await api.get<EquipmentCategory>(
      `equipment-categories/${from.equipment_category.index}`,
    )
    // Categories also list magic items; starting gear is mundane equipment only.
    const mundane = category.equipment.filter((ref) => ref.url.includes('/equipment/'))
    return pickMany(mundane, choice.choose, rng).map((item) => ({ item, quantity: 1 }))
  }
  if (from.options) {
    const chosen = pickMany(from.options, choice.choose, rng)
    const resolved = await Promise.all(chosen.map((option) => resolveOption(option, api, rng)))
    return resolved.flat()
  }
  return []
}

async function resolveOption(option: Option, api: NpcApi, rng: Rng): Promise<EquipmentEntry[]> {
  if (option.option_type === 'reference' && option.item) {
    return [{ item: option.item, quantity: 1 }]
  }
  if (option.option_type === 'counted_reference' && option.of) {
    return [{ item: option.of, quantity: option.count ?? 1 }]
  }
  if (option.option_type === 'multiple' && option.items) {
    const parts = await Promise.all(option.items.map((item) => resolveOption(item, api, rng)))
    return parts.flat()
  }
  if (option.option_type === 'choice' && option.choice) {
    return resolveChoice(option.choice, api, rng)
  }
  return []
}

function mergeEntries(entries: EquipmentEntry[]): EquipmentEntry[] {
  const byIndex = new Map<string, EquipmentEntry>()
  for (const entry of entries) {
    const existing = byIndex.get(entry.item.index)
    if (existing) existing.quantity += entry.quantity
    else byIndex.set(entry.item.index, { ...entry })
  }
  return [...byIndex.values()]
}

function uniqueRefs(refs: ApiRef[]): ApiRef[] {
  return [...new Map(refs.map((ref) => [ref.index, ref])).values()]
}

export async function generateNpc(options: NpcOptions, deps: Deps): Promise<Character> {
  const { api } = deps
  const rng = deps.rng ?? defaultRng

  const role = options.role ?? pick(ROLES, rng)
  const gender = options.gender ?? pick(GENDERS, rng)
  const level = Math.min(20, Math.max(1, Math.round(options.level ?? 1)))
  const raceIndex = options.race ?? pick((await api.get<ApiList>('races')).results, rng).index
  const classIndex = options.class ?? pick((await api.get<ApiList>('classes')).results, rng).index

  const [race, cls, classLevel] = await Promise.all([
    api.get<Race>(`races/${raceIndex}`),
    api.get<Class>(`classes/${classIndex}`),
    api.get<ClassLevel>(`classes/${classIndex}/levels/${level}`),
  ])
  const subraceRef = race.subraces?.length ? pick(race.subraces, rng) : undefined
  const subrace = subraceRef ? await api.get<Subrace>(`subraces/${subraceRef.index}`) : undefined
  // Some racial traits grant proficiencies, e.g. an elf's Keen Senses.
  const traits = await Promise.all(
    [...(race.traits ?? []), ...(subrace?.racial_traits ?? [])].map((t) =>
      api.get<Trait>(`traits/${t.index}`).catch(() => undefined),
    ),
  )

  // Ability scores: standard array by class priority, racial bonuses, then ASIs.
  const priority = ABILITY_PRIORITY[cls.index] ?? DEFAULT_PRIORITY
  const fixedBonuses = [...race.ability_bonuses, ...(subrace?.ability_bonuses ?? [])]
    .filter((b) => isAbility(b.ability_score.index))
    .map((b) => ({ ability: b.ability_score.index as Ability, bonus: b.bonus }))
  const flexibleBonuses: { ability: Ability; bonus: number }[] = []
  const bonusOptions = race.ability_bonus_options
  if (bonusOptions?.from.options) {
    // e.g. half-elf: +1 to two abilities of your choice; prefer the class's best ones.
    const candidates = bonusOptions.from.options
      .filter((o) => o.option_type === 'ability_bonus' && o.ability_score)
      .map((o) => ({ ability: o.ability_score!.index as Ability, bonus: o.bonus ?? 1 }))
      .filter((o) => isAbility(o.ability) && !fixedBonuses.some((f) => f.ability === o.ability))
      .sort((a, b) => priority.indexOf(a.ability) - priority.indexOf(b.ability))
    flexibleBonuses.push(...candidates.slice(0, bonusOptions.choose))
  }
  const abilityScores = applyImprovements(
    applyBonuses(assignStandardArray(priority), [...fixedBonuses, ...flexibleBonuses]),
    classLevel.ability_score_bonuses ?? 0,
    priority,
  )
  const mod = (ability: Ability) => abilityModifier(abilityScores[ability])

  // Proficiencies: fixed ones plus random picks from the class's choices.
  const fixedProficiencies = [
    ...(race.starting_proficiencies ?? []),
    ...(subrace?.starting_proficiencies ?? []),
    ...traits.flatMap((t) => t?.proficiencies ?? []),
    ...(cls.proficiencies ?? []),
  ]
  const choices = [
    ...traits.flatMap((t) => (t?.proficiency_choices ? [t.proficiency_choices] : [])),
    ...(cls.proficiency_choices ?? []),
  ]
  const chosen: ApiRef[] = []
  for (const choice of choices) {
    // Resolve one by one and drop what is already known, so picks don't overlap.
    const known = new Set([...fixedProficiencies, ...chosen].map((p) => p.index))
    const options = choice.from.options?.filter((o) => !o.item || !known.has(o.item.index))
    const narrowed = options ? { ...choice, from: { ...choice.from, options } } : choice
    chosen.push(...(await resolveChoice(narrowed, api, rng)).map((entry) => entry.item))
  }
  const allProficiencies = uniqueRefs([...fixedProficiencies, ...chosen]).filter(
    (p) => !p.index.startsWith('saving-throw-'),
  )
  const skills = allProficiencies.filter((p) => p.index.startsWith('skill-'))
  const proficiencies = allProficiencies.filter((p) => !p.index.startsWith('skill-'))

  // Equipment: fixed starting gear plus one random pick per option.
  const optionalGear = await Promise.all(
    (cls.starting_equipment_options ?? []).map((choice) => resolveChoice(choice, api, rng)),
  )
  const equipment = mergeEntries([
    ...(cls.starting_equipment ?? []).map((e) => ({ item: e.equipment, quantity: e.quantity })),
    ...optionalGear.flat(),
  ])
  const itemDetails = (
    await Promise.all(
      equipment.map((e) => api.get<Equipment>(`equipment/${e.item.index}`).catch(() => undefined)),
    )
  ).filter((item): item is Equipment => item !== undefined)

  // Spells from the class list, limited to the slot levels the NPC can cast.
  let spells: SpellRef[] = []
  if (cls.spellcasting && classLevel.spellcasting) {
    const list = await api.get<ApiList<ClassSpellRef>>(`classes/${cls.index}/spells`)
    const maxSlot = highestSpellSlot(classLevel.spellcasting)
    const cantrips = pickMany(
      list.results.filter((s) => s.level === 0),
      classLevel.spellcasting.cantrips_known ?? 0,
      rng,
    )
    const castingAbility = cls.spellcasting.spellcasting_ability.index
    const leveled =
      maxSlot === 0
        ? []
        : pickMany(
            list.results.filter((s) => s.level >= 1 && s.level <= maxSlot),
            leveledSpellCount({
              classIndex: cls.index,
              level,
              spellsKnown: classLevel.spellcasting.spells_known,
              castingModifier: isAbility(castingAbility) ? mod(castingAbility) : 0,
            }),
            rng,
          )
    spells = [...cantrips, ...leveled]
      .map(({ index, name, url, level: spellLevel }) => ({ index, name, url, level: spellLevel }))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
  }

  const timestamp = (deps.now ?? new Date()).toISOString()
  const ref = ({ index, name, url }: { index: string; name: string; url?: string }): ApiRef => ({
    index,
    name,
    url: url ?? '',
  })

  return {
    id: deps.id ?? crypto.randomUUID(),
    name: rollName(race.index, gender, rng),
    role,
    gender,
    race: ref({ ...race, url: `/api/2014/races/${race.index}` }),
    subrace: subrace && ref({ ...subrace, url: `/api/2014/subraces/${subrace.index}` }),
    class: ref({ ...cls, url: `/api/2014/classes/${cls.index}` }),
    level,
    abilityScores,
    hitPoints: hitPoints(cls.hit_die, level, mod('con')),
    armorClass: armorClass({ classIndex: cls.index, scores: abilityScores, items: itemDetails }),
    speed: race.speed,
    proficiencyBonus: classLevel.prof_bonus ?? proficiencyBonus(level),
    savingThrows: (cls.saving_throws ?? []).map((s) => s.index).filter(isAbility),
    skills,
    proficiencies,
    spells,
    equipment,
    appearance: rollAppearance(rng),
    personality: rollPersonality(rng),
    hook: rollHook(role, rng),
    notes: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}
