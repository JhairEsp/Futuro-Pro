'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { BookOpen, LogOut, BarChart3, Users } from 'lucide-react'

interface SidebarProps {
  role: 'teacher' | 'student'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

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
    { href: `${basePath}/skills`, label: 'Mis Habilidades', icon: BookOpen },
  ]

  const links = role === 'teacher' ? teacherLinks : studentLinks

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">Futuro Pro</h1>
        <p className="text-sm text-slate-400 mt-1">
          {role === 'teacher' ? 'Panel Profesor' : 'Panel Estudiante'}
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map(link => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-left text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={20} className="mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
