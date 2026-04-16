'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Search, User } from 'lucide-react'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()

      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      if (user?.user_metadata?.first_name) {
        setUserName(user.user_metadata.first_name)
      } else {
        setUserName(user?.email?.split('@')[0] || 'Usuario')
      }
    }

    getUser()
  }, [])

  return (
    <header className="bg-card/50 backdrop-blur-md border-b border-border px-4 lg:px-8 py-4 sticky top-0 z-30">
      <div className="flex justify-between items-center gap-4">
        {/* Title - Hidden on mobile to make room for menu button */}
        <div className="ml-12 lg:ml-0 animate-fade-in-left">
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
            Gestiona tu espacio educativo
          </p>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2 lg:gap-4 animate-fade-in-right">
          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-xl border border-border/50 transition-all duration-300 focus-within:border-primary/50 focus-within:bg-secondary">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar..."
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-32 lg:w-48"
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 lg:p-2.5 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 group">
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 group-hover:animate-bounce-subtle" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </button>
          
          {/* User profile */}
          <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-border">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-muted-foreground">Bienvenido</p>
              <p className="text-sm font-semibold text-foreground">{userName}</p>
            </div>
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
