'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="w-full max-w-sm">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">¡Registro Exitoso!</CardTitle>
            <CardDescription className="text-green-600">
              Tu cuenta ha sido creada correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 space-y-2">
              <p className="text-sm text-slate-600">
                Tu cuenta está lista. Ahora puedes iniciar sesión con tu email y contraseña.
              </p>
            </div>

            <div className="text-center text-sm text-slate-600">
              Redirigiendo a inicio de sesión en <span className="font-bold text-green-700">{seconds}</span> segundos...
            </div>

            <Link href="/auth/login" className="block">
              <Button className="w-full">
                Ir a Iniciar Sesión Ahora
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
