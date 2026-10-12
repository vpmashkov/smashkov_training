import { getExercise } from '../data/exercises'
import type { MuscleGroupId, Session, SessionExercise } from '../types'

export function estimatedOneRm(weightKg: number, reps: number): number {
  if (reps <= 0) return 0
  return weightKg * (1 + reps / 30)
}

export function setLoadKg(
  exercise: SessionExercise,
  weightKg: number | null,
): number | null {
  const catalog = getExercise(exercise.exerciseId)
  if (!catalog) return weightKg
  if (catalog.load === 'bodyweight') {
    return exercise.bodyweightKg ?? weightKg
  }
  return weightKg
}

export function sessionVolumeKg(session: Session): number {
  return session.exercises.reduce(
    (total, exercise) => total + exerciseVolumeKg(exercise),
    0,
  )
}

export function exerciseVolumeKg(exercise: SessionExercise): number {
  return exercise.sets.reduce((total, set) => {
    if (!set.done || set.reps === null || set.reps <= 0) return total
    const load = setLoadKg(exercise, set.weightKg)
    if (load === null) return total
    return total + load * set.reps
  }, 0)
}

export function bestEstimatedOneRm(exercise: SessionExercise): number {
  return exercise.sets.reduce((best, set) => {
    if (!set.done || set.reps === null || set.reps <= 0) return best
    const load = setLoadKg(exercise, set.weightKg)
    if (load === null) return best
    return Math.max(best, estimatedOneRm(load, set.reps))
  }, 0)
}

export function dailyPrimaryVolume(
  sessions: Session[],
  muscle: MuscleGroupId,
): { date: string; volumeKg: number }[] {
  const byDate = new Map<string, number>()
  for (const session of sessions) {
    if (session.status !== 'completed') continue
    let volume = 0
    for (const exercise of session.exercises) {
      const catalog = getExercise(exercise.exerciseId)
      if (catalog?.primary !== muscle) continue
      volume += exerciseVolumeKg(exercise)
    }
    if (volume <= 0) continue
    byDate.set(session.date, (byDate.get(session.date) ?? 0) + volume)
  }
  return [...byDate.entries()]
    .map(([date, volumeKg]) => ({ date, volumeKg }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function dailyExerciseOneRm(
  sessions: Session[],
  exerciseId: string,
): { date: string; oneRmKg: number }[] {
  const byDate = new Map<string, number>()
  for (const session of sessions) {
    if (session.status !== 'completed') continue
    const exercise = session.exercises.find((item) => item.exerciseId === exerciseId)
    if (!exercise) continue
    const oneRm = bestEstimatedOneRm(exercise)
    if (oneRm <= 0) continue
    const current = byDate.get(session.date) ?? 0
    byDate.set(session.date, Math.max(current, oneRm))
  }
  return [...byDate.entries()]
    .map(([date, oneRmKg]) => ({ date, oneRmKg }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
