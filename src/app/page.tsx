import Link from "next/link"
import { Calendar, Users, Clock, CalendarDays, DollarSign, Shield, CheckCircle2, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Complete employee profiles with personal details, job information, and documents.",
      color: "bg-blue-500"
    },
    {
      icon: Clock,
      title: "Attendance Tracking",
      description: "Daily check-in/out with weekly views and comprehensive attendance history.",
      color: "bg-emerald-500"
    },
    {
      icon: CalendarDays,
      title: "Leave Management",
      description: "Apply for leaves, track balances, and manage approvals seamlessly.",
      color: "bg-amber-500"
    },
    {
      icon: DollarSign,
      title: "Payroll Visibility",
      description: "View salary structure, allowances, deductions, and payment history.",
      color: "bg-violet-500"
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure admin and employee dashboards with proper access controls.",
      color: "bg-rose-500"
    },
    {
      icon: CheckCircle2,
      title: "Approval Workflows",
      description: "Streamlined approval process for leave requests and other HR tasks.",
      color: "bg-teal-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Dayflow</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30" />
        
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full text-violet-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Streamline your HR operations
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Every workday,
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              perfectly aligned.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Comprehensive HR Management System to digitize and streamline employee onboarding, 
            attendance tracking, leave management, and payroll visibility.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white h-14 px-8 text-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-200">
                View Demo
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-slate-500 mt-6">
            Demo credentials: admin@dayflow.com / admin123
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Everything you need to manage HR
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A complete suite of tools designed to simplify HR operations and enhance employee experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  className="group p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                >
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to transform your HR operations?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join thousands of companies that trust Dayflow for their HR management needs.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-violet-700 hover:bg-slate-100 h-14 px-8 text-lg">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                For Employees
              </h2>
              <ul className="space-y-4">
                {[
                  "View personal profile and job details",
                  "Check-in and check-out with one click",
                  "Apply for leaves and track status",
                  "View salary structure and payslips"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                For Admin / HR
              </h2>
              <ul className="space-y-4">
                {[
                  "Manage all employee records",
                  "Track attendance across the organization",
                  "Approve or reject leave requests",
                  "Control payroll and salary structures"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-violet-600" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Dayflow</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2025 Dayflow. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm">Sign In</Link>
              <Link href="/auth/register" className="text-slate-400 hover:text-white text-sm">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
