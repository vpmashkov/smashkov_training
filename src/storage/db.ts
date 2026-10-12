import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { AppSettings, Profile, Program, Session, WeightLog } from '../types'

interface TrainingSchema extends DBSchema {
  profile: {
    key: string
    value: Profile
  }
  settings: {
    key: string
    value: AppSettings
  }
  weightLogs: {
    key: string
    value: WeightLog
  }
  programs: {
    key: string
    value: Program
  }
  sessions: {
    key: string
    value: Session
    indexes: { 'by-program': string }
  }
}

const DB_NAME = 'smashkov-training'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<TrainingSchema>> | null = null

export function getDb(): Promise<IDBPDatabase<TrainingSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<TrainingSchema>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        database.createObjectStore('profile', { keyPath: 'id' })
        database.createObjectStore('settings', { keyPath: 'id' })
        database.createObjectStore('weightLogs', { keyPath: 'date' })
        database.createObjectStore('programs', { keyPath: 'id' })
        const sessions = database.createObjectStore('sessions', { keyPath: 'id' })
        sessions.createIndex('by-program', 'programId')
      },
    })
  }
  return dbPromise
}

export async function deleteDatabase(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise
    db.close()
    dbPromise = null
  }
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}
