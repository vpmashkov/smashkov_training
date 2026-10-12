import type { AppSettings, Profile, Program, Session, WeightLog } from '../types'
import { getDb } from './db'

export async function getProfile(): Promise<Profile | undefined> {
  return (await getDb()).get('profile', 'current')
}

export async function saveProfile(profile: Profile): Promise<void> {
  await (await getDb()).put('profile', profile)
}

export async function getSettings(): Promise<AppSettings> {
  const existing = await (await getDb()).get('settings', 'current')
  if (existing) return existing
  const initial: AppSettings = { id: 'current', activeProgramId: null }
  await (await getDb()).put('settings', initial)
  return initial
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await (await getDb()).put('settings', settings)
}

export async function listWeightLogs(): Promise<WeightLog[]> {
  const logs = await (await getDb()).getAll('weightLogs')
  return logs.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getWeightLog(date: string): Promise<WeightLog | undefined> {
  return (await getDb()).get('weightLogs', date)
}

export async function upsertWeightLog(log: WeightLog): Promise<void> {
  await (await getDb()).put('weightLogs', log)
}

export async function latestWeightLog(): Promise<WeightLog | undefined> {
  const logs = await listWeightLogs()
  return logs[logs.length - 1]
}

export async function listPrograms(): Promise<Program[]> {
  const programs = await (await getDb()).getAll('programs')
  return programs.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function getProgram(id: string): Promise<Program | undefined> {
  return (await getDb()).get('programs', id)
}

export async function saveProgram(program: Program): Promise<void> {
  await (await getDb()).put('programs', program)
}

export async function deleteProgram(id: string): Promise<void> {
  await (await getDb()).delete('programs', id)
}

export async function listSessions(programId?: string): Promise<Session[]> {
  const db = await getDb()
  if (programId) return db.getAllFromIndex('sessions', 'by-program', programId)
  return db.getAll('sessions')
}

export async function saveSession(session: Session): Promise<void> {
  await (await getDb()).put('sessions', session)
}

export async function getSession(id: string): Promise<Session | undefined> {
  return (await getDb()).get('sessions', id)
}

export async function deleteSession(id: string): Promise<void> {
  await (await getDb()).delete('sessions', id)
}
