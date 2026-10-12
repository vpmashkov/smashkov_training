import { getExercise, defaultSetCount } from '../data/exercises'
import type { ProgramDay, Session, SessionExercise, Units, WorkoutSet } from '../types'
import { createId } from './ids'
import { todayIsoDate } from './dates'
import { blankSets, suggestNextSets } from './progression'

export function createSessionFromDay(options: {
  programId: string
  day: ProgramDay
  cycleIndex: number
  previous?: Session
  latestWeightKg?: number
  units: Units
}): Session {
  return {
    id: createId(),
    programId: options.programId,
    programDayId: options.day.id,
    cycleIndex: options.cycleIndex,
    date: todayIsoDate(),
    status: 'in_progress',
    exercises: options.day.exercises.map((item) =>
      createSessionExercise(
        item.exerciseId,
        item.targetSets,
        options.previous,
        options.latestWeightKg,
        options.units,
      ),
    ),
  }
}

function createSessionExercise(
  exerciseId: string,
  targetSets: number,
  previous: Session | undefined,
  latestWeightKg: number | undefined,
  units: Units,
): SessionExercise {
  const catalog = getExercise(exerciseId)
  const setCount = targetSets || (catalog ? defaultSetCount(catalog) : 3)
  const previousExercise = previous?.exercises.find(
    (item) => item.exerciseId === exerciseId,
  )
  const suggested = previousExercise && catalog
    ? suggestNextSets(previousExercise.sets, catalog, units)
    : []
  const sets = padSets(suggested, setCount)

  return {
    exerciseId,
    bodyweightKg: catalog?.load === 'bodyweight' ? latestWeightKg : undefined,
    sets,
  }
}

function padSets(suggested: WorkoutSet[], targetSets: number): WorkoutSet[] {
  if (suggested.length >= targetSets) return suggested.slice(0, targetSets)
  return [...suggested, ...blankSets(targetSets - suggested.length)]
}
