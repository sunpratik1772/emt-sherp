/**
 * Skills / Data Sources / Logs drawers.
 *
 * Each fetches from the backend on open, owns local loading state, and
 * renders a Linear/Supabase-style list with a detail pane appearing
 * inline (no nested modals).
 */
import { useEffect, useMemo, useState } from 'react'
import {
  Lightbulb,
  Database,
  Activity,
  Loader2,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CircleDashed,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import SectionDrawer from './SectionDrawer'
import { BASE } from '../services/api'

const BACKEND_COLOR: Record<string, string> = {
  Solr: '#f59e0b',
  Mercury: '#7c83ff',
  Oculus: '#38bdf8',
  Oracle: '#3ecf8e',
}

interface Skill {
  id: string
  title: string
  overview: string
  regulatory: string[]
  sections: string[]
  sources: string[]
  raw_path: string
  bytes: number
}

interface DataSource {
  id: string
  description: string
  sources: string[]
  backends: string[]
  backend_labels: string[]
  column_count: number
  source_count: number
  raw_path: string
  columns: { name: string; type: string; description: string; semantic?: string }[]
}

interface RunLog {
  run_id: string
  workflow?: string
  started_at: string
  finished_at?: string
  duration_ms?: number
  status: 'success' | 'error' | 'warning' | 'running'
  disposition?: string
  flag_count?: number
  node_count?: number
  edge_count?: number
  error?: string
  download_url?: string
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------
export function SkillsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [skills, setSkills] = useState<Skill[] | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [detail, setDetail] = useState<{ id: string; markdown: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`${BASE}/skills`)
      .then((r) => r.json())
      .then((d) => {
        setSkills(d.skills ?? [])
        if ((d.skills ?? []).length > 0) setActiveId(d.skills[0].id)
      })
      .catch(() => setSkills([]))
      .finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    if (!activeId) return
    setDetail(null)
    fetch(`${BASE}/skills/${activeId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDetail(d))
      .catch(() => {})
  }, [activeId])

  const active = skills?.find((s) => s.id === activeId) ?? null

  return (
    <SectionDrawer
      open={open}
      onClose={onClose}
      title="Skills"
      subtitle="Domain playbooks loaded into the agent's prompt context"
      badge={skills ? String(skills.length) : undefined}
      width={860}
    >
      <div className="flex h-full">
        <div
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ borderRight: '1px solid var(--border-soft)', maxWidth: 320 }}
        >
          {loading && <PanelLoading />}
          {!loading && skills?.length === 0 && <PanelEmpty icon={<Lightbulb size={18} />}>No skills bundled.</PanelEmpty>}
          {skills?.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className="w-full text-left flex items-start gap-2.5"
              style={{
                padding: '12px 16px',
                background: activeId === s.id ? 'var(--bg-2)' : 'transparent',
                borderLeft: activeId === s.id ? '2px solid var(--accent)' : '2px solid transparent',
                borderBottom: '1px solid var(--border-soft)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Lightbulb size={13} strokeWidth={1.85} style={{ marginTop: 2, color: 'var(--accent)' }} />
              <div className="min-w-0 flex-1">
                <div
                  className="display truncate"
                  style={{ fontSize: 12.5, fontWeight: 530, color: 'var(--text-0)', letterSpacing: '-0.005em' }}
                >
                  {s.title}
                </div>
                <div
                  className="truncate"
                  style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.45 }}
                >
                  {s.overview || '—'}
                </div>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {s.sources.slice(0, 4).map((src) => (
                    <BackendChip key={src} label={src} />
                  ))}
                  <span
                    className="font-mono"
                    style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.02em' }}
                  >
                    · {s.sections.length} sections
                  </span>
                </div>
              </div>
              <ChevronRight size={11} strokeWidth={2} style={{ color: 'var(--text-3)', marginTop: 5 }} />
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto" style={{ padding: '20px 24px' }}>
          {!active && <PanelEmpty icon={<Lightbulb size={18} />}>Select a skill</PanelEmpty>}
          {active && (
            <div>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 10 }}>
                {active.sources.map((src) => (
                  <BackendChip key={src} label={src} />
                ))}
              </div>
              <h3 className="display" style={{ fontSize: 18, fontWeight: 540, color: 'var(--text-0)', letterSpacing: '-0.022em', marginBottom: 6 }}>
                {active.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.55, letterSpacing: '-0.003em', marginBottom: 16 }}>
                {active.overview}
              </p>
              {active.regulatory.length > 0 && (
                <div className="mb-4">
                  <SectionLabel>Regulatory reference</SectionLabel>
                  <ul style={{ marginTop: 6 }}>
                    {active.regulatory.map((r, i) => (
                      <li
                        key={i}
                        className="font-mono"
                        style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.7, paddingLeft: 14, position: 'relative' }}
                      >
                        <span style={{ position: 'absolute', left: 0, color: 'var(--text-3)' }}>·</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {active.sections.length > 0 && (
                <div className="mb-4">
                  <SectionLabel>Sections in playbook</SectionLabel>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {active.sections.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: 'var(--bg-2)',
                          border: '1px solid var(--border-soft)',
                          color: 'var(--text-1)',
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {detail && (
                <div className="mt-6">
                  <SectionLabel>Raw playbook</SectionLabel>
                  <pre
                    className="font-mono mt-2"
                    style={{
                      fontSize: 11.5,
                      lineHeight: 1.6,
                      color: 'var(--text-1)',
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: 6,
                      padding: '12px 14px',
                      maxHeight: 380,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      letterSpacing: '0.005em',
                    }}
                  >
                    {detail.markdown}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionDrawer>
  )
}

// ---------------------------------------------------------------------------
// Data Sources
// ---------------------------------------------------------------------------
export function DataSourcesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sources, setSources] = useState<DataSource[] | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`${BASE}/data-sources`)
      .then((r) => r.json())
      .then((d) => {
        setSources(d.data_sources ?? [])
        if ((d.data_sources ?? []).length > 0) setActiveId(d.data_sources[0].id)
      })
      .catch(() => setSources([]))
      .finally(() => setLoading(false))
  }, [open])

  const active = sources?.find((s) => s.id === activeId) ?? null

  return (
    <SectionDrawer
      open={open}
      onClose={onClose}
      title="Data Sources"
      subtitle="Schemas the agent can read from. Each is backed by a runtime."
      badge={sources ? String(sources.length) : undefined}
      width={920}
    >
      <div className="flex h-full">
        <div
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ borderRight: '1px solid var(--border-soft)', maxWidth: 280 }}
        >
          {loading && <PanelLoading />}
          {sources?.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className="w-full text-left flex items-start gap-2.5"
              style={{
                padding: '12px 16px',
                background: activeId === s.id ? 'var(--bg-2)' : 'transparent',
                borderLeft: activeId === s.id ? '2px solid var(--accent)' : '2px solid transparent',
                borderBottom: '1px solid var(--border-soft)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Database size={13} strokeWidth={1.85} style={{ marginTop: 2, color: BACKEND_COLOR[s.backend_labels[0]] ?? 'var(--text-1)' }} />
              <div className="min-w-0 flex-1">
                <div
                  className="display truncate"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 530,
                    color: 'var(--text-0)',
                    letterSpacing: '-0.005em',
                    textTransform: 'capitalize',
                  }}
                >
                  {s.id}
                </div>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {s.backend_labels.map((b) => (
                    <BackendChip key={b} label={b} />
                  ))}
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.02em' }}
                >
                  {s.column_count} columns
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto" style={{ padding: '20px 24px' }}>
          {!active && <PanelEmpty icon={<Database size={18} />}>Select a data source</PanelEmpty>}
          {active && (
            <div>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 8 }}>
                {active.backend_labels.map((b) => (
                  <BackendChip key={b} label={b} />
                ))}
                {active.sources.length > 0 && (
                  <span
                    className="font-mono"
                    style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.02em' }}
                  >
                    · {active.sources.join(', ')}
                  </span>
                )}
              </div>
              <h3
                className="display"
                style={{
                  fontSize: 18,
                  fontWeight: 540,
                  color: 'var(--text-0)',
                  letterSpacing: '-0.022em',
                  textTransform: 'capitalize',
                  marginBottom: 6,
                }}
              >
                {active.id}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.55, marginBottom: 18 }}>
                {active.description}
              </p>

              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <SectionLabel>Schema</SectionLabel>
                <span
                  className="font-mono"
                  style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em' }}
                >
                  {active.column_count} cols
                </span>
              </div>
              <div
                style={{
                  border: '1px solid var(--border-soft)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--bg-2)',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-3)' }}>
                      <th style={thStyle}>Column</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.columns.map((c) => (
                      <tr key={c.name} style={{ borderTop: '1px solid var(--border-soft)' }}>
                        <td style={tdNameStyle} className="font-mono">{c.name}</td>
                        <td style={tdTypeStyle} className="font-mono">{c.type}</td>
                        <td style={tdDescStyle}>{c.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                className="font-mono"
                style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 10, letterSpacing: '0.02em' }}
              >
                {active.raw_path}
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionDrawer>
  )
}

// ---------------------------------------------------------------------------
// Run Logs
// ---------------------------------------------------------------------------
export function LogsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [logs, setLogs] = useState<RunLog[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  function load() {
    setLoading(true)
    fetch(`${BASE}/run-logs`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }
  function clear() {
    fetch(`${BASE}/run-logs`, { method: 'DELETE' }).finally(load)
  }

  useEffect(() => {
    if (!open) return
    load()
    const id = window.setInterval(load, 5000)
    return () => window.clearInterval(id)
  }, [open])

  const stats = useMemo(() => {
    const list = logs ?? []
    const success = list.filter((l) => l.status === 'success').length
    const error = list.filter((l) => l.status === 'error').length
    const warn = list.filter((l) => l.status === 'warning').length
    return { total: list.length, success, error, warn }
  }, [logs])

  const active = activeIdx != null && logs ? logs[activeIdx] : null

  return (
    <SectionDrawer
      open={open}
      onClose={onClose}
      title="Logs"
      subtitle="Every workflow run is recorded here. Newest first."
      badge={logs ? String(logs.length) : undefined}
      width={920}
      toolbar={
        <div className="flex items-center gap-1.5">
          <ToolbarButton onClick={load} icon={<RefreshCw size={11} strokeWidth={2} className={loading ? 'animate-spin' : undefined} />}>
            Refresh
          </ToolbarButton>
          <ToolbarButton onClick={clear} icon={<Trash2 size={11} strokeWidth={2} />}>
            Clear
          </ToolbarButton>
        </div>
      }
    >
      {logs && logs.length > 0 && (
        <div
          className="flex items-center gap-4 px-5 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-2)' }}
        >
          <Stat label="total" value={stats.total} />
          <Stat label="success" value={stats.success} color="var(--success)" />
          <Stat label="error" value={stats.error} color="var(--danger)" />
          <Stat label="warn" value={stats.warn} color="var(--warning)" />
        </div>
      )}
      <div className="flex h-full" style={{ minHeight: 0 }}>
        <div
          className="flex-1 min-w-0 overflow-y-auto"
          style={{ borderRight: '1px solid var(--border-soft)', maxWidth: 360 }}
        >
          {loading && !logs && <PanelLoading />}
          {logs && logs.length === 0 && <PanelEmpty icon={<Activity size={18} />}>No runs yet. Hit Run on a workflow.</PanelEmpty>}
          {logs?.map((log, i) => (
            <button
              key={`${log.run_id}-${i}`}
              type="button"
              onClick={() => setActiveIdx(i)}
              className="w-full text-left flex items-start gap-2.5"
              style={{
                padding: '10px 16px',
                background: activeIdx === i ? 'var(--bg-2)' : 'transparent',
                borderLeft: activeIdx === i ? `2px solid ${statusColor(log.status)}` : '2px solid transparent',
                borderBottom: '1px solid var(--border-soft)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <StatusIcon status={log.status} />
              <div className="min-w-0 flex-1">
                <div
                  className="display truncate"
                  style={{ fontSize: 12, fontWeight: 510, color: 'var(--text-0)', letterSpacing: '-0.005em' }}
                >
                  {log.workflow ?? log.run_id}
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, letterSpacing: '0.02em' }}
                >
                  {formatTime(log.started_at)} · {formatDur(log.duration_ms)}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto" style={{ padding: '20px 24px' }}>
          {!active && <PanelEmpty icon={<Activity size={18} />}>Select a run</PanelEmpty>}
          {active && (
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <StatusIcon status={active.status} large />
                <span
                  className="display"
                  style={{ fontSize: 13.5, fontWeight: 530, color: 'var(--text-0)', letterSpacing: '-0.005em' }}
                >
                  {active.status}
                </span>
                {active.disposition && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 4,
                      border: '1px solid var(--border-soft)',
                      background: 'var(--bg-2)',
                      color: 'var(--text-2)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {active.disposition}
                  </span>
                )}
                {typeof active.flag_count === 'number' && active.flag_count > 0 && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 4,
                      background: 'color-mix(in srgb, var(--danger) 12%, transparent)',
                      color: 'var(--danger)',
                      border: '1px solid color-mix(in srgb, var(--danger) 32%, transparent)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {active.flag_count} flags
                  </span>
                )}
              </div>
              <h3
                className="display"
                style={{ fontSize: 16, fontWeight: 540, color: 'var(--text-0)', letterSpacing: '-0.018em', marginBottom: 12 }}
              >
                {active.workflow ?? active.run_id}
              </h3>

              <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 14 }}>
                <KV label="Run ID" value={active.run_id} mono />
                <KV label="Duration" value={formatDur(active.duration_ms)} />
                <KV label="Started" value={formatTime(active.started_at)} />
                <KV label="Finished" value={active.finished_at ? formatTime(active.finished_at) : '—'} />
                <KV label="Nodes" value={String(active.node_count ?? '—')} />
                <KV label="Edges" value={String(active.edge_count ?? '—')} />
              </div>

              {active.error && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 6,
                    background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
                    color: 'var(--danger)',
                    fontSize: 12,
                    lineHeight: 1.55,
                  }}
                >
                  {active.error}
                </div>
              )}
              {active.download_url && (
                <a
                  href={active.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-2"
                  style={{
                    fontSize: 12,
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <Download size={11} strokeWidth={2} />
                  Download report
                  <ExternalLink size={10} strokeWidth={2} style={{ opacity: 0.6 }} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionDrawer>
  )
}

// ---------------------------------------------------------------------------
// Tiny shared components
// ---------------------------------------------------------------------------
function PanelLoading() {
  return (
    <div className="flex items-center justify-center" style={{ padding: 32, color: 'var(--text-3)' }}>
      <Loader2 size={14} className="animate-spin" />
    </div>
  )
}

function PanelEmpty({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: 40, color: 'var(--text-3)', fontSize: 12 }}
    >
      <div style={{ marginBottom: 6 }}>{icon}</div>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono"
      style={{
        fontSize: 9.5,
        color: 'var(--text-3)',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  )
}

function BackendChip({ label }: { label: string }) {
  const c = BACKEND_COLOR[label] ?? '#7c83ff'
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 9.5,
        padding: '1px 6px',
        borderRadius: 3,
        background: `color-mix(in srgb, ${c} 12%, transparent)`,
        color: c,
        border: `1px solid color-mix(in srgb, ${c} 32%, transparent)`,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  fontSize: 10,
  fontWeight: 500,
  color: 'var(--text-3)',
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
}
const tdNameStyle: React.CSSProperties = { padding: '7px 12px', color: 'var(--text-0)', fontSize: 11.5, letterSpacing: '0.005em' }
const tdTypeStyle: React.CSSProperties = { padding: '7px 12px', color: 'var(--text-2)', fontSize: 11, letterSpacing: '0.02em' }
const tdDescStyle: React.CSSProperties = { padding: '7px 12px', color: 'var(--text-1)', fontSize: 11.5, lineHeight: 1.5 }

function ToolbarButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5"
      style={{
        height: 26,
        padding: '0 10px',
        borderRadius: 6,
        border: '1px solid var(--border-soft)',
        background: 'transparent',
        color: 'var(--text-1)',
        fontSize: 11.5,
        fontFamily: 'inherit',
        cursor: 'pointer',
        letterSpacing: '-0.005em',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--text-0)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--text-1)'
      }}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

function Stat({ label, value, color = 'var(--text-0)' }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="num" style={{ color, fontSize: 13, fontWeight: 540 }}>
        {value}
      </span>
      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </div>
      <div className={mono ? 'font-mono' : ''} style={{ fontSize: 12, color: 'var(--text-1)', letterSpacing: mono ? '0.02em' : '-0.005em' }}>
        {value}
      </div>
    </div>
  )
}

function StatusIcon({ status, large }: { status: string; large?: boolean }) {
  const size = large ? 14 : 11
  if (status === 'success')
    return <CheckCircle2 size={size} strokeWidth={2} style={{ color: 'var(--success)', marginTop: 2 }} />
  if (status === 'error') return <XCircle size={size} strokeWidth={2} style={{ color: 'var(--danger)', marginTop: 2 }} />
  if (status === 'warning') return <AlertTriangle size={size} strokeWidth={2} style={{ color: 'var(--warning)', marginTop: 2 }} />
  if (status === 'running')
    return <Loader2 size={size} className="animate-spin" style={{ color: 'var(--running)', marginTop: 2 }} />
  return <CircleDashed size={size} strokeWidth={2} style={{ color: 'var(--text-3)', marginTop: 2 }} />
}

function statusColor(status: string): string {
  if (status === 'success') return 'var(--success)'
  if (status === 'error') return 'var(--danger)'
  if (status === 'warning') return 'var(--warning)'
  if (status === 'running') return 'var(--running)'
  return 'var(--text-3)'
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / 1000
    if (diff < 60) return `${Math.floor(diff)}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleString()
  } catch {
    return iso
  }
}

function formatDur(ms?: number | null): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
