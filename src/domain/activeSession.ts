import type { Program, Profile, Session, WeightLog } from '../types'
import { findNextDay, previousCompletedSession } from './schedule'
import { createSessionFromDay } from './sessionFactory'
import { deleteSession, listSessions, saveSession } from '../storage/store'

const pending = new Map<string, Promise<Session | null>>()

export function ensureActiveSession(options: {
  program: Program
  profile: Profile
  latestWeight?: WeightLog
}): Promise<Session | null> {
  const existing = pending.get(options.program.id)
  if (existing) return existing
  const work = createOrResume(options)
  pending.set(options.program.id, work)
  return work.finally(() => pending.delete(options.program.id))
}

export async function discardOtherInProgress(
  programId: string,
  keepId: string,
): Promise<void> {
  const sessions = await listSessions(programId)
  await Promise.all(
    sessions
      .filter((session) => session.status === 'in_progress' && session.id !== keepId)
      .map((session) => deleteSession(session.id)),
  )
}

async function createOrResume(options: {
  program: Program
  profile: Profile
  latestWeight?: WeightLog
}): Promise<Session | null> {
  const sessions = await listSessions(options.program.id)
  await dropStaleInProgress(sessions)
  await keepSingleInProgress(await listSessions(options.program.id))
  const latest = await listSessions(options.program.id)
  const plan = findNextDay(options.program, latest)
  if (!plan) return null
  if (plan.resumeSession) return plan.resumeSession

  const previous = previousCompletedSession(
    latest,
    options.program.id,
    plan.day.id,
    plan.cycleIndex,
  )
  const created = createSessionFromDay({
    programId: options.program.id,
    day: plan.day,
    cycleIndex: plan.cycleIndex,
    previous,
    latestWeightKg: options.latestWeight?.weightKg,
    units: options.profile.units,
  })
  await saveSession(created)
  return created
}

async function dropStaleInProgress(sessions: Session[]): Promise<void> {
  const completedKeys = new Set(
    sessions
      .filter((session) => session.status === 'completed')
      .map((session) => `${session.programDayId}:${session.cycleIndex}`),
  )
  await Promise.all(
    sessions
      .filter(
        (session) =>
          session.status === 'in_progress' &&
          completedKeys.has(`${session.programDayId}:${session.cycleIndex}`),
      )
      .map((session) => deleteSession(session.id)),
  )
}

async function keepSingleInProgress(sessions: Session[]): Promise<void> {
  const open = sessions
    .filter((session) => session.status === 'in_progress')
    .sort((a, b) => filledSetCount(b) - filledSetCount(a))
  await Promise.all(open.slice(1).map((session) => deleteSession(session.id)))
}

function filledSetCount(session: Session): number {
  return session.exercises.reduce(
    (total, exercise) =>
      total +
      exercise.sets.filter(
        (set) => set.done || set.reps !== null || set.weightKg !== null,
      ).length,
    0,
  )
}
