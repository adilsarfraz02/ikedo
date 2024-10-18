'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Header'
import SimpleFooter from '@/components/SimpleFooter'

export default function ForgetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await axios.post('/api/users/forget-password', { email })
      toast.success('Password reset link sent to your email')
      router.push('/auth/login')
    } catch (error) {
      toast.error(error.response?.data?.error || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 px-6 py-20">
        <title>Forget Password</title>
        <div className="w-full max-w-md rounded-xl bg-white/10 px-6 py-12 backdrop-blur-md">
          <Link href="/auth/login" className="absolute left-6 top-8 text-white">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <form onSubmit={onSubmit} className="space-y-6">
            <h1 className="text-center text-3xl font-bold text-white">Forget Password</h1>
            <p className="text-center text-sm text-gray-300">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                placeholder="Enter your email"
                className="bg-white/20 text-white placeholder:text-gray-300"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-black text-white transition duration-300 ease-in-out hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <p className="text-center text-sm text-gray-300">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-white underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
      <SimpleFooter notBanner />
    </>
  )
}