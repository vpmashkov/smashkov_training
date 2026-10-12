import { useMemo, useState } from 'react'
import { defaultSetCount, EXERCISES } from '../data/exercises'
import { MUSCLE_GROUPS, muscleGroupLabel } from '../data/muscleGroups'
import type { CatalogExercise, MuscleGroupId } from '../types'

interface ExercisePickerProps {
  onPick: (exercise: CatalogExercise) => void
  onClose: () => void
}

export function ExercisePicker({ onPick, onClose }: ExercisePickerProps) {
  const [group, setGroup] = useState<MuscleGroupId>(MUSCLE_GROUPS[0].id)
  const matches = useMemo(
    () =>
      EXERCISES.filter(
        (exercise) => exercise.primary === group || exercise.secondary.includes(group),
      ),
    [group],
  )

  return (
    <div className="stack">
      <label className="field">
        <span>Muscle group</span>
        <select
          className="select"
          value={group}
          onChange={(event) => setGroup(event.target.value as MuscleGroupId)}
        >
          {MUSCLE_GROUPS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      {matches.map((exercise) => (
        <button
          key={exercise.id}
          type="button"
          className="btn btn-secondary"
          onClick={() => onPick(exercise)}
        >
          {exercise.name}
          <span className="lede">
            {' '}
            · {exercise.movement} · {defaultSetCount(exercise)} sets ·{' '}
            {muscleGroupLabel(exercise.primary)}
          </span>
        </button>
      ))}
      <button type="button" className="btn btn-ghost btn-block" onClick={onClose}>
        Cancel
      </button>
    </div>
  )
}
