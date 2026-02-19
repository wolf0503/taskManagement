"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ApiError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type SignInFormValues = z.infer<typeof signInSchema>

const DEFAULT_RATE_LIMIT_SECONDS = 120

export default function SignInPage() {
  const { login, isLoading, error, clearError } = useAuth()
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null)

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Countdown timer when rate limited
  useEffect(() => {
    if (countdownSeconds === null || countdownSeconds <= 0) return
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearError()
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [countdownSeconds, clearError])

  const onSubmit = async (data: SignInFormValues) => {
    clearError()
    setCountdownSeconds(null)
    try {
      await login(data.email, data.password)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'RATE_LIMIT_EXCEEDED') {
        const retryAfter = err.details?.retryAfter
        const seconds = retryAfter ? parseInt(String(retryAfter), 10) : DEFAULT_RATE_LIMIT_SECONDS
        setCountdownSeconds(Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RATE_LIMIT_SECONDS)
      } else {
        console.error('Login failed:', err)
      }
    }
  }

  const isRateLimited = countdownSeconds !== null && countdownSeconds > 0
  const countdownDisplay = countdownSeconds !== null && countdownSeconds > 0
    ? `${Math.floor(countdownSeconds / 60)}:${String(countdownSeconds % 60).padStart(2, "0")}`
    : null

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center p-4">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-chart-4/10 blur-[100px] animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        {/* Sign In Form */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="block font-medium">{error}</span>
                {error.toLowerCase().includes("too many") && (
                  <span className="mt-2 block text-sm opacity-90">
                    This is a security measure to prevent brute force attacks. Please wait before trying again.
                    {countdownDisplay !== null && (
                      <span className="mt-2 flex items-center gap-2 font-medium tabular-nums">
                        Try again in: <span className="text-base">{countdownDisplay}</span>
                      </span>
                    )}
                    {process.env.NODE_ENV === 'development' && (
                      <span className="block mt-1 text-xs opacity-75">
                        Development tip: You can relax rate limits on the backend for local development.
                      </span>
                    )}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-input w-4 h-4 accent-primary"
                  />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                disabled={isLoading || form.formState.isSubmitting || isRateLimited}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Signing in...
                  </>
                ) : isRateLimited && countdownDisplay ? (
                  <>Try again in {countdownDisplay}</>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Additional info */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
