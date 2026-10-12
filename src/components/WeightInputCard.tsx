import { useState, type FormEvent } from 'react'
import { todayIsoDate } from '../domain/dates'
import { displayToKg, kgToDisplay, weightUnitLabel } from '../domain/units'
import { upsertWeightLog } from '../storage/store'
import type { Units } from '../types'

interface WeightInputCardProps {
  units: Units
  latestKg?: number
  onSaved: () => Promise<void>
}

export function WeightInputCard({ units, latestKg, onSaved }: WeightInputCardProps) {
  const [value, setValue] = useState(
    latestKg !== undefined ? String(kgToDisplay(latestKg, units)) : '',
  )
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const numeric = Number(value)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    setSaving(true)
    await upsertWeightLog({ date: todayIsoDate(), weightKg: displayToKg(numeric, units) })
    await onSaved()
    setSaving(false)
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <p className="kicker">Today</p>
      <h2>Log your weight</h2>
      <p className="lede">One check-in per day. This also updates bodyweight exercises.</p>
      <label className="field">
        <span>Weight ({weightUnitLabel(units)})</span>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          min="1"
          step="0.1"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
        />
      </label>
      <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
        Save weight
      </button>
    </form>
  )
}
