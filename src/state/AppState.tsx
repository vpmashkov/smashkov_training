import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppSettings, Profile, Program, Session, WeightLog } from '../types'
import {
  getProfile,
  getSettings,
  listPrograms,
  listSessions,
  listWeightLogs,
} from '../storage/store'

export interface AppSnapshot {
  profile: Profile | null
  settings: AppSettings
  programs: Program[]
  weightLogs: WeightLog[]
  sessions: Session[]
}

interface AppStateValue extends AppSnapshot {
  ready: boolean
  reload: () => Promise<void>
}

const emptySettings: AppSettings = { id: 'current', activeProgramId: null }

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [snapshot, setSnapshot] = useState<AppSnapshot>({
    profile: null,
    settings: emptySettings,
    programs: [],
    weightLogs: [],
    sessions: [],
  })

  const reload = useCallback(async () => {
    const [profile, settings, programs, weightLogs, sessions] = await Promise.all([
      getProfile(),
      getSettings(),
      listPrograms(),
      listWeightLogs(),
      listSessions(),
    ])
    setSnapshot({
      profile: profile ?? null,
      settings,
      programs,
      weightLogs,
      sessions,
    })
    setReady(true)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const value = useMemo(
    () => ({ ...snapshot, ready, reload }),
    [snapshot, ready, reload],
  )

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext)
  if (!value) throw new Error('useAppState must be used within AppStateProvider')
  return value
}
