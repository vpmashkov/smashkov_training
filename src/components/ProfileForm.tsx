import { useState, type FormEvent } from 'react'
import type { Profile, Sex, Units } from '../types'
import {
  cmToFeetInches,
  displayToKg,
  feetInchesToCm,
  heightUnitLabel,
  kgToDisplay,
  weightUnitLabel,
} from '../domain/units'

export interface ProfileSubmit {
  name: string
  sex: Sex
  dateOfBirth: string
  heightCm: number
  units: Units
  weightKg: number
}

interface ProfileFormProps {
  initial?: Profile
  initialWeightKg?: number
  submitLabel: string
  onSubmit: (data: ProfileSubmit) => Promise<void>
}

export function ProfileForm({
  initial,
  initialWeightKg,
  submitLabel,
  onSubmit,
}: ProfileFormProps) {
  const [units, setUnits] = useState<Units>(initial?.units ?? 'metric')
  const [name, setName] = useState(initial?.name ?? '')
  const [sex, setSex] = useState<Sex>(initial?.sex ?? 'male')
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? '')
  const [weight, setWeight] = useState(
    String(kgToDisplay(initialWeightKg ?? 80, units)),
  )
  const heightParts = cmToFeetInches(initial?.heightCm ?? 175)
  const [heightMetric, setHeightMetric] = useState(String(initial?.heightCm ?? 175))
  const [feet, setFeet] = useState(String(heightParts.feet))
  const [inches, setInches] = useState(String(heightParts.inches))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const parsed = parseProfile({
      name,
      sex,
      dateOfBirth,
      units,
      weight,
      heightMetric,
      feet,
      inches,
    })
    if ('error' in parsed) {
      setError(parsed.error)
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSubmit(parsed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="chip-row" role="group" aria-label="Units">
        <button
          type="button"
          className="chip"
          aria-pressed={units === 'metric'}
          onClick={() => switchUnits('metric', units, weight, setUnits, setWeight)}
        >
          Metric
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={units === 'imperial'}
          onClick={() => switchUnits('imperial', units, weight, setUnits, setWeight)}
        >
          Imperial
        </button>
      </div>
      <label className="field">
        <span>Name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field">
        <span>Weight ({weightUnitLabel(units)})</span>
        <input
          className="input"
          type="number"
          inputMode="decimal"
          min="1"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>Date of birth</span>
        <input
          className="input"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>Sex</span>
        <select className="select" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>
      {units === 'metric' ? (
        <label className="field">
          <span>Height ({heightUnitLabel(units)})</span>
          <input
            className="input"
            type="number"
            min="50"
            step="0.1"
            value={heightMetric}
            onChange={(e) => setHeightMetric(e.target.value)}
            required
          />
        </label>
      ) : (
        <div className="row">
          <label className="field">
            <span>Height (ft)</span>
            <input
              className="input"
              type="number"
              min="1"
              value={feet}
              onChange={(e) => setFeet(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Height (in)</span>
            <input
              className="input"
              type="number"
              min="0"
              max="11.9"
              step="0.1"
              value={inches}
              onChange={(e) => setInches(e.target.value)}
              required
            />
          </label>
        </div>
      )}
      {error ? <p className="lede">{error}</p> : null}
      <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
        {submitLabel}
      </button>
    </form>
  )
}

function switchUnits(
  next: Units,
  current: Units,
  weight: string,
  setUnits: (units: Units) => void,
  setWeight: (value: string) => void,
) {
  if (next === current) return
  const numeric = Number(weight)
  if (Number.isFinite(numeric) && numeric > 0) {
    const kg = displayToKg(numeric, current)
    setWeight(String(kgToDisplay(kg, next)))
  }
  setUnits(next)
}

function parseProfile(input: {
  name: string
  sex: Sex
  dateOfBirth: string
  units: Units
  weight: string
  heightMetric: string
  feet: string
  inches: string
}): ProfileSubmit | { error: string } {
  const name = input.name.trim()
  const weightValue = Number(input.weight)
  if (!name) return { error: 'Please enter your name.' }
  if (!input.dateOfBirth) return { error: 'Please enter your date of birth.' }
  if (!Number.isFinite(weightValue) || weightValue <= 0) {
    return { error: 'Please enter a valid weight.' }
  }
  const heightCm =
    input.units === 'metric'
      ? Number(input.heightMetric)
      : feetInchesToCm(Number(input.feet), Number(input.inches))
  if (!Number.isFinite(heightCm) || heightCm < 50) {
    return { error: 'Please enter a valid height.' }
  }
  return {
    name,
    sex: input.sex,
    dateOfBirth: input.dateOfBirth,
    heightCm,
    units: input.units,
    weightKg: displayToKg(weightValue, input.units),
  }
}
