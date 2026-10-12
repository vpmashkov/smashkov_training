import type { CatalogExercise, Units, WorkoutSet } from '../types'
import { loadIncrementKg } from './units'

const REP_CEILING = 12

/**
 * v1 progression: +1 rep at the same load, or bump load if every set hit the
 * rep ceiling. Replace this later with a more accurate set/rep equivalence.
 */
export function suggestNextSets(
  previousSets: WorkoutSet[],
  _exercise: CatalogExercise,
  units: Units,
): WorkoutSet[] {
  if (previousSets.length === 0) return []

  const completed = previousSets.filter(hasLoggedWork)
  if (completed.length === 0) {
    return previousSets.map(emptySuggestionFrom)
  }

  if (allSetsAtCeiling(completed)) {
    return bumpLoadAndResetReps(completed, units)
  }

  return completed.map((set) => ({
    reps: (set.reps ?? 0) + 1,
    weightKg: set.weightKg,
    done: false,
  }))
}

function hasLoggedWork(set: WorkoutSet): boolean {
  return set.reps !== null && set.reps > 0 && set.weightKg !== null
}

function allSetsAtCeiling(sets: WorkoutSet[]): boolean {
  return sets.every((set) => (set.reps ?? 0) >= REP_CEILING)
}

function bumpLoadAndResetReps(sets: WorkoutSet[], units: Units): WorkoutSet[] {
  const increment = loadIncrementKg(units)
  const resetReps = sets[0]?.reps ?? REP_CEILING
  return sets.map((set) => ({
    reps: resetReps,
    weightKg: (set.weightKg ?? 0) + increment,
    done: false,
  }))
}

function emptySuggestionFrom(set: WorkoutSet): WorkoutSet {
  return { reps: set.reps, weightKg: set.weightKg, done: false }
}

export function blankSets(count: number): WorkoutSet[] {
  return Array.from({ length: count }, () => ({
    reps: null,
    weightKg: null,
    done: false,
  }))
}
