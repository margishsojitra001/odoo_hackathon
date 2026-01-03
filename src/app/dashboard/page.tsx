"use client"

import { useEffect, useState } from "react"
import { getUserSession, Employee } from "@/lib/auth"
import { supabase, Attendance, LeaveRequest, LeaveBalance } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { 
  User, 
  Clock, 
  CalendarDays, 
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function EmployeeDashboard() {
  const [user, setUser] = useState<Employee | null>(null)
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null)
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getUserSession()
    if (session) {
      setUser(session)
      fetchDashboardData(session.id)
    }
  }, [])

  const fetchDashboardData = async (employeeId: string) => {
    const today = format(new Date(), "yyyy-MM-dd")

    const [attendanceRes, balanceRes, leavesRes] = await Promise.all([
      supabase.from("attendance").select("*").eq("employee_id", employeeId).eq("date", today).single(),
      supabase.from("leave_balance").select("*, leave_type:leave_types(*)").eq("employee_id", employeeId).eq("year", new Date().getFullYear()),
      supabase.from("leave_requests").select("*, leave_type:leave_types(*)").eq("employee_id", employeeId).order("created_at", { ascending: false }).limit(5)
    ])

    if (attendanceRes.data) setTodayAttendance(attendanceRes.data)
    if (balanceRes.data) setLeaveBalances(balanceRes.data)
    if (leavesRes.data) setRecentLeaves(leavesRes.data)
    
    setLoading(false)
  }

  const handleCheckIn = async () => {
    if (!user) return
    const today = format(new Date(), "yyyy-MM-dd")
    
    const { data, error } = await supabase.from("attendance").insert({
      employee_id: user.id,
      date: today,
      check_in: new Date().toISOString(),
      status: "present"
    }).select().single()

    if (!error && data) {
      setTodayAttendance(data)
    }
  }

  const handleCheckOut = async () => {
    if (!user || !todayAttendance) return
    
    const { data, error } = await supabase.from("attendance")
      .update({ check_out: new Date().toISOString() })
      .eq("id", todayAttendance.id)
      .select()
      .single()

    if (!error && data) {
      setTodayAttendance(data)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  const quickActions = [
    { label: "Profile", href: "/dashboard/profile", icon: User, color: "bg-blue-500" },
    { label: "Attendance", href: "/dashboard/attendance", icon: Clock, color: "bg-emerald-500" },
    { label: "Leaves", href: "/dashboard/leaves", icon: CalendarDays, color: "bg-amber-500" },
    { label: "Payroll", href: "/dashboard/payroll", icon: DollarSign, color: "bg-violet-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s your overview for today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0 shadow-md">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-slate-900">{action.label}</p>
                  <p className="text-xs text-slate-500 mt-1">View details</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-600" />
              Today&apos;s Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-2">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
              
              {!todayAttendance ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">You haven&apos;t checked in yet</p>
                  <Button onClick={handleCheckIn} className="bg-emerald-600 hover:bg-emerald-700">
                    Check In Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center gap-8">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Check In</p>
                      <p className="text-lg font-semibold text-emerald-600">
                        {todayAttendance.check_in ? format(new Date(todayAttendance.check_in), "hh:mm a") : "--:--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Check Out</p>
                      <p className="text-lg font-semibold text-rose-600">
                        {todayAttendance.check_out ? format(new Date(todayAttendance.check_out), "hh:mm a") : "--:--"}
                      </p>
                    </div>
                  </div>
                  {!todayAttendance.check_out && (
                    <Button onClick={handleCheckOut} variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                      Check Out
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-violet-600" />
                Leave Balance
              </CardTitle>
              <Link href="/dashboard/leaves" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {leaveBalances.slice(0, 4).map((balance) => (
                <div key={balance.id} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 truncate">{balance.leave_type?.name}</p>
                  <p className="text-xl font-bold text-slate-900">{balance.remaining_days}</p>
                  <p className="text-xs text-slate-400">of {balance.total_days} days</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Leave Requests</CardTitle>
            <Link href="/dashboard/leaves" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
              Apply for leave <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentLeaves.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No leave requests yet</p>
          ) : (
            <div className="space-y-3">
              {recentLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {leave.status === "approved" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {leave.status === "rejected" && <XCircle className="w-5 h-5 text-rose-500" />}
                    {leave.status === "pending" && <AlertCircle className="w-5 h-5 text-amber-500" />}
                    <div>
                      <p className="font-medium text-slate-900">{leave.leave_type?.name}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    leave.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    leave.status === "rejected" ? "bg-rose-100 text-rose-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
