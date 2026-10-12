export type Units = 'metric' | 'imperial'
export type Sex = 'male' | 'female' | 'other'
export type Movement = 'compound' | 'isolation'
export type LoadType = 'external' | 'bodyweight'
export type SessionStatus = 'in_progress' | 'completed'

export type MuscleGroupId =
  | 'chest'
  | 'lats'
  | 'upper_back'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'lower_back'

export interface CatalogExercise {
  id: string
  name: string
  movement: Movement
  load: LoadType
  primary: MuscleGroupId
  secondary: MuscleGroupId[]
}

export interface Profile {
  id: 'current'
  name: string
  sex: Sex
  dateOfBirth: string
  heightCm: number
  units: Units
  createdAt: string
}

export interface WeightLog {
  date: string
  weightKg: number
}

export interface AppSettings {
  id: 'current'
  activeProgramId: string | null
}

export interface ProgramExercise {
  exerciseId: string
  targetSets: number
}

export interface ProgramDay {
  id: string
  name: string
  order: number
  exercises: ProgramExercise[]
}

export interface Program {
  id: string
  name: string
  createdAt: string
  days: ProgramDay[]
}

export interface WorkoutSet {
  reps: number | null
  weightKg: number | null
  done: boolean
}

export interface SessionExercise {
  exerciseId: string
  bodyweightKg?: number
  sets: WorkoutSet[]
}

export interface Session {
  id: string
  programId: string
  programDayId: string
  cycleIndex: number
  date: string
  status: SessionStatus
  completedAt?: string
  exercises: SessionExercise[]
}
