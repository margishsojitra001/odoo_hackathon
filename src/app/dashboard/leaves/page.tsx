"use client"

import { useEffect, useState } from "react"
import { getUserSession, Employee } from "@/lib/auth"
import { supabase, LeaveRequest, LeaveType, LeaveBalance } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { format, differenceInDays } from "date-fns"
import { CalendarDays, Plus, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react"

export default function LeavesPage() {
  const [user, setUser] = useState<Employee | null>(null)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: ""
  })

  useEffect(() => {
    const session = getUserSession()
    if (session) {
      setUser(session)
      fetchData(session.id)
    }
  }, [])

  const fetchData = async (employeeId: string) => {
    const [typesRes, balancesRes, requestsRes] = await Promise.all([
      supabase.from("leave_types").select("*"),
      supabase.from("leave_balance").select("*, leave_type:leave_types(*)").eq("employee_id", employeeId).eq("year", new Date().getFullYear()),
      supabase.from("leave_requests").select("*, leave_type:leave_types(*)").eq("employee_id", employeeId).order("created_at", { ascending: false })
    ])

    if (typesRes.data) setLeaveTypes(typesRes.data)
    if (balancesRes.data) setLeaveBalances(balancesRes.data)
    if (requestsRes.data) setLeaveRequests(requestsRes.data)
    setLoading(false)
  }

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      return differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1
    }
    return 0
  }

  const handleSubmit = async () => {
    if (!user || !formData.leave_type_id || !formData.start_date || !formData.end_date) {
      toast.error("Please fill all required fields")
      return
    }

    const totalDays = calculateDays()
    if (totalDays <= 0) {
      toast.error("End date must be after start date")
      return
    }

    setSubmitting(true)

    const { data, error } = await supabase.from("leave_requests").insert({
      employee_id: user.id,
      leave_type_id: formData.leave_type_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      total_days: totalDays,
      reason: formData.reason,
      status: "pending"
    }).select("*, leave_type:leave_types(*)").single()

    if (error) {
      toast.error("Failed to submit leave request")
    } else if (data) {
      setLeaveRequests([data, ...leaveRequests])
      toast.success("Leave request submitted successfully")
      setDialogOpen(false)
      setFormData({ leave_type_id: "", start_date: "", end_date: "", reason: "" })
    }

    setSubmitting(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Leave Management</h1>
          <p className="text-slate-500 mt-1">Apply for leaves and track your requests</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Leave Type</Label>
                <Select value={formData.leave_type_id} onValueChange={(v) => setFormData({...formData, leave_type_id: v})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              {calculateDays() > 0 && (
                <div className="bg-violet-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-violet-600">Total Days: <span className="font-bold">{calculateDays()}</span></p>
                </div>
              )}
              <div>
                <Label>Reason (Optional)</Label>
                <Textarea 
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Enter reason for leave..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-violet-600 hover:bg-violet-700">
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalances.map((balance) => (
          <Card key={balance.id} className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <CalendarDays className="w-8 h-8 text-violet-600" />
                <span className={`text-xs px-2 py-1 rounded-full ${balance.leave_type?.is_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {balance.leave_type?.is_paid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">{balance.leave_type?.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-bold text-violet-600">{balance.remaining_days}</span>
                <span className="text-slate-400 mb-1">/ {balance.total_days} days</span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${(balance.remaining_days / balance.total_days) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{balance.used_days} days used</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No leave requests yet</p>
              <Button onClick={() => setDialogOpen(true)} variant="outline" className="mt-4">
                Apply for your first leave
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      leave.status === "approved" ? "bg-emerald-100" :
                      leave.status === "rejected" ? "bg-rose-100" :
                      "bg-amber-100"
                    }`}>
                      {leave.status === "approved" && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                      {leave.status === "rejected" && <XCircle className="w-6 h-6 text-rose-600" />}
                      {leave.status === "pending" && <Clock className="w-6 h-6 text-amber-600" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{leave.leave_type?.name}</p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")}
                      </p>
                      {leave.reason && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{leave.reason}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      leave.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                      leave.status === "rejected" ? "bg-rose-100 text-rose-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {leave.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-2">{leave.total_days} day(s)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
