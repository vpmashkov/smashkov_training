import { useState } from 'react'
import { ExercisePicker } from '../components/ExercisePicker'
import { Modal } from '../components/Modal'
import { defaultSetCount, getExercise } from '../data/exercises'
import { muscleGroupLabel } from '../data/muscleGroups'
import { createId } from '../domain/ids'
import { deleteProgram, saveProgram, saveSettings } from '../storage/store'
import { useAppState } from '../state/AppState'
import type { CatalogExercise, Program, ProgramDay } from '../types'

export function ProgramPage() {
  const { programs, settings, reload } = useAppState()
  const [name, setName] = useState('')
  const [pickerDayId, setPickerDayId] = useState<string | null>(null)
  const active = programs.find((program) => program.id === settings.activeProgramId)

  async function createProgram() {
    const trimmed = name.trim()
    if (!trimmed) return
    const program: Program = {
      id: createId(),
      name: trimmed,
      createdAt: new Date().toISOString(),
      days: [],
    }
    await saveProgram(program)
    if (!settings.activeProgramId) {
      await saveSettings({ ...settings, activeProgramId: program.id })
    }
    setName('')
    await reload()
  }

  async function activate(id: string) {
    await saveSettings({ ...settings, activeProgramId: id })
    await reload()
  }

  async function removeProgram(id: string) {
    await deleteProgram(id)
    if (settings.activeProgramId === id) {
      const remaining = programs.filter((program) => program.id !== id)
      await saveSettings({
        ...settings,
        activeProgramId: remaining[0]?.id ?? null,
      })
    }
    await reload()
  }

  async function updateProgram(program: Program) {
    await saveProgram(program)
    await reload()
  }

  const editing = active
  const pickerProgram = editing

  return (
    <main className="page">
      <p className="kicker">Programs</p>
      <h1>Build your plan</h1>
      <p className="lede">Multiple programs are fine. Home always uses the active one.</p>
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault()
          void createProgram()
        }}
      >
        <label className="field">
          <span>New program name</span>
          <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">
          Create program
        </button>
      </form>
      {programs.map((program) => (
        <article key={program.id} className="card stack">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2>{program.name}</h2>
            {program.id === settings.activeProgramId ? <span className="badge">Active</span> : null}
          </div>
          <div className="row">
            {program.id !== settings.activeProgramId ? (
              <button type="button" className="btn btn-secondary" onClick={() => void activate(program.id)}>
                Set active
              </button>
            ) : null}
            <button type="button" className="btn btn-danger" onClick={() => void removeProgram(program.id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
      {editing ? (
        <DayList
          program={editing}
          onChange={(program) => void updateProgram(program)}
          onAddExercise={(dayId) => setPickerDayId(dayId)}
        />
      ) : (
        <p className="empty">Create a program to add days and exercises.</p>
      )}
      {pickerDayId && pickerProgram ? (
        <Modal title="Add an exercise" onClose={() => setPickerDayId(null)}>
          <ExercisePicker
            onClose={() => setPickerDayId(null)}
            onPick={(exercise) => {
              void updateProgram(addExerciseToDay(pickerProgram, pickerDayId, exercise))
              setPickerDayId(null)
            }}
          />
        </Modal>
      ) : null}
    </main>
  )
}

function DayList({
  program,
  onChange,
  onAddExercise,
}: {
  program: Program
  onChange: (program: Program) => void
  onAddExercise: (dayId: string) => void
}) {
  const ordered = [...program.days].sort((a, b) => a.order - b.order)

  function addDay() {
    const day: ProgramDay = {
      id: createId(),
      name: `Day ${program.days.length + 1}`,
      order: program.days.length,
      exercises: [],
    }
    onChange({ ...program, days: [...program.days, day] })
  }

  return (
    <section className="stack">
      <h2>Days in {program.name}</h2>
      {ordered.map((day) => (
        <article key={day.id} className="card stack">
          <label className="field">
            <span>Day name</span>
            <input
              className="input"
              value={day.name}
              onChange={(event) =>
                onChange(renameDay(program, day.id, event.target.value))
              }
            />
          </label>
          {day.exercises.map((item) => {
            const catalog = getExercise(item.exerciseId)
            if (!catalog) return null
            return (
              <div key={item.exerciseId} className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{catalog.name}</strong>
                  <p className="lede">
                    {muscleGroupLabel(catalog.primary)} · {item.targetSets} sets
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onChange(removeExercise(program, day.id, item.exerciseId))}
                >
                  Remove
                </button>
              </div>
            )
          })}
          <button type="button" className="btn btn-secondary" onClick={() => onAddExercise(day.id)}>
            Add exercise
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onChange(removeDay(program, day.id))}
          >
            Remove day
          </button>
        </article>
      ))}
      <button type="button" className="btn btn-primary" onClick={addDay}>
        Add day
      </button>
    </section>
  )
}

function renameDay(program: Program, dayId: string, name: string): Program {
  return {
    ...program,
    days: program.days.map((day) => (day.id === dayId ? { ...day, name } : day)),
  }
}

function removeDay(program: Program, dayId: string): Program {
  return {
    ...program,
    days: program.days
      .filter((day) => day.id !== dayId)
      .map((day, index) => ({ ...day, order: index })),
  }
}

function removeExercise(program: Program, dayId: string, exerciseId: string): Program {
  return {
    ...program,
    days: program.days.map((day) =>
      day.id === dayId
        ? { ...day, exercises: day.exercises.filter((item) => item.exerciseId !== exerciseId) }
        : day,
    ),
  }
}

function addExerciseToDay(
  program: Program,
  dayId: string,
  exercise: CatalogExercise,
): Program {
  return {
    ...program,
    days: program.days.map((day) => {
      if (day.id !== dayId) return day
      if (day.exercises.some((item) => item.exerciseId === exercise.id)) return day
      return {
        ...day,
        exercises: [
          ...day.exercises,
          { exerciseId: exercise.id, targetSets: defaultSetCount(exercise) },
        ],
      }
    }),
  }
}
