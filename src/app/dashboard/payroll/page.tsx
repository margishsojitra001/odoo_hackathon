"use client"

import { useEffect, useState } from "react"
import { getUserSession, Employee } from "@/lib/auth"
import { supabase, SalaryStructure, Payroll } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { DollarSign, TrendingUp, TrendingDown, Wallet, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PayrollPage() {
  const [user, setUser] = useState<Employee | null>(null)
  const [salary, setSalary] = useState<SalaryStructure | null>(null)
  const [payrollHistory, setPayrollHistory] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getUserSession()
    if (session) {
      setUser(session)
      fetchData(session.id)
    }
  }, [])

  const fetchData = async (employeeId: string) => {
    const [salaryRes, payrollRes] = await Promise.all([
      supabase.from("salary_structure").select("*").eq("employee_id", employeeId).single(),
      supabase.from("payroll").select("*").eq("employee_id", employeeId).order("year", { ascending: false }).order("month", { ascending: false })
    ])

    if (salaryRes.data) setSalary(salaryRes.data)
    if (payrollRes.data) setPayrollHistory(payrollRes.data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    )
  }

  const totalAllowances = salary ? 
    (salary.housing_allowance || 0) + (salary.transport_allowance || 0) + (salary.medical_allowance || 0) + (salary.other_allowances || 0) : 0

  const totalDeductions = salary ?
    (salary.tax_deduction || 0) + (salary.insurance_deduction || 0) + (salary.other_deductions || 0) : 0

  const netSalary = salary ? (salary.basic_salary || 0) + totalAllowances - totalDeductions : 0

  const getMonthName = (month: number) => {
    return format(new Date(2024, month - 1, 1), "MMMM")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Payroll</h1>
        <p className="text-slate-500 mt-1">View your salary structure and payment history</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 text-white/80" />
            </div>
            <p className="text-sm text-white/80">Net Salary</p>
            <p className="text-3xl font-bold mt-1">₹{netSalary.toLocaleString()}</p>
            <p className="text-xs text-white/60 mt-2">Per month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm text-slate-500">Basic Salary</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{(salary?.basic_salary || 0).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-slate-500">Total Allowances</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">+₹{totalAllowances.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-sm text-slate-500">Total Deductions</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">-₹{totalDeductions.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {salary && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Allowances Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Housing Allowance</span>
                  <span className="font-semibold text-slate-900">₹{(salary.housing_allowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Transport Allowance</span>
                  <span className="font-semibold text-slate-900">₹{(salary.transport_allowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Medical Allowance</span>
                  <span className="font-semibold text-slate-900">₹{(salary.medical_allowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Other Allowances</span>
                  <span className="font-semibold text-slate-900">₹{(salary.other_allowances || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-semibold text-emerald-700">Total Allowances</span>
                  <span className="font-bold text-emerald-700">₹{totalAllowances.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-500" />
                Deductions Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Tax Deduction</span>
                  <span className="font-semibold text-slate-900">₹{(salary.tax_deduction || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Insurance Deduction</span>
                  <span className="font-semibold text-slate-900">₹{(salary.insurance_deduction || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">Other Deductions</span>
                  <span className="font-semibold text-slate-900">₹{(salary.other_deductions || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="font-semibold text-rose-700">Total Deductions</span>
                  <span className="font-bold text-rose-700">₹{totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-600" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payrollHistory.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No payment history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Period</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Basic</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Allowances</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Deductions</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Net</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollHistory.map((payroll) => (
                    <tr key={payroll.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {getMonthName(payroll.month)} {payroll.year}
                      </td>
                      <td className="py-3 px-4 text-slate-600">₹{payroll.basic_salary.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600">+₹{payroll.allowances.toLocaleString()}</td>
                      <td className="py-3 px-4 text-rose-600">-₹{payroll.deductions.toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">₹{payroll.net_salary.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          payroll.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" :
                          payroll.payment_status === "processed" ? "bg-blue-100 text-blue-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {payroll.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700">
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
