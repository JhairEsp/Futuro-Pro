'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'teacher' | 'student'
  title: string
}

export function DashboardLayout({ children, role, title }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
