import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getExercise } from '../data/exercises'
import { ExerciseSessionCard } from '../components/ExerciseSessionCard'
import { ImprovementModal } from '../components/ImprovementModal'
import { WeightInputCard } from '../components/WeightInputCard'
import { discardOtherInProgress, ensureActiveSession } from '../domain/activeSession'
import { compareSessions, type ExerciseImprovement } from '../domain/compare'
import { todayIsoDate } from '../domain/dates'
import { previousCompletedSession } from '../domain/schedule'
import { saveSession } from '../storage/store'
import { useAppState } from '../state/AppState'
import type { Session, SessionExercise } from '../types'

export function TodayPage() {
  const { profile, settings, programs, sessions, weightLogs, reload } = useAppState()
  const [session, setSession] = useState<Session | null>(null)
  const [improvements, setImprovements] = useState<ExerciseImprovement[] | null>(null)

  const program = programs.find((item) => item.id === settings.activeProgramId)
  const todayLog = weightLogs.find((log) => log.date === todayIsoDate())
  const latestWeight = weightLogs[weightLogs.length - 1]

  useEffect(() => {
    if (!program || !profile) {
      setSession(null)
      return
    }
    let cancelled = false
    void ensureActiveSession({ program, profile, latestWeight }).then((next) => {
      if (!cancelled) setSession(next)
    })
    return () => {
      cancelled = true
    }
  }, [program?.id, profile?.createdAt])

  async function updateSession(next: Session) {
    setSession(next)
    await saveSession(next)
  }

  async function completeWorkout() {
    if (!session || !program || !profile) return
    const completed: Session = {
      ...session,
      status: 'completed',
      completedAt: new Date().toISOString(),
      date: todayIsoDate(),
    }
    await saveSession(completed)
    await discardOtherInProgress(program.id, completed.id)
    const previous = previousCompletedSession(
      sessions,
      program.id,
      completed.programDayId,
      completed.cycleIndex,
    )
    if (previous) setImprovements(compareSessions(completed, previous))
    await reload()
    const next = await ensureActiveSession({ program, profile, latestWeight })
    setSession(next)
  }

  if (!profile) return null

  if (!program) {
    return (
      <main className="page">
        <p className="kicker">Today</p>
        <h1>No active program</h1>
        <p className="lede">Build a program, then this screen will open the next undone day.</p>
        <Link className="btn btn-primary" to="/program">
          Create a program
        </Link>
      </main>
    )
  }

  if (program.days.length === 0) {
    return (
      <main className="page">
        <p className="kicker">{program.name}</p>
        <h1>Add a training day</h1>
        <p className="lede">Your program has no days yet.</p>
        <Link className="btn btn-primary" to="/program">
          Edit program
        </Link>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="page">
        <p className="lede">Loading today’s workout…</p>
      </main>
    )
  }

  const dayName =
    program.days.find((day) => day.id === session.programDayId)?.name ?? 'Workout'

  return (
    <main className="page">
      <p className="kicker">{program.name}</p>
      <h1>{dayName}</h1>
      <p className="lede">
        Cycle {session.cycleIndex + 1}. Mark sets done, then finish the day.
      </p>
      {!todayLog ? (
        <WeightInputCard
          units={profile.units}
          latestKg={latestWeight?.weightKg}
          onSaved={reload}
        />
      ) : null}
      {session.exercises.length === 0 ? (
        <section className="card">
          <p className="empty">This day has no exercises yet.</p>
          <Link className="btn btn-secondary btn-block" to="/program">
            Add exercises
          </Link>
        </section>
      ) : null}
      {session.exercises.map((exercise, index) => (
        <ExerciseSessionCard
          key={exercise.exerciseId}
          exercise={exercise}
          units={profile.units}
          onChange={(next) =>
            void updateSession({
              ...session,
              exercises: replaceExercise(session.exercises, index, next),
            })
          }
        />
      ))}
      {session.exercises.length > 0 ? (
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => void completeWorkout()}
          disabled={!canComplete(session)}
        >
          Finish workout
        </button>
      ) : null}
      {improvements ? (
        <ImprovementModal
          items={improvements}
          units={profile.units}
          onClose={() => setImprovements(null)}
        />
      ) : null}
    </main>
  )
}

function replaceExercise(
  exercises: SessionExercise[],
  index: number,
  next: SessionExercise,
): SessionExercise[] {
  return exercises.map((exercise, itemIndex) => (itemIndex === index ? next : exercise))
}

function canComplete(session: Session): boolean {
  if (session.exercises.length === 0) return false
  return session.exercises.every((exercise) => {
    if (exercise.sets.length === 0) return false
    const catalog = getExercise(exercise.exerciseId)
    return exercise.sets.every((set) => {
      if (!set.done || set.reps === null || set.reps <= 0) return false
      if (catalog?.load === 'bodyweight') return true
      return set.weightKg !== null
    })
  })
}
