import { getExercise } from '../data/exercises'
import { muscleGroupLabel } from '../data/muscleGroups'
import { formatWeight } from '../domain/units'
import type { SessionExercise, Units, WorkoutSet } from '../types'
import { SetRow } from './SetRow'

interface ExerciseSessionCardProps {
  exercise: SessionExercise
  units: Units
  onChange: (exercise: SessionExercise) => void
}

export function ExerciseSessionCard({
  exercise,
  units,
  onChange,
}: ExerciseSessionCardProps) {
  const catalog = getExercise(exercise.exerciseId)
  if (!catalog) return null
  const bodyweight = catalog.load === 'bodyweight'

  function updateSet(index: number, next: WorkoutSet) {
    const sets = exercise.sets.map((set, setIndex) => (setIndex === index ? next : set))
    onChange({ ...exercise, sets })
  }

  function removeSet(index: number) {
    onChange({ ...exercise, sets: exercise.sets.filter((_, setIndex) => setIndex !== index) })
  }

  function addSet() {
    const last = exercise.sets[exercise.sets.length - 1]
    onChange({
      ...exercise,
      sets: [
        ...exercise.sets,
        {
          reps: last?.reps ?? null,
          weightKg: last?.weightKg ?? null,
          done: false,
        },
      ],
    })
  }

  return (
    <article className="card stack">
      <div>
        <h2>{catalog.name}</h2>
        <p className="lede">
          {muscleGroupLabel(catalog.primary)}
          {catalog.secondary.length
            ? ` · also ${catalog.secondary.map(muscleGroupLabel).join(', ')}`
            : ''}
        </p>
        {bodyweight && exercise.bodyweightKg ? (
          <p className="lede">Using bodyweight {formatWeight(exercise.bodyweightKg, units)}</p>
        ) : null}
      </div>
      <div className="set-grid set-head">
        <span>#</span>
        <span>{bodyweight ? 'Load' : 'Weight'}</span>
        <span>Reps</span>
        <span>Done</span>
        <span />
      </div>
      {exercise.sets.map((set, index) => (
        <SetRow
          key={index}
          index={index}
          set={set}
          units={units}
          bodyweight={bodyweight}
          onChange={(next) => updateSet(index, next)}
          onRemove={() => removeSet(index)}
        />
      ))}
      <button type="button" className="btn btn-secondary" onClick={addSet}>
        Add set
      </button>
    </article>
  )
}
