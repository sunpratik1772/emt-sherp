/**
 * Top-level layout. Five regions, all driven by the workflow store:
 *
 *   ┌────────────────────────────────────────────────────────────────┐
 *   │ LeftNav │ Topbar  (icon-only actions)                          │
 *   │  (Supa- ├──────────────────────────────────────────────────────┤
 *   │  base   │ NodePanel │ WorkflowCanvas │ Activity │ RightPanel    │
 *   │  style) │ (palette) │ (React Flow)   │   Rail   │ (config /     │
 *   │  3 mode │           │                │          │  copilot)    │
 *   │         ├──────────────────────────────────────────────────────┤
 *   │         │ WorkflowDrawer (slides over canvas)                  │
 *   └────────────────────────────────────────────────────────────────┘
 */
import { useEffect } from 'react'
import WorkflowCanvas from './components/WorkflowCanvas'
import NodePanel from './components/NodePanel'
import RightPanel from './components/RightPanel'
import Topbar from './components/Topbar'
import WorkflowDrawer from './components/WorkflowDrawer'
import ActivityRail from './components/ActivityRail'
import LeftNav from './components/LeftNav'
import { useApplyTheme } from './store/themeStore'
import { useDraftAutosave } from './store/useDraftAutosave'
import { useNodeRegistryStore } from './store/nodeRegistryStore'

export default function App() {
  useApplyTheme()
  useDraftAutosave()
  useEffect(() => {
    void useNodeRegistryStore.getState().refreshFromBackend()
  }, [])

  return (
    <div className="relative h-screen overflow-hidden text-[var(--text-0)]">
      <div className="studio-backdrop" aria-hidden>
        <div className="studio-backdrop__wash" />
      </div>
      <div className="relative z-10 flex h-full">
        <LeftNav />
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar />
          <div className="flex flex-1 overflow-hidden relative min-h-0">
            <NodePanel />
            <WorkflowCanvas />
            <ActivityRail />
            <RightPanel />
            <WorkflowDrawer />
          </div>
        </div>
      </div>
    </div>
  )
}
