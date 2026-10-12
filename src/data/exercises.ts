import type { CatalogExercise, MuscleGroupId } from '../types'

export const EXERCISES: CatalogExercise[] = [
  {
    id: 'bench-press',
    name: 'Barbell bench press',
    movement: 'compound',
    load: 'external',
    primary: 'chest',
    secondary: ['front_delts', 'triceps'],
  },
  {
    id: 'back-squat',
    name: 'Back squat',
    movement: 'compound',
    load: 'external',
    primary: 'quads',
    secondary: ['glutes', 'hamstrings', 'lower_back'],
  },
  {
    id: 'deadlift',
    name: 'Conventional deadlift',
    movement: 'compound',
    load: 'external',
    primary: 'hamstrings',
    secondary: ['glutes', 'lower_back', 'upper_back', 'lats', 'forearms'],
  },
  {
    id: 'overhead-press',
    name: 'Overhead press',
    movement: 'compound',
    load: 'external',
    primary: 'front_delts',
    secondary: ['side_delts', 'triceps', 'chest'],
  },
  {
    id: 'barbell-row',
    name: 'Barbell row',
    movement: 'compound',
    load: 'external',
    primary: 'lats',
    secondary: ['upper_back', 'biceps', 'rear_delts'],
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    movement: 'compound',
    load: 'bodyweight',
    primary: 'lats',
    secondary: ['biceps', 'rear_delts'],
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian deadlift',
    movement: 'compound',
    load: 'external',
    primary: 'hamstrings',
    secondary: ['glutes', 'lower_back'],
  },
  {
    id: 'dips',
    name: 'Dips',
    movement: 'compound',
    load: 'bodyweight',
    primary: 'chest',
    secondary: ['triceps', 'front_delts'],
  },
  {
    id: 'lateral-raise',
    name: 'Lateral raise',
    movement: 'isolation',
    load: 'external',
    primary: 'side_delts',
    secondary: [],
  },
  {
    id: 'biceps-curl',
    name: 'Biceps curl',
    movement: 'isolation',
    load: 'external',
    primary: 'biceps',
    secondary: ['forearms'],
  },
  {
    id: 'triceps-pushdown',
    name: 'Triceps pushdown',
    movement: 'isolation',
    load: 'external',
    primary: 'triceps',
    secondary: [],
  },
  {
    id: 'leg-curl',
    name: 'Leg curl',
    movement: 'isolation',
    load: 'external',
    primary: 'hamstrings',
    secondary: [],
  },
  {
    id: 'leg-extension',
    name: 'Leg extension',
    movement: 'isolation',
    load: 'external',
    primary: 'quads',
    secondary: [],
  },
  {
    id: 'calf-raise',
    name: 'Calf raise',
    movement: 'isolation',
    load: 'external',
    primary: 'calves',
    secondary: [],
  },
  {
    id: 'face-pull',
    name: 'Face pull',
    movement: 'isolation',
    load: 'external',
    primary: 'rear_delts',
    secondary: ['upper_back'],
  },
  {
    id: 'plank',
    name: 'Plank',
    movement: 'isolation',
    load: 'bodyweight',
    primary: 'abs',
    secondary: [],
  },
]

export function getExercise(id: string): CatalogExercise | undefined {
  return EXERCISES.find((exercise) => exercise.id === id)
}

export function defaultSetCount(exercise: CatalogExercise): number {
  return exercise.movement === 'compound' ? 2 : 3
}

export function exercisesForMuscle(groupId: MuscleGroupId): CatalogExercise[] {
  return EXERCISES.filter(
    (exercise) =>
      exercise.primary === groupId || exercise.secondary.includes(groupId),
  )
}
