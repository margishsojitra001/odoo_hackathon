"use client"

import { useEffect, useState } from "react"
import { supabase, Attendance, Employee } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks } from "date-fns"
import { Clock, ChevronLeft, ChevronRight, Search, CheckCircle2, XCircle, Coffee, Calendar } from "lucide-react"

type AttendanceWithEmployee = Attendance & { employee?: Employee }

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceWithEmployee[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [currentWeek, selectedEmployee])

  const fetchData = async () => {
    const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "yyyy-MM-dd")
    const weekEnd = format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "yyyy-MM-dd")

    const [attendanceRes, employeesRes] = await Promise.all([
      selectedEmployee === "all"
        ? supabase.from("attendance").select("*, employee:employees(*)").gte("date", weekStart).lte("date", weekEnd).order("date", { ascending: false })
        : supabase.from("attendance").select("*, employee:employees(*)").eq("employee_id", selectedEmployee).gte("date", weekStart).lte("date", weekEnd).order("date", { ascending: false }),
      supabase.from("employees").select("*").eq("is_active", true)
    ])

    if (attendanceRes.data) setAttendance(attendanceRes.data)
    if (employeesRes.data) setEmployees(employeesRes.data)
    setLoading(false)
  }

  const filteredAttendance = attendance.filter(record => {
    const emp = record.employee as unknown as Employee
    if (!searchQuery) return true
    return emp?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           emp?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           emp?.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const presentCount = attendance.filter(a => a.status === "present").length
  const absentCount = attendance.filter(a => a.status === "absent").length
  const halfDayCount = attendance.filter(a => a.status === "half-day").length
  const leaveCount = attendance.filter(a => a.status === "leave").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Attendance Management</h1>
        <p className="text-slate-500 mt-1">Track and manage employee attendance</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{presentCount}</p>
                <p className="text-sm text-slate-500">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{absentCount}</p>
                <p className="text-sm text-slate-500">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{halfDayCount}</p>
                <p className="text-sm text-slate-500">Half-day</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{leaveCount}</p>
                <p className="text-sm text-slate-500">On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-600" />
              Attendance Records
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[160px] text-center">
                  {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM d")} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM d")}
                </span>
                <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Employee</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Check In</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Check Out</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Hours</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">No attendance records found</td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => {
                    const emp = record.employee as unknown as Employee
                    const hours = record.check_in && record.check_out 
                      ? Math.round((new Date(record.check_out).getTime() - new Date(record.check_in).getTime()) / (1000 * 60 * 60) * 10) / 10
                      : null
                    return (
                      <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-sm">
                              {emp?.first_name?.[0]}{emp?.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{emp?.first_name} {emp?.last_name}</p>
                              <p className="text-xs text-slate-500">{emp?.employee_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {format(new Date(record.date), "EEE, MMM d")}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 font-medium">
                          {record.check_in ? format(new Date(record.check_in), "hh:mm a") : "—"}
                        </td>
                        <td className="py-3 px-4 text-rose-600 font-medium">
                          {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {hours ? `${hours}h` : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                            record.status === "present" ? "bg-emerald-100 text-emerald-700" :
                            record.status === "absent" ? "bg-rose-100 text-rose-700" :
                            record.status === "half-day" ? "bg-amber-100 text-amber-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
