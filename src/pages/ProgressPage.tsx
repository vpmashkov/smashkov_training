import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { registerCharts } from '../charts/setup'
import { EXERCISES } from '../data/exercises'
import { MUSCLE_GROUPS } from '../data/muscleGroups'
import { daysAgoIso, isoInRange } from '../domain/dates'
import { dailyExerciseOneRm, dailyPrimaryVolume } from '../domain/strength'
import { kgToDisplay, weightUnitLabel } from '../domain/units'
import { withMovingAverage } from '../domain/weightTrend'
import { useAppState } from '../state/AppState'
import type { MuscleGroupId } from '../types'

registerCharts()

type Range = '30' | '90' | 'all'
type StrengthMode = 'exercise' | 'muscle'

export function ProgressPage() {
  const { profile, weightLogs, sessions } = useAppState()
  const [section, setSection] = useState<'weight' | 'strength'>('weight')
  const [range, setRange] = useState<Range>('all')
  const [mode, setMode] = useState<StrengthMode>('exercise')
  const [exerciseId, setExerciseId] = useState(EXERCISES[0].id)
  const [muscleId, setMuscleId] = useState<MuscleGroupId>('chest')

  const fromIso = range === 'all' ? null : daysAgoIso(Number(range))
  const units = profile?.units ?? 'metric'

  const weightPoints = useMemo(
    () => withMovingAverage(weightLogs.filter((log) => isoInRange(log.date, fromIso))),
    [weightLogs, fromIso],
  )

  const strengthPoints = useMemo(() => {
    const completed = sessions.filter((session) => isoInRange(session.date, fromIso))
    if (mode === 'exercise') return dailyExerciseOneRm(completed, exerciseId)
    return dailyPrimaryVolume(completed, muscleId)
  }, [sessions, fromIso, mode, exerciseId, muscleId])

  if (!profile) return null

  return (
    <main className="page">
      <p className="kicker">My Progress</p>
      <h1>{section === 'weight' ? 'Bodyweight' : 'Strength'}</h1>
      <div className="chip-row">
        <button
          type="button"
          className="chip"
          aria-pressed={section === 'weight'}
          onClick={() => setSection('weight')}
        >
          Weight
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={section === 'strength'}
          onClick={() => setSection('strength')}
        >
          Strength
        </button>
      </div>
      <RangeChips range={range} onChange={setRange} />
      {section === 'weight' ? (
        <section className="card">
          {weightPoints.length < 2 ? (
            <p className="empty">Log weight on at least two days to see a trend.</p>
          ) : (
            <div className="chart-wrap">
              <Line
                data={{
                  labels: weightPoints.map((point) => point.date),
                  datasets: [
                    {
                      label: `Weight (${weightUnitLabel(units)})`,
                      data: weightPoints.map((point) => kgToDisplay(point.weightKg, units)),
                      borderColor: '#ff7a45',
                      backgroundColor: 'rgba(255, 122, 69, 0.15)',
                      fill: true,
                      tension: 0.25,
                    },
                    {
                      label: '7-day average',
                      data: weightPoints.map((point) =>
                        kgToDisplay(point.movingAverageKg, units),
                      ),
                      borderColor: '#7dd3fc',
                      borderDash: [6, 4],
                      pointRadius: 0,
                      tension: 0.25,
                    },
                  ],
                }}
                options={chartOptions()}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="card stack">
          <div className="chip-row">
            <button
              type="button"
              className="chip"
              aria-pressed={mode === 'exercise'}
              onClick={() => setMode('exercise')}
            >
              Exercise
            </button>
            <button
              type="button"
              className="chip"
              aria-pressed={mode === 'muscle'}
              onClick={() => setMode('muscle')}
            >
              Muscle group
            </button>
          </div>
          {mode === 'exercise' ? (
            <label className="field">
              <span>Exercise</span>
              <select
                className="select"
                value={exerciseId}
                onChange={(event) => setExerciseId(event.target.value)}
              >
                {EXERCISES.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="field">
              <span>Muscle group (primary only)</span>
              <select
                className="select"
                value={muscleId}
                onChange={(event) => setMuscleId(event.target.value as MuscleGroupId)}
              >
                {MUSCLE_GROUPS.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {strengthPoints.length < 2 ? (
            <p className="empty">Finish at least two workouts with this selection to graph it.</p>
          ) : (
            <div className="chart-wrap">
              <Line
                data={{
                  labels: strengthPoints.map((point) => point.date),
                  datasets: [
                    {
                      label:
                        mode === 'exercise'
                          ? `Est. 1RM (${weightUnitLabel(units)})`
                          : `Volume (${weightUnitLabel(units)})`,
                      data: strengthPoints.map((point) =>
                        kgToDisplay(
                          'oneRmKg' in point ? point.oneRmKg : point.volumeKg,
                          units,
                        ),
                      ),
                      borderColor: '#4ade80',
                      backgroundColor: 'rgba(74, 222, 128, 0.12)',
                      fill: true,
                      tension: 0.25,
                    },
                  ],
                }}
                options={chartOptions()}
              />
            </div>
          )}
        </section>
      )}
    </main>
  )
}

function RangeChips({ range, onChange }: { range: Range; onChange: (range: Range) => void }) {
  return (
    <div className="chip-row" role="group" aria-label="Time range">
      <button type="button" className="chip" aria-pressed={range === '30'} onClick={() => onChange('30')}>
        1 month
      </button>
      <button type="button" className="chip" aria-pressed={range === '90'} onClick={() => onChange('90')}>
        3 months
      </button>
      <button type="button" className="chip" aria-pressed={range === 'all'} onClick={() => onChange('all')}>
        All
      </button>
    </div>
  )
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#f3f6f8' } },
    },
    scales: {
      x: { ticks: { color: '#9aabba' }, grid: { color: '#24303c' } },
      y: { ticks: { color: '#9aabba' }, grid: { color: '#24303c' } },
    },
  }
}
