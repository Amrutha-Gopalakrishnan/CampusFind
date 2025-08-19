import React from 'react'
import { FaClipboard, FaHandHolding, FaCheck } from 'react-icons/fa';

const Work = () => {
  return (

    <div className="bg-[#f3f3f3] mt-10 p-10">
    
         
         <div className='justify-center max-w-6xl mx-auto text-center px-4'>
            <h1 className='text-4xl font-bold'>How It Works</h1>
            <p className='text-xl font-medium mt-3'>Three simple steps to help you recover your lost belongings or return found items to their rightful owners.</p>
         </div>

         <div className='grid grid-cols-3 gap-10 mt-20'>

            <div className='bg-white shadow-2xl border-black rounded-md flex flex-col items-center justify-center p-5'>
                <div className='m-5 align-middle text-purple-800 shadow-md text-5xl flex items-center justify-center bg-gray-200 p-5 border-none w-20 h-20 rounded-t-lg'> <FaClipboard /></div>
                <h4 className='font-semibold text-3xl'>Report Lost</h4>
                <p className='mt-3 font-medium text-center '>Fill out a simple form with details about your lost item to alert the community.</p>
            </div>

            <div className='bg-white shadow-2xl border-black rounded-md flex flex-col items-center justify-center p-5'>
                <div className='m-5 align-middle text-purple-800 shadow-md text-5xl flex items-center justify-center bg-gray-200 p-5 border-none w-20 h-20 rounded-t-lg'> <FaHandHolding /></div>
                <h4 className='font-semibold text-3xl'>Post Found</h4>
                <p className='mt-3 text-center font-medium '>Found something? Post details to help connect it with its owner quickly.</p>
            </div>

            <div className='bg-white shadow-2xl border-black rounded-md flex flex-col items-center justify-center p-5'>
                <div className='m-5 align-middle text-purple-800 shadow-md text-5xl flex items-center justify-center bg-gray-200 p-5 border-none w-20 h-20 rounded-t-lg'> <FaCheck /></div>
                <h4 className='font-semibold text-3xl'>Claim Back</h4>
                <p className='mt-3 font-medium text-center'>Verify your identity and retrieve your belongings safely and securely.</p>
            </div>

            

         </div>


    
    </div>
  )
}

export default Work;