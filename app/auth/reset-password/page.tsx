'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GraduationCap, Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsValidSession(true)
      } else {
        setError('La sesion de recuperacion ha expirado. Por favor intenta de nuevo.')
        setTimeout(() => {
          router.push('/auth/forgot-password')
        }, 3000)
      }
    }

    checkSession()
  }, [router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setPassword('')
      setConfirmPassword('')
      
      // Logout and redirect to login
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrio un error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-6 lg:p-10 bg-background relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-destructive/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-warning/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <Card className="glass-card border-border/50 shadow-2xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-foreground mb-4">{error}</p>
                <Link 
                  href="/auth/forgot-password" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Ir a recuperar contrasena
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-6 lg:p-10 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-info/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 animate-float">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Futuro Pro
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Crea tu nueva contrasena
          </p>
        </div>

        <Card className="glass-card border-border/50 shadow-2xl shadow-primary/5 animate-fade-in-up">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-2">
              Nueva Contrasena
              <ShieldCheck className="w-5 h-5 text-primary" />
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Ingresa tu nueva contrasena segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-foreground/80 text-sm">
                    Nueva Contrasena
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimo 6 caracteres"
                      className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-foreground/80 text-sm">
                    Confirmar Contrasena
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma tu contrasena"
                      className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive animate-fade-in">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 rounded-xl transition-all duration-300 glow-button group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Actualizando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Cambiar Contrasena
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  )}
                </Button>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors duration-300 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesion
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
