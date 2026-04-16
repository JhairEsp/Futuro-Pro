'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <div className="text-right">
        <p className="text-sm text-slate-600">Bienvenido</p>
        <p className="text-lg font-semibold text-slate-900">{userName}</p>
      </div>
    </header>
  )
}