"use client"

import { useEffect, useState } from "react"
import { supabase, Employee, SalaryStructure, Payroll } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { DollarSign, Search, Edit, Users, TrendingUp, Wallet } from "lucide-react"

type EmployeeWithSalary = Employee & { salary_structure?: SalaryStructure[] }

export default function AdminPayrollPage() {
  const [employees, setEmployees] = useState<EmployeeWithSalary[]>([])
  const [payrollRecords, setPayrollRecords] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithSalary | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [salaryForm, setSalaryForm] = useState({
    basic_salary: 0,
    housing_allowance: 0,
    transport_allowance: 0,
    medical_allowance: 0,
    other_allowances: 0,
    tax_deduction: 0,
    insurance_deduction: 0,
    other_deductions: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [employeesRes, payrollRes] = await Promise.all([
      supabase.from("employees").select("*, salary_structure(*)").eq("is_active", true),
      supabase.from("payroll").select("*, employee:employees(first_name, last_name, employee_id)").order("year", { ascending: false }).order("month", { ascending: false }).limit(50)
    ])

    if (employeesRes.data) setEmployees(employeesRes.data)
    if (payrollRes.data) setPayrollRecords(payrollRes.data)
    setLoading(false)
  }

  const handleEditSalary = (employee: EmployeeWithSalary) => {
    setSelectedEmployee(employee)
    const salary = employee.salary_structure?.[0]
    if (salary) {
      setSalaryForm({
        basic_salary: salary.basic_salary || 0,
        housing_allowance: salary.housing_allowance || 0,
        transport_allowance: salary.transport_allowance || 0,
        medical_allowance: salary.medical_allowance || 0,
        other_allowances: salary.other_allowances || 0,
        tax_deduction: salary.tax_deduction || 0,
        insurance_deduction: salary.insurance_deduction || 0,
        other_deductions: salary.other_deductions || 0
      })
    } else {
      setSalaryForm({
        basic_salary: 0, housing_allowance: 0, transport_allowance: 0,
        medical_allowance: 0, other_allowances: 0, tax_deduction: 0,
        insurance_deduction: 0, other_deductions: 0
      })
    }
    setDialogOpen(true)
  }

  const handleSaveSalary = async () => {
    if (!selectedEmployee) return
    setSubmitting(true)

    const existingSalary = selectedEmployee.salary_structure?.[0]

    if (existingSalary) {
      const { error } = await supabase
        .from("salary_structure")
        .update(salaryForm)
        .eq("id", existingSalary.id)

      if (error) {
        toast.error("Failed to update salary")
      } else {
        toast.success("Salary updated successfully")
        fetchData()
        setDialogOpen(false)
      }
    } else {
      const { error } = await supabase
        .from("salary_structure")
        .insert({ ...salaryForm, employee_id: selectedEmployee.id })

      if (error) {
        toast.error("Failed to create salary structure")
      } else {
        toast.success("Salary structure created")
        fetchData()
        setDialogOpen(false)
      }
    }
    setSubmitting(false)
  }

  const filteredEmployees = employees.filter(emp =>
    emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPayroll = employees.reduce((sum, emp) => {
    const salary = emp.salary_structure?.[0]
    if (!salary) return sum
    const net = (salary.basic_salary || 0) + (salary.housing_allowance || 0) + (salary.transport_allowance || 0) +
                (salary.medical_allowance || 0) + (salary.other_allowances || 0) - (salary.tax_deduction || 0) -
                (salary.insurance_deduction || 0) - (salary.other_deductions || 0)
    return sum + net
  }, 0)

  const getMonthName = (month: number) => format(new Date(2024, month - 1, 1), "MMMM")

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
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Payroll Management</h1>
        <p className="text-slate-500 mt-1">Manage employee salaries and payroll</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total Monthly Payroll</p>
                <p className="text-2xl font-bold">₹{totalPayroll.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Employees</p>
                <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Avg. Salary</p>
                <p className="text-2xl font-bold text-slate-900">₹{employees.length > 0 ? Math.round(totalPayroll / employees.length).toLocaleString() : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-violet-600" />
              Employee Salaries
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
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Basic</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Allowances</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Deductions</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Net Salary</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const salary = emp.salary_structure?.[0]
                  const allowances = salary ? (salary.housing_allowance || 0) + (salary.transport_allowance || 0) +
                                              (salary.medical_allowance || 0) + (salary.other_allowances || 0) : 0
                  const deductions = salary ? (salary.tax_deduction || 0) + (salary.insurance_deduction || 0) +
                                              (salary.other_deductions || 0) : 0
                  const net = salary ? (salary.basic_salary || 0) + allowances - deductions : 0
                  return (
                    <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-semibold text-sm">
                            {emp.first_name?.[0]}{emp.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{emp.first_name} {emp.last_name}</p>
                            <p className="text-xs text-slate-500">{emp.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">₹{(salary?.basic_salary || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600">+₹{allowances.toLocaleString()}</td>
                      <td className="py-3 px-4 text-rose-600">-₹{deductions.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">₹{net.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" onClick={() => handleEditSalary(emp)}>
                          <Edit className="w-4 h-4 text-violet-600" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          {payrollRecords.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No payroll records yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Employee</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Period</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Net Salary</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.slice(0, 10).map((record) => {
                    const emp = record.employee as unknown as { first_name: string; last_name: string; employee_id: string }
                    return (
                      <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{emp?.first_name} {emp?.last_name}</td>
                        <td className="py-3 px-4 text-slate-600">{getMonthName(record.month)} {record.year}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">₹{record.net_salary.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            record.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" :
                            record.payment_status === "processed" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {record.payment_status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Salary Structure - {selectedEmployee?.first_name} {selectedEmployee?.last_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Basic Salary</Label>
              <Input type="number" value={salaryForm.basic_salary} onChange={(e) => setSalaryForm({...salaryForm, basic_salary: Number(e.target.value)})} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Housing Allowance</Label>
                <Input type="number" value={salaryForm.housing_allowance} onChange={(e) => setSalaryForm({...salaryForm, housing_allowance: Number(e.target.value)})} className="mt-1" />
              </div>
              <div>
                <Label>Transport Allowance</Label>
                <Input type="number" value={salaryForm.transport_allowance} onChange={(e) => setSalaryForm({...salaryForm, transport_allowance: Number(e.target.value)})} className="mt-1" />
              </div>
              <div>
                <Label>Medical Allowance</Label>
                <Input type="number" value={salaryForm.medical_allowance} onChange={(e) => setSalaryForm({...salaryForm, medical_allowance: Number(e.target.value)})} className="mt-1" />
              </div>
              <div>
                <Label>Other Allowances</Label>
                <Input type="number" value={salaryForm.other_allowances} onChange={(e) => setSalaryForm({...salaryForm, other_allowances: Number(e.target.value)})} className="mt-1" />
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">Deductions</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tax Deduction</Label>
                  <Input type="number" value={salaryForm.tax_deduction} onChange={(e) => setSalaryForm({...salaryForm, tax_deduction: Number(e.target.value)})} className="mt-1" />
                </div>
                <div>
                  <Label>Insurance Deduction</Label>
                  <Input type="number" value={salaryForm.insurance_deduction} onChange={(e) => setSalaryForm({...salaryForm, insurance_deduction: Number(e.target.value)})} className="mt-1" />
                </div>
                <div>
                  <Label>Other Deductions</Label>
                  <Input type="number" value={salaryForm.other_deductions} onChange={(e) => setSalaryForm({...salaryForm, other_deductions: Number(e.target.value)})} className="mt-1" />
                </div>
              </div>
            </div>
            <div className="bg-violet-50 rounded-xl p-4">
              <p className="text-sm text-violet-600">Net Salary: <span className="font-bold text-lg">
                ₹{(salaryForm.basic_salary + salaryForm.housing_allowance + salaryForm.transport_allowance + salaryForm.medical_allowance + salaryForm.other_allowances - salaryForm.tax_deduction - salaryForm.insurance_deduction - salaryForm.other_deductions).toLocaleString()}
              </span></p>
            </div>
            <Button onClick={handleSaveSalary} disabled={submitting} className="w-full bg-violet-600 hover:bg-violet-700">
              {submitting ? "Saving..." : "Save Salary Structure"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
