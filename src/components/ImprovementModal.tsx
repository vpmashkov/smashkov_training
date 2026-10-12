import type { ExerciseImprovement } from '../domain/compare'
import { formatWeight } from '../domain/units'
import type { Units } from '../types'
import { Modal } from './Modal'

interface ImprovementModalProps {
  items: ExerciseImprovement[]
  units: Units
  onClose: () => void
}

export function ImprovementModal({ items, units, onClose }: ImprovementModalProps) {
  return (
    <Modal title="Compared with last time" onClose={onClose}>
      <div className="stack">
        {items.map((item) => (
          <div key={item.exerciseId} className="card">
            <h3>{item.name}</h3>
            <p className="lede">{deltaLabel('Est. 1RM', item.oneRmDeltaKg, units)}</p>
            <p className="lede">{deltaLabel('Volume', item.volumeDeltaKg, units)}</p>
          </div>
        ))}
      </div>
    </Modal>
  )
}

function deltaLabel(kind: string, deltaKg: number, units: Units): string {
  if (Math.abs(deltaKg) < 0.05) return `${kind}: same as last time`
  const sign = deltaKg > 0 ? '+' : ''
  return `${kind}: ${sign}${formatWeight(deltaKg, units)}`
}
