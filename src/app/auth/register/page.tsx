"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { registerUser, setUserSession } from "@/lib/auth"
import { Calendar, ArrowRight, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    employee_id: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    role: "employee" as "admin" | "hr" | "employee"
  })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const result = await registerUser({
      employee_id: formData.employee_id,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role
    })

    if (result.success && result.employee) {
      setUserSession(result.employee)
      toast.success("Registration successful!")
      router.push("/dashboard")
    } else {
      toast.error(result.error || "Registration failed")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dayflow</span>
          </div>
          <p className="text-slate-500">Create your account to get started</p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Sign Up</CardTitle>
            <CardDescription className="text-slate-500">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-slate-700">First Name</Label>
                  <Input
                    id="first_name"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-slate-700">Last Name</Label>
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id" className="text-slate-700">Employee ID</Label>
                  <Input
                    id="employee_id"
                    placeholder="EMP003"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    required
                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-700">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "hr" | "employee") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="h-10 bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="hr">HR Officer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
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
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-2">
            <div className="w-full text-center">
              <Link href="/auth/login" className="text-sm text-slate-500 hover:text-violet-600 inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
