import { Outlet } from 'react-router-dom'
import { AppSidebar } from './app-sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
