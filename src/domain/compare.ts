import { getExercise } from '../data/exercises'
import { bestEstimatedOneRm, exerciseVolumeKg } from './strength'
import type { Session } from '../types'

export interface ExerciseImprovement {
  exerciseId: string
  name: string
  volumeDeltaKg: number
  oneRmDeltaKg: number
}

export function compareSessions(
  current: Session,
  previous: Session,
): ExerciseImprovement[] {
  return current.exercises.flatMap((exercise) => {
    const catalog = getExercise(exercise.exerciseId)
    if (!catalog) return []
    const prior = previous.exercises.find(
      (item) => item.exerciseId === exercise.exerciseId,
    )
    const previousVolume = prior ? exerciseVolumeKg(prior) : 0
    const previousOneRm = prior ? bestEstimatedOneRm(prior) : 0
    return [
      {
        exerciseId: exercise.exerciseId,
        name: catalog.name,
        volumeDeltaKg: exerciseVolumeKg(exercise) - previousVolume,
        oneRmDeltaKg: bestEstimatedOneRm(exercise) - previousOneRm,
      },
    ]
  })
}
