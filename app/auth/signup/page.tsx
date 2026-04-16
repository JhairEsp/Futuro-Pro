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
import { useState } from 'react'
import { GraduationCap, Mail, Lock, User, ArrowRight, UserCircle, BookOpen, CheckCircle2 } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'teacher' | 'student'>('student')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Las contrasenas no coinciden')
      setIsLoading(false)
      return
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard/${role}`,
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
          },
        },
      })
      
      if (signUpError) throw signUpError
      
      if (!authData.user) {
        throw new Error('No se pudo crear el usuario. Por favor intenta de nuevo.')
      }

      setMessage('Cuenta creada exitosamente! Por favor verifica tu correo para confirmar tu cuenta.')
      setEmail('')
      setPassword('')
      setRepeatPassword('')
      setFirstName('')
      setLastName('')
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/auth/sign-up-success')
      }, 2000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrio un error'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4 md:p-6 lg:p-10 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-info/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-info/5 rounded-full blur-3xl" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and branding */}
        <div className="text-center mb-6 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-3 animate-float">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-1">
            Futuro Pro
          </h1>
          <p className="text-muted-foreground text-sm">
            Crea tu cuenta y comienza
          </p>
        </div>

        <Card className="glass-card border-border/50 shadow-2xl shadow-primary/5 animate-fade-in-up">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-xl md:text-2xl text-foreground">
              Registrarse
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Completa tus datos para crear una cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                {/* Role selection */}
                <div className="grid gap-2">
                  <Label className="text-foreground/80 text-sm">Cual es tu rol?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('teacher')}
                      className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                        role === 'teacher'
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/50'
                      }`}
                    >
                      <BookOpen className={`w-6 h-6 transition-colors duration-300 ${role === 'teacher' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <span className="font-medium text-sm">Profesor</span>
                      {role === 'teacher' && (
                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary animate-scale-in" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                        role === 'student'
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/50'
                      }`}
                    >
                      <UserCircle className={`w-6 h-6 transition-colors duration-300 ${role === 'student' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <span className="font-medium text-sm">Estudiante</span>
                      {role === 'student' && (
                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary animate-scale-in" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName" className="text-foreground/80 text-sm">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName" className="text-foreground/80 text-sm">Apellido</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        placeholder="Perez"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground/80 text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Password fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-foreground/80 text-sm">Contrasena</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-foreground/80 text-sm">Repetir</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="repeat-password"
                        type="password"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive animate-fade-in">
                    {error}
                  </div>
                )}
                
                {/* Success message */}
                {message && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success animate-fade-in flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {message}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 rounded-xl transition-all duration-300 glow-button group mt-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creando cuenta...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Registrarse
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  )}
                </Button>
              </div>
              
              <div className="mt-5 text-center text-sm">
                <span className="text-muted-foreground">Ya tienes cuenta? </span>
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
                >
                  Inicia sesion
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
