"use client"

import React from "react"
import Link from "next/link"
import { X, Lock, LogIn, UserPlus, Shield, Code2, Sparkles } from "lucide-react"

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  actionType?: 'download' | 'purchase' | 'access'
  appName?: string
}

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  actionType = 'access',
  appName = 'this application'
}) => {
  if (!isOpen) return null

  const actionMessages = {
    download: 'download',
    purchase: 'purchase',
    access: 'access'
  }

  const actionVerb = actionMessages[actionType]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden animate-scale-in">
        
        {/* Animated Code Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          {/* Moving code lines */}
          <div className="absolute top-0 left-0 w-full animate-code-scroll-1">
            <pre className="text-purple-400 text-xs font-mono leading-relaxed">
{`const user = await authenticate();
if (user.isVerified) {
  return grantAccess();
}`}
            </pre>
          </div>
          
          <div className="absolute top-20 right-0 w-full animate-code-scroll-2 animation-delay-1000">
            <pre className="text-blue-400 text-xs font-mono leading-relaxed text-right">
{`function checkAuth() {
  return user?.token !== null;
}`}
            </pre>
          </div>
          
          <div className="absolute top-40 left-0 w-full animate-code-scroll-3 animation-delay-2000">
            <pre className="text-cyan-400 text-xs font-mono leading-relaxed">
{`<ProtectedRoute>
  <Application />
</ProtectedRoute>`}
            </pre>
          </div>

          <div className="absolute bottom-20 right-0 w-full animate-code-scroll-1 animation-delay-1500">
            <pre className="text-violet-400 text-xs font-mono leading-relaxed text-right">
{`if (!authenticated) {
  redirect('/login');
}`}
            </pre>
          </div>

          {/* Binary patterns */}
          <div className="absolute top-10 right-10 text-purple-500/30 font-mono text-[10px] animate-pulse-slow">
            01010110<br/>
            01000101<br/>
            01010100<br/>
            01010100
          </div>

          <div className="absolute bottom-10 left-10 text-blue-500/30 font-mono text-[10px] animate-pulse-slow animation-delay-1000">
            01000001<br/>
            01010101<br/>
            01010100<br/>
            01001000
          </div>

          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl animate-float animation-delay-2000" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative p-8 pt-12">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Authentication Required
          </h2>

          {/* Message */}
          <p className="text-gray-300 text-center mb-6 leading-relaxed">
            To {actionVerb} <span className="text-purple-400 font-semibold">{appName}</span>, you need to be signed in to your VETTCODE account.
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-8 bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Secure Access</p>
                <p className="text-xs text-gray-400">Protected downloads and purchases</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Track Your Apps</p>
                <p className="text-xs text-gray-400">Manage all your applications in one place</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Free Updates</p>
                <p className="text-xs text-gray-400">Get lifetime updates and support</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </Link>

            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition border border-gray-700/50 hover:border-purple-500/50"
            >
              <UserPlus className="w-5 h-5" />
              Create Account
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Join thousands of developers building with verified code
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthRequiredModal

