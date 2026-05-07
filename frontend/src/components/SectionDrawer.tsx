/**
 * Slide-over content drawer used for Skills / Data Sources / Logs.
 *
 * Mirrors the behaviour of `WorkflowDrawer` (left-anchored, animated,
 * dismiss-on-backdrop) but with a generic header so each section can
 * supply its own title / subtitle and content.
 */
import type { ReactNode } from 'react'
import { X as XIcon } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  badge?: string
  width?: number
  children: ReactNode
  toolbar?: ReactNode
}

export default function SectionDrawer({
  open,
  onClose,
  title,
  subtitle,
  badge,
  width = 720,
  children,
  toolbar,
}: Props) {
  if (!open) return null
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div
        className="drawer panel-glass flex flex-col"
        style={{
          width,
          maxWidth: '92vw',
          borderRight: '1px solid var(--border)',
        }}
      >
        <div
          className="shrink-0 flex items-center"
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-soft)',
            gap: 12,
          }}
        >
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <h2
                className="display truncate"
                style={{
                  fontSize: 16,
                  fontWeight: 540,
                  color: 'var(--text-0)',
                  letterSpacing: '-0.018em',
                }}
              >
                {title}
              </h2>
              {badge && (
                <span
                  className="font-mono shrink-0"
                  style={{
                    fontSize: 10,
                    color: 'var(--text-3)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'var(--bg-3)',
                    border: '1px solid var(--border-soft)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-2)',
                  marginTop: 3,
                  letterSpacing: '-0.005em',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          {toolbar}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-0)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-2)'
            }}
          >
            <XIcon size={13} strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </>
  )
}
