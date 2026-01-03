"use client"

import { useEffect, useState } from "react"
import { supabase, Employee } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { Users, Plus, Search, Edit, Trash2, Mail, Phone, Building } from "lucide-react"

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: "",
    email: "",
    password_hash: "",
    first_name: "",
    last_name: "",
    phone: "",
    department: "",
    designation: "",
    role: "employee" as "admin" | "hr" | "employee",
    join_date: ""
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false })
    if (data) setEmployees(data)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      employee_id: "", email: "", password_hash: "", first_name: "", last_name: "",
      phone: "", department: "", designation: "", role: "employee", join_date: ""
    })
    setEditingEmployee(null)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      employee_id: employee.employee_id,
      email: employee.email,
      password_hash: "",
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone: employee.phone || "",
      department: employee.department || "",
      designation: employee.designation || "",
      role: employee.role,
      join_date: employee.join_date || ""
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.email || !formData.first_name || !formData.last_name) {
      toast.error("Please fill all required fields")
      return
    }

    setSubmitting(true)

    if (editingEmployee) {
      const updateData: Partial<typeof formData> = { ...formData }
      if (!updateData.password_hash) delete updateData.password_hash
      
      const { error } = await supabase.from("employees").update(updateData).eq("id", editingEmployee.id)
      
      if (error) {
        toast.error("Failed to update employee")
      } else {
        toast.success("Employee updated successfully")
        fetchEmployees()
        setDialogOpen(false)
        resetForm()
      }
    } else {
      if (!formData.password_hash) {
        toast.error("Password is required for new employees")
        setSubmitting(false)
        return
      }

      const { error } = await supabase.from("employees").insert(formData)
      
      if (error) {
        toast.error(error.message || "Failed to add employee")
      } else {
        toast.success("Employee added successfully")
        fetchEmployees()
        setDialogOpen(false)
        resetForm()
      }
    }

    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("employees").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete employee")
    } else {
      toast.success("Employee deleted")
      setEmployees(employees.filter(e => e.id !== id))
    }
  }

  const filteredEmployees = employees.filter(emp => 
    emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Employees</h1>
          <p className="text-slate-500 mt-1">Manage all employees</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee ID *</Label>
                  <Input value={formData.employee_id} onChange={(e) => setFormData({...formData, employee_id: e.target.value})} className="mt-1" placeholder="EMP003" />
                </div>
                <div>
                  <Label>Role *</Label>
                  <Select value={formData.role} onValueChange={(v: "admin" | "hr" | "employee") => setFormData({...formData, role: v})}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="hr">HR Officer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>{editingEmployee ? "Password (leave blank to keep)" : "Password *"}</Label>
                <Input type="password" value={formData.password_hash} onChange={(e) => setFormData({...formData, password_hash: e.target.value})} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label>Join Date</Label>
                  <Input type="date" value={formData.join_date} onChange={(e) => setFormData({...formData, join_date: e.target.value})} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="mt-1" />
                </div>
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-violet-600 hover:bg-violet-700">
                {submitting ? "Saving..." : editingEmployee ? "Update Employee" : "Add Employee"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              All Employees ({filteredEmployees.length})
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search employees..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Employee</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Join Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold">
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-slate-500">{emp.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {emp.email}
                        </p>
                        {emp.phone && (
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {emp.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-600">{emp.department || "—"}</span>
                      </div>
                      <p className="text-xs text-slate-400">{emp.designation || "—"}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                        emp.role === "admin" ? "bg-violet-100 text-violet-700" :
                        emp.role === "hr" ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {emp.join_date ? format(new Date(emp.join_date), "MMM d, yyyy") : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)}>
                          <Edit className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
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
