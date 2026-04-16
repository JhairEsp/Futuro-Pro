'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { BookOpen, LogOut, BarChart3, Users, GraduationCap, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  role: 'teacher' | 'student'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const basePath = `/dashboard/${role}`
  
  const teacherLinks = [
    { href: `${basePath}/classrooms`, label: 'Mis Salones', icon: BookOpen },
    { href: `${basePath}/students`, label: 'Alumnos', icon: Users },
    { href: `${basePath}/grades`, label: 'Calificaciones', icon: BarChart3 },
  ]

  const studentLinks = [
    { href: `${basePath}/grades`, label: 'Mis Calificaciones', icon: BarChart3 },
    { href: `${basePath}/skills`, label: 'Mis Habilidades', icon: Sparkles },
  ]

  const links = role === 'teacher' ? teacherLinks : studentLinks

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-float">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Futuro Pro</h1>
            <p className="text-xs text-muted-foreground">
              {role === 'teacher' ? 'Panel Profesor' : 'Panel Estudiante'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-4">
          Menu
        </p>
        <ul className="space-y-1">
          {links.map((link, index) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <li 
                key={link.href} 
                className="animate-fade-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`} />
                  <span className="font-medium">{link.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 rounded-xl py-3"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Cerrar Sesion</span>
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card border border-border text-foreground shadow-lg"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground flex flex-col transform transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-72 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border">
        <SidebarContent />
      </div>
    </>
  )
}
