import { displayToKg, kgToDisplay, weightUnitLabel } from '../domain/units'
import type { Units, WorkoutSet } from '../types'

interface SetRowProps {
  index: number
  set: WorkoutSet
  units: Units
  bodyweight?: boolean
  onChange: (set: WorkoutSet) => void
  onRemove: () => void
}

export function SetRow({ index, set, units, bodyweight, onChange, onRemove }: SetRowProps) {
  const weightValue =
    set.weightKg === null ? '' : String(kgToDisplay(set.weightKg, units))

  return (
    <div className="set-grid">
      <span>{index + 1}</span>
      {bodyweight ? (
        <span className="lede">BW</span>
      ) : (
        <input
          className="input"
          aria-label={`Set ${index + 1} weight (${weightUnitLabel(units)})`}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          value={weightValue}
          onChange={(event) =>
            onChange({
              ...set,
              weightKg: parseOptionalKg(event.target.value, units),
            })
          }
        />
      )}
      <input
        className="input"
        aria-label={`Set ${index + 1} reps`}
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        value={set.reps ?? ''}
        onChange={(event) =>
          onChange({
            ...set,
            reps: event.target.value === '' ? null : Number(event.target.value),
          })
        }
      />
      <button
        type="button"
        className="check"
        aria-pressed={set.done}
        aria-label={`Mark set ${index + 1} done`}
        onClick={() => onChange({ ...set, done: !set.done })}
      >
        {set.done ? '✓' : ''}
      </button>
      <button type="button" className="btn btn-ghost" aria-label={`Remove set ${index + 1}`} onClick={onRemove}>
        ✕
      </button>
    </div>
  )
}

function parseOptionalKg(value: string, units: Units): number | null {
  if (value === '') return null
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  return displayToKg(numeric, units)
}
