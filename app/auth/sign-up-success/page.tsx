'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, GraduationCap, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SignUpSuccessPage() {
  const [seconds, setSeconds] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s - 1)
    }, 1000)

    if (seconds === 0) {
      window.location.href = '/auth/login'
    }

    return () => clearInterval(timer)
  }, [seconds])

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
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 animate-float">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Futuro Pro
          </h1>
        </div>

        <Card className="glass-card border-primary/20 shadow-2xl shadow-primary/10 animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-primary animate-bounce-subtle" />
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground flex items-center justify-center gap-2">
              Registro Exitoso!
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Tu cuenta ha sido creada correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground text-center">
                Tu cuenta esta lista. Ahora puedes iniciar sesion con tu email y contrasena.
              </p>
            </div>

            {/* Countdown */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Redirigiendo a inicio de sesion en
              </p>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xl font-bold text-primary">{seconds}</span>
              </div>
            </div>

            <Link href="/auth/login" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 rounded-xl transition-all duration-300 glow-button group">
                <span className="flex items-center gap-2">
                  Ir a Iniciar Sesion
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
