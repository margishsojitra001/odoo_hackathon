"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { getUserSession, clearUserSession, isAdmin as checkIsAdmin, Employee } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { 
  Calendar, 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarDays, 
  DollarSign, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/attendance", label: "Attendance", icon: Clock },
  { href: "/admin/leaves", label: "Leave Requests", icon: CalendarDays },
  { href: "/admin/payroll", label: "Payroll", icon: DollarSign },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<Employee | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getUserSession()
    if (!session) {
      router.push("/auth/login")
      return
    }
    if (!checkIsAdmin(session)) {
      router.push("/dashboard")
      return
    }
    setUser(session)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    clearUserSession()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-violet-900 to-slate-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-violet-800/50">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Dayflow</span>
                <span className="block text-xs text-violet-300">Admin Panel</span>
              </div>
            </Link>
          </div>

          <div className="p-4 border-b border-violet-800/50">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-violet-300 truncate capitalize">{user?.role}</p>
              </div>
              <Settings className="w-4 h-4 text-violet-400" />
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-white text-violet-900 shadow-lg"
                      : "text-violet-200 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-violet-800/50">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-violet-200 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
