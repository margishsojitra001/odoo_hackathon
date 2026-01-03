"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { loginUser, setUserSession, isAdmin } from "@/lib/auth"
import { Calendar, Users, Clock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await loginUser(email, password)

    if (result.success && result.employee) {
      setUserSession(result.employee)
      toast.success("Login successful!")
      
      if (isAdmin(result.employee)) {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } else {
      toast.error(result.error || "Login failed")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Dayflow</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Every workday,<br />perfectly aligned.
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              Streamline your HR operations with our comprehensive management system. Track attendance, manage leaves, and handle payroll effortlessly.
            </p>
          </div>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Employee Management</h3>
                <p className="text-sm text-white/70">Complete profiles & documents</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Time Tracking</h3>
                <p className="text-sm text-white/70">Attendance & leave management</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dayflow</span>
            </div>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Welcome back</CardTitle>
              <CardDescription className="text-slate-500">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-medium mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <div className="text-sm text-slate-500 text-center">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-violet-600 hover:text-violet-700 font-medium">
                  Create account
                </Link>
              </div>
              <div className="w-full border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 text-center">
                  Demo: admin@dayflow.com / admin123
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
