import { todayIsoDate } from '../domain/dates'
import { deleteDatabase } from '../storage/db'
import { saveProfile, saveSettings, upsertWeightLog } from '../storage/store'
import { useAppState } from '../state/AppState'
import { ProfileForm, type ProfileSubmit } from '../components/ProfileForm'

export function SettingsPage() {
  const { profile, programs, settings, weightLogs, reload } = useAppState()
  const latestWeight = weightLogs[weightLogs.length - 1]

  if (!profile) return null
  const currentProfile = profile

  async function handleProfile(data: ProfileSubmit) {
    await saveProfile({
      ...currentProfile,
      name: data.name,
      sex: data.sex,
      dateOfBirth: data.dateOfBirth,
      heightCm: data.heightCm,
      units: data.units,
    })
    await upsertWeightLog({
      date: todayIsoDate(),
      weightKg: data.weightKg,
    })
    await reload()
  }

  async function changeActive(programId: string) {
    await saveSettings({
      ...settings,
      activeProgramId: programId === '' ? null : programId,
    })
    await reload()
  }

  async function clearData() {
    const confirmed = window.confirm(
      'This deletes all local training data on this device. Continue?',
    )
    if (!confirmed) return
    await deleteDatabase()
    window.location.reload()
  }

  return (
    <main className="page">
      <p className="kicker">Settings</p>
      <h1>Your profile</h1>
      <section className="card">
        <ProfileForm
          initial={profile}
          initialWeightKg={latestWeight?.weightKg}
          submitLabel="Save profile"
          onSubmit={handleProfile}
        />
      </section>
      <section className="card stack">
        <h2>Active program</h2>
        <label className="field">
          <span>Program used on Today</span>
          <select
            className="select"
            value={settings.activeProgramId ?? ''}
            onChange={(event) => void changeActive(event.target.value)}
          >
            <option value="">None</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className="card stack">
        <h2>This device</h2>
        <p className="lede">
          Data stays in this browser. On iPhone, clearing Safari data also clears your history.
        </p>
        <button type="button" className="btn btn-danger" onClick={() => void clearData()}>
          Clear local data
        </button>
      </section>
    </main>
  )
}
