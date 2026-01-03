"use client"

import { useEffect, useState } from "react"
import { getUserSession, Employee } from "@/lib/auth"
import { supabase, Attendance } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks, isToday, isSameDay } from "date-fns"
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, Coffee } from "lucide-react"

export default function AttendancePage() {
  const [user, setUser] = useState<Employee | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getUserSession()
    if (session) {
      setUser(session)
      fetchAttendance(session.id)
    }
  }, [currentWeek])

  const fetchAttendance = async (employeeId: string) => {
    const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "yyyy-MM-dd")
    const weekEnd = format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "yyyy-MM-dd")
    const today = format(new Date(), "yyyy-MM-dd")

    const [weekRes, todayRes] = await Promise.all([
      supabase.from("attendance").select("*").eq("employee_id", employeeId).gte("date", weekStart).lte("date", weekEnd).order("date"),
      supabase.from("attendance").select("*").eq("employee_id", employeeId).eq("date", today).single()
    ])

    if (weekRes.data) setAttendance(weekRes.data)
    if (todayRes.data) setTodayAttendance(todayRes.data)
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
      setAttendance([...attendance, data])
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
      setAttendance(attendance.map(a => a.id === data.id ? data : a))
    }
  }

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 1 })
  })

  const getAttendanceForDay = (day: Date) => {
    return attendance.find(a => isSameDay(new Date(a.date), day))
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "present": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case "absent": return <XCircle className="w-5 h-5 text-rose-500" />
      case "half-day": return <Coffee className="w-5 h-5 text-amber-500" />
      case "leave": return <AlertCircle className="w-5 h-5 text-blue-500" />
      default: return <div className="w-5 h-5 rounded-full bg-slate-200" />
    }
  }

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
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Attendance</h1>
        <p className="text-slate-500 mt-1">Track your daily attendance</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600" />
            Today - {format(new Date(), "EEEE, MMMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Check In</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {todayAttendance?.check_in ? format(new Date(todayAttendance.check_in), "hh:mm a") : "--:--"}
                </p>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Check Out</p>
                <p className="text-2xl font-bold text-rose-600">
                  {todayAttendance?.check_out ? format(new Date(todayAttendance.check_out), "hh:mm a") : "--:--"}
                </p>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  todayAttendance?.status === "present" ? "bg-emerald-100 text-emerald-700" :
                  todayAttendance?.status === "absent" ? "bg-rose-100 text-rose-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {todayAttendance?.status || "Not marked"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {!todayAttendance ? (
                <Button onClick={handleCheckIn} className="bg-emerald-600 hover:bg-emerald-700">
                  <Clock className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              ) : !todayAttendance.check_out ? (
                <Button onClick={handleCheckOut} variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                  <Clock className="w-4 h-4 mr-2" />
                  Check Out
                </Button>
              ) : (
                <span className="text-sm text-slate-500">Day completed</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Weekly View</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[180px] text-center">
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM d")} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM d, yyyy")}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayAttendance = getAttendanceForDay(day)
              const isCurrentDay = isToday(day)
              return (
                <div 
                  key={day.toString()} 
                  className={`p-3 rounded-xl text-center transition-all ${
                    isCurrentDay ? 'bg-violet-100 ring-2 ring-violet-500' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs text-slate-500">{format(day, "EEE")}</p>
                  <p className={`text-lg font-bold mb-2 ${isCurrentDay ? 'text-violet-700' : 'text-slate-900'}`}>
                    {format(day, "d")}
                  </p>
                  <div className="flex justify-center">
                    {getStatusIcon(dayAttendance?.status)}
                  </div>
                  {dayAttendance?.check_in && (
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(dayAttendance.check_in), "h:mm a")}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span className="text-sm text-slate-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-slate-600">Half-day</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-slate-600">Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Check In</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Check Out</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500">No attendance records for this week</td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {format(new Date(record.date), "EEE, MMM d")}
                      </td>
                      <td className="py-3 px-4 text-emerald-600">
                        {record.check_in ? format(new Date(record.check_in), "hh:mm a") : "—"}
                      </td>
                      <td className="py-3 px-4 text-rose-600">
                        {record.check_out ? format(new Date(record.check_out), "hh:mm a") : "—"}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
