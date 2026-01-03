"use client"

import { useEffect, useState } from "react"
import { getUserSession, Employee } from "@/lib/auth"
import { supabase, LeaveRequest } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { CalendarDays, CheckCircle2, XCircle, Clock, Search, MessageSquare } from "lucide-react"

type LeaveRequestWithDetails = LeaveRequest & {
  employee?: Employee
  leave_type?: { name: string }
}

export default function AdminLeavesPage() {
  const [user, setUser] = useState<Employee | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestWithDetails | null>(null)
  const [comment, setComment] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const session = getUserSession()
    if (session) setUser(session)
    fetchLeaves()
  }, [filter])

  const fetchLeaves = async () => {
    let query = supabase
      .from("leave_requests")
      .select("*, employee:employees(*), leave_type:leave_types(name)")
      .order("created_at", { ascending: false })

    if (filter !== "all") {
      query = query.eq("status", filter)
    }

    const { data } = await query
    if (data) setLeaveRequests(data)
    setLoading(false)
  }

  const handleApproval = async (status: "approved" | "rejected") => {
    if (!selectedLeave || !user) return
    setProcessing(true)

    const { error } = await supabase
      .from("leave_requests")
      .update({
        status,
        reviewed_by: user.id,
        review_comment: comment,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", selectedLeave.id)

    if (error) {
      toast.error("Failed to update leave request")
    } else {
      toast.success(`Leave request ${status}`)
      fetchLeaves()
      setSelectedLeave(null)
      setComment("")
    }
    setProcessing(false)
  }

  const filteredRequests = leaveRequests.filter(leave => {
    const emp = leave.employee
    if (!searchQuery) return true
    return emp?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           emp?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           emp?.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const pendingCount = leaveRequests.filter(l => l.status === "pending").length
  const approvedCount = leaveRequests.filter(l => l.status === "approved").length
  const rejectedCount = leaveRequests.filter(l => l.status === "rejected").length

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
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Leave Requests</h1>
        <p className="text-slate-500 mt-1">Review and manage employee leave requests</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className={`border-0 shadow-md cursor-pointer transition-all ${filter === 'pending' ? 'ring-2 ring-amber-500' : ''}`} onClick={() => setFilter('pending')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                <p className="text-sm text-slate-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-md cursor-pointer transition-all ${filter === 'approved' ? 'ring-2 ring-emerald-500' : ''}`} onClick={() => setFilter('approved')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{approvedCount}</p>
                <p className="text-sm text-slate-500">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`border-0 shadow-md cursor-pointer transition-all ${filter === 'rejected' ? 'ring-2 ring-rose-500' : ''}`} onClick={() => setFilter('rejected')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{rejectedCount}</p>
                <p className="text-sm text-slate-500">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-violet-600" />
              Leave Requests
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No leave requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((leave) => {
                const emp = leave.employee
                return (
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
                        <p className="font-semibold text-slate-900">{emp?.first_name} {emp?.last_name}</p>
                        <p className="text-sm text-slate-500">{emp?.employee_id} • {leave.leave_type?.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {format(new Date(leave.start_date), "MMM d")} - {format(new Date(leave.end_date), "MMM d, yyyy")} ({leave.total_days} days)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        leave.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                        leave.status === "rejected" ? "bg-rose-100 text-rose-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {leave.status}
                      </span>
                      {leave.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => setSelectedLeave(leave)}>
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedLeave} onOpenChange={() => { setSelectedLeave(null); setComment(""); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 pt-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold">
                    {selectedLeave.employee?.first_name?.[0]}{selectedLeave.employee?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedLeave.employee?.first_name} {selectedLeave.employee?.last_name}</p>
                    <p className="text-sm text-slate-500">{selectedLeave.employee?.employee_id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Leave Type</p>
                    <p className="font-medium">{selectedLeave.leave_type?.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Duration</p>
                    <p className="font-medium">{selectedLeave.total_days} days</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Start Date</p>
                    <p className="font-medium">{format(new Date(selectedLeave.start_date), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">End Date</p>
                    <p className="font-medium">{format(new Date(selectedLeave.end_date), "MMM d, yyyy")}</p>
                  </div>
                </div>
                {selectedLeave.reason && (
                  <div>
                    <p className="text-slate-500 text-sm">Reason</p>
                    <p className="text-sm">{selectedLeave.reason}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" /> Comment (optional)
                </label>
                <Textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleApproval("rejected")} 
                  disabled={processing}
                  variant="outline"
                  className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => handleApproval("approved")} 
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
