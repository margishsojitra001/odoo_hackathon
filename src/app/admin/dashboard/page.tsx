"use client"

import { useEffect, useState } from "react"
import { supabase, Employee, Attendance, LeaveRequest } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { 
  Users, 
  Clock, 
  CalendarDays, 
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const today = format(new Date(), "yyyy-MM-dd")

    const [employeesRes, attendanceRes, leavesRes] = await Promise.all([
      supabase.from("employees").select("*").eq("is_active", true),
      supabase.from("attendance").select("*, employee:employees(first_name, last_name, employee_id)").eq("date", today),
      supabase.from("leave_requests").select("*, employee:employees(first_name, last_name, employee_id), leave_type:leave_types(name)").eq("status", "pending").order("created_at", { ascending: false })
    ])

    if (employeesRes.data) setEmployees(employeesRes.data)
    if (attendanceRes.data) setTodayAttendance(attendanceRes.data)
    if (leavesRes.data) setPendingLeaves(leavesRes.data)
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  const presentToday = todayAttendance.filter(a => a.status === "present").length
  const absentToday = employees.length - presentToday

  const stats = [
    { 
      label: "Total Employees", 
      value: employees.length, 
      icon: Users, 
      color: "bg-blue-500",
      change: "+2 this month",
      href: "/admin/employees"
    },
    { 
      label: "Present Today", 
      value: presentToday, 
      icon: CheckCircle2, 
      color: "bg-emerald-500",
      change: `${Math.round((presentToday / employees.length) * 100 || 0)}% attendance`,
      href: "/admin/attendance"
    },
    { 
      label: "Pending Leaves", 
      value: pendingLeaves.length, 
      icon: CalendarDays, 
      color: "bg-amber-500",
      change: "Requires attention",
      href: "/admin/leaves"
    },
    { 
      label: "Absent Today", 
      value: absentToday, 
      icon: XCircle, 
      color: "bg-rose-500",
      change: `${employees.length} total`,
      href: "/admin/attendance"
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-0 shadow-md h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm font-medium text-slate-600 mt-1">{stat.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600" />
                Today&apos;s Attendance
              </CardTitle>
              <Link href="/admin/attendance" className="text-sm text-violet-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {todayAttendance.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No attendance records for today</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {todayAttendance.slice(0, 6).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-sm">
                        {(record.employee as unknown as { first_name: string })?.first_name?.[0]}
                        {(record.employee as unknown as { last_name: string })?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {(record.employee as unknown as { first_name: string })?.first_name} {(record.employee as unknown as { last_name: string })?.last_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(record.employee as unknown as { employee_id: string })?.employee_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-600">
                        {record.check_in ? format(new Date(record.check_in), "hh:mm a") : "--:--"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "Active"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-violet-600" />
                Pending Leave Requests
              </CardTitle>
              <Link href="/admin/leaves" className="text-sm text-violet-600 hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingLeaves.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No pending leave requests</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {pendingLeaves.slice(0, 5).map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {(leave.employee as unknown as { first_name: string })?.first_name} {(leave.employee as unknown as { last_name: string })?.last_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(leave.leave_type as unknown as { name: string })?.name} • {leave.total_days} days
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {format(new Date(leave.start_date), "MMM d")}
                      </p>
                      <p className="text-xs text-slate-400">
                        to {format(new Date(leave.end_date), "MMM d")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              Recent Employees
            </CardTitle>
            <Link href="/admin/employees" className="text-sm text-violet-600 hover:underline">
              Manage employees
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Employee</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-sm">
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{emp.department || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        emp.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {emp.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
