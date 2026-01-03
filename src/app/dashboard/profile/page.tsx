"use client"

import { useEffect, useState } from "react"
import { getUserSession, Employee } from "@/lib/auth"
import { supabase, SalaryStructure } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { format } from "date-fns"
import { User, Mail, Phone, MapPin, Building, Briefcase, Calendar, Save } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<Employee | null>(null)
  const [salary, setSalary] = useState<SalaryStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: ""
  })

  useEffect(() => {
    const session = getUserSession()
    if (session) {
      setUser(session)
      setFormData({
        phone: session.phone || "",
        address: session.address || "",
        city: session.city || "",
        state: session.state || "",
        zip_code: session.zip_code || ""
      })
      fetchSalary(session.id)
    }
  }, [])

  const fetchSalary = async (employeeId: string) => {
    const { data } = await supabase.from("salary_structure").select("*").eq("employee_id", employeeId).single()
    if (data) setSalary(data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const { error } = await supabase.from("employees").update(formData).eq("id", user.id)

    if (error) {
      toast.error("Failed to update profile")
    } else {
      const updatedUser = { ...user, ...formData }
      setUser(updatedUser)
      localStorage.setItem("dayflow_user", JSON.stringify(updatedUser))
      toast.success("Profile updated successfully")
      setEditMode(false)
    }
    setSaving(false)
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
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>My Profile</h1>
        <p className="text-slate-500 mt-1">View and manage your profile information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-lg shadow-violet-200">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
              <p className="text-slate-500">{user?.designation || "Employee"}</p>
              <span className="inline-block mt-2 text-xs px-3 py-1 bg-violet-100 text-violet-700 rounded-full capitalize">
                {user?.role}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail className="w-5 h-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Building className="w-5 h-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Department</p>
                  <p className="text-sm font-medium text-slate-900">{user?.department || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Join Date</p>
                  <p className="text-sm font-medium text-slate-900">
                    {user?.join_date ? format(new Date(user.join_date), "MMM d, yyyy") : "—"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-violet-600" />
                Personal Information
              </CardTitle>
              <Button 
                variant={editMode ? "outline" : "default"}
                size="sm"
                onClick={() => setEditMode(!editMode)}
                className={editMode ? "" : "bg-violet-600 hover:bg-violet-700"}
              >
                {editMode ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500 text-xs">Employee ID</Label>
                  <Input value={user?.employee_id || ""} disabled className="mt-1 bg-slate-50" />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Phone</Label>
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!editMode}
                    className={`mt-1 ${!editMode ? 'bg-slate-50' : ''}`}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-slate-500 text-xs">Address</Label>
                  <Input 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!editMode}
                    className={`mt-1 ${!editMode ? 'bg-slate-50' : ''}`}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">City</Label>
                  <Input 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    disabled={!editMode}
                    className={`mt-1 ${!editMode ? 'bg-slate-50' : ''}`}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">State</Label>
                  <Input 
                    value={formData.state} 
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    disabled={!editMode}
                    className={`mt-1 ${!editMode ? 'bg-slate-50' : ''}`}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">ZIP Code</Label>
                  <Input 
                    value={formData.zip_code} 
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    disabled={!editMode}
                    className={`mt-1 ${!editMode ? 'bg-slate-50' : ''}`}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
              {editMode && (
                <Button onClick={handleSave} disabled={saving} className="mt-4 bg-violet-600 hover:bg-violet-700">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-violet-600" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500 text-xs">Designation</Label>
                  <Input value={user?.designation || "—"} disabled className="mt-1 bg-slate-50" />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Department</Label>
                  <Input value={user?.department || "—"} disabled className="mt-1 bg-slate-50" />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Employment Type</Label>
                  <Input value={user?.employment_type || "Full-time"} disabled className="mt-1 bg-slate-50 capitalize" />
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Status</Label>
                  <Input value={user?.is_active ? "Active" : "Inactive"} disabled className="mt-1 bg-slate-50" />
                </div>
              </div>
            </CardContent>
          </Card>

          {salary && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Salary Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-emerald-600 mb-1">Basic Salary</p>
                    <p className="text-xl font-bold text-emerald-700">₹{salary.basic_salary?.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-600 mb-1">Total Allowances</p>
                    <p className="text-xl font-bold text-blue-700">
                      ₹{((salary.housing_allowance || 0) + (salary.transport_allowance || 0) + (salary.medical_allowance || 0) + (salary.other_allowances || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-rose-600 mb-1">Total Deductions</p>
                    <p className="text-xl font-bold text-rose-700">
                      ₹{((salary.tax_deduction || 0) + (salary.insurance_deduction || 0) + (salary.other_deductions || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
