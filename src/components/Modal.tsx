import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose?: () => void
}

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="modal-backdrop">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        {onClose ? (
          <button type="button" className="btn btn-secondary btn-block" onClick={onClose}>
            Close
          </button>
        ) : null}
      </div>
    </div>
  )
}
