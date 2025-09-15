import React from 'react'
import { ClipboardList, HandHeart, CheckCircle2 } from 'lucide-react'

const Work = () => {
  return (

    <div id="how-it-works" className="relative bg-[#f5faf8] mt-10 p-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="w-[400px] h-[400px] rounded-full bg-[#e6f3ef] blur-3xl opacity-60 absolute -top-20 -left-20" />
        <div className="w-[300px] h-[300px] rounded-full bg-[#e6f3ef] blur-3xl opacity-60 absolute -bottom-20 -right-10" />
      </div>
      <div className="relative">
    
         
         <div className='justify-center max-w-6xl mx-auto text-center px-4'>
            <h2 className='text-4xl font-bold tracking-tight'>How It Works</h2>
            <p className='text-lg md:text-xl text-gray-700 mt-3'>Three simple steps to help you recover your lost belongings or return found items to their rightful owners.</p>
         </div>

         <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>

            <div className='bg-white border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow'>
                <div className='mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#e6f3ef]'>
                  <ClipboardList className='text-[#15735b]' />
                </div>
                <div className='flex items-center gap-2'>
                  <span className='inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-[#e6f3ef] text-[#15735b]'>1</span>
                  <h4 className='font-semibold text-2xl'>Report Lost</h4>
                </div>
                <p className='mt-2 text-gray-700'>Fill out a simple form with details about your lost item to alert the community.</p>
                <div className='mt-4 text-left'>
                  <a href='/dashboard' className='text-[#15735b] font-medium hover:underline'>Start a lost report →</a>
                </div>
            </div>

            <div className='bg-white border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow'>
                <div className='mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#e6f3ef]'>
                  <HandHeart className='text-[#15735b]' />
                </div>
                <div className='flex items-center gap-2'>
                  <span className='inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-[#e6f3ef] text-[#15735b]'>2</span>
                  <h4 className='font-semibold text-2xl'>Post Found</h4>
                </div>
                <p className='mt-2 text-gray-700'>Found something? Post details to help connect it with its owner quickly.</p>
                <div className='mt-4 text-left'>
                  <a href='/dashboard' className='text-[#15735b] font-medium hover:underline'>Post a found item →</a>
                </div>
            </div>

            <div className='bg-white border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow'>
                <div className='mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#e6f3ef]'>
                  <CheckCircle2 className='text-[#15735b]' />
                </div>
                <div className='flex items-center gap-2'>
                  <span className='inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-[#e6f3ef] text-[#15735b]'>3</span>
                  <h4 className='font-semibold text-2xl'>Claim Back</h4>
                </div>
                <p className='mt-2 text-gray-700'>Verify your identity and retrieve your belongings safely and securely.</p>
                <div className='mt-4 text-left'>
                  <a href='/dashboard' className='text-[#15735b] font-medium hover:underline'>Check claim status →</a>
                </div>
            </div>
         </div>
        </div>

            

         </div>
    
  )
}

export default Work;