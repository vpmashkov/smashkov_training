import { todayIsoDate } from '../domain/dates'
import { saveProfile, saveSettings, upsertWeightLog } from '../storage/store'
import { useAppState } from '../state/AppState'
import { Modal } from './Modal'
import { ProfileForm, type ProfileSubmit } from './ProfileForm'

export function OnboardingModal() {
  const { reload } = useAppState()

  async function handleSubmit(data: ProfileSubmit) {
    await saveProfile({
      id: 'current',
      name: data.name,
      sex: data.sex,
      dateOfBirth: data.dateOfBirth,
      heightCm: data.heightCm,
      units: data.units,
      createdAt: new Date().toISOString(),
    })
    await upsertWeightLog({ date: todayIsoDate(), weightKg: data.weightKg })
    await saveSettings({ id: 'current', activeProgramId: null })
    await reload()
  }

  return (
    <Modal title="Welcome — set up your profile">
      <p className="lede">This stays on your device. You can change it later in Settings.</p>
      <ProfileForm submitLabel="Save and start" onSubmit={handleSubmit} />
    </Modal>
  )
}
