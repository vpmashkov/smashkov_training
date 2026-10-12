import type { MuscleGroupId } from '../types'

export interface MuscleGroupDef {
  id: MuscleGroupId
  label: string
}

export const MUSCLE_GROUPS: MuscleGroupDef[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'lats', label: 'Lats' },
  { id: 'upper_back', label: 'Upper back' },
  { id: 'front_delts', label: 'Front delts' },
  { id: 'side_delts', label: 'Side delts' },
  { id: 'rear_delts', label: 'Rear delts' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'forearms', label: 'Forearms' },
  { id: 'quads', label: 'Quads' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'calves', label: 'Calves' },
  { id: 'abs', label: 'Abs' },
  { id: 'lower_back', label: 'Lower back' },
]

export function muscleGroupLabel(id: MuscleGroupId): string {
  return MUSCLE_GROUPS.find((group) => group.id === id)?.label ?? id
}
