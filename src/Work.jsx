import React from 'react'
import { ClipboardList, HandHeart, CheckCircle2, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'

const Work = () => {
  return (
    <div id="how-it-works" className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-black text-gray-900">How It Works</h2>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Three simple steps to help you recover your lost belongings or return found items to their rightful owners.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-full flex items-center justify-center">1</span>
                <h4 className="text-2xl font-black text-gray-900">Report Lost</h4>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Fill out a simple form with details about your lost item to alert the community and increase your chances of recovery.
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-300">
              <span>Start a lost report</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <HandHeart className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-bold rounded-full flex items-center justify-center">2</span>
                <h4 className="text-2xl font-black text-gray-900">Post Found</h4>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Found something? Post details with photos to help connect it with its owner quickly and securely.
            </p>
            <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all duration-300">
              <span>Post a found item</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold rounded-full flex items-center justify-center">3</span>
                <h4 className="text-2xl font-black text-gray-900">Claim Back</h4>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Verify your identity and retrieve your belongings safely through our secure verification process.
            </p>
            <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all duration-300">
              <span>Check claim status</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Get instant notifications when items match your criteria</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Safe</h3>
            <p className="text-gray-600">College-only access ensures trusted community interactions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Claims</h3>
            <p className="text-gray-600">Identity verification ensures safe item returns</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Work;