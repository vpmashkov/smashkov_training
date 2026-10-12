import type { Program, ProgramDay, Session } from '../types'

export interface NextDayPlan {
  day: ProgramDay
  cycleIndex: number
  resumeSession: Session | null
}

export function findNextDay(
  program: Program,
  sessions: Session[],
): NextDayPlan | null {
  if (program.days.length === 0) return null

  const orderedDays = [...program.days].sort((a, b) => a.order - b.order)
  const programSessions = sessions.filter(
    (session) => session.programId === program.id,
  )

  const inProgress = latestInProgress(programSessions)
  if (inProgress) {
    const day = orderedDays.find((item) => item.id === inProgress.programDayId)
    if (day) {
      return { day, cycleIndex: inProgress.cycleIndex, resumeSession: inProgress }
    }
  }

  const lastCompleted = latestCompleted(programSessions)
  if (!lastCompleted) {
    return { day: orderedDays[0], cycleIndex: 0, resumeSession: null }
  }

  const lastIndex = orderedDays.findIndex(
    (day) => day.id === lastCompleted.programDayId,
  )
  const isLastDay = lastIndex === -1 || lastIndex === orderedDays.length - 1
  if (isLastDay) {
    return {
      day: orderedDays[0],
      cycleIndex: lastCompleted.cycleIndex + 1,
      resumeSession: null,
    }
  }

  return {
    day: orderedDays[lastIndex + 1],
    cycleIndex: lastCompleted.cycleIndex,
    resumeSession: null,
  }
}

export function previousCompletedSession(
  sessions: Session[],
  programId: string,
  programDayId: string,
  cycleIndex: number,
): Session | undefined {
  return sessions
    .filter(
      (session) =>
        session.programId === programId &&
        session.programDayId === programDayId &&
        session.status === 'completed' &&
        session.cycleIndex < cycleIndex,
    )
    .sort((a, b) => b.cycleIndex - a.cycleIndex)[0]
}

function latestInProgress(sessions: Session[]): Session | undefined {
  return sessions
    .filter((session) => session.status === 'in_progress')
    .sort(byRecency)[0]
}

function latestCompleted(sessions: Session[]): Session | undefined {
  return sessions
    .filter((session) => session.status === 'completed')
    .sort(byRecency)[0]
}

function byRecency(a: Session, b: Session): number {
  if (b.cycleIndex !== a.cycleIndex) return b.cycleIndex - a.cycleIndex
  return (b.completedAt ?? b.date).localeCompare(a.completedAt ?? a.date)
}
