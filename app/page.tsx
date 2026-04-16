'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GraduationCap } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Get user profile to determine role
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (teacher) {
          router.push('/dashboard/teacher')
        } else {
          router.push('/dashboard/student')
        }
      } else {
        router.push('/auth/login')
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-info/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="text-center relative z-10 animate-fade-in">
          {/* Animated logo */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-float">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          {/* Loading spinner */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-secondary" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          </div>
          
          {/* Loading text */}
          <h2 className="text-2xl font-bold gradient-text mb-2">Futuro Pro</h2>
          <p className="text-muted-foreground animate-pulse">Cargando...</p>
        </div>
      </div>
    )
  }

  return null
}
