"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push("/order");
    } else {
      setError(
        "Credenciales incorrectas. Intenta con admin@boxisleep.com / admin123",
      );
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="from-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="text-foreground inline-flex items-center space-x-2 text-2xl font-bold"
            >
              <Package className="text-secondary h-8 w-8" />
              <span>Boxi Sleep</span>
            </Link>
            <p className="text-muted-foreground mt-2">
              Inicia sesión en tu cuenta
            </p>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">
                Boxi Sleep Login
              </CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales para acceder al dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-background"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="bg-secondary hover:bg-secondary/90 w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/register"
                    className="text-secondary font-medium hover:underline"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>

              <div className="bg-muted mt-4 rounded-lg p-3">
                <p className="text-muted-foreground mb-2 text-center text-xs">
                  Credenciales de prueba:
                </p>
                <div className="space-y-1 text-xs">
                  <p>
                    <strong>Admin:</strong> admin@boxisleep.com / admin123
                  </p>
                  <p>
                    <strong>Usuario:</strong> user@boxisleep.com / user123
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
