import React from 'react'
import { FaArrowRight } from "react-icons/fa";
import hero from './assets/hero.png'

const Hero = () => {
  return (
    <div className="grid grid-cols-2 items-center mt-5 ms-20">

        {/* left side starts */}
        <div>
            <h1 className=' mb-15 text-left font-bold text-6xl'>BelongiFy <br />
            Finding Your <span className=' text-violet-800'>Belongings</span> </h1> 

            <div className='mt-2 text-left text-xl font-semibold'>
                <p>A secure platform for college students to report lost items,<br></br> 
                post found belongings, and reclaim their possessions with ease.</p>
            </div>

            <div className='flex gap-10'>
                <div>
                    <button className='btn flex mt-5 bg-violet-100 text-violet-700 p-3 font-semibold border-none rounded-md hover:bg-violet-800 hover:text-white'>Get Started <FaArrowRight className='ms-5 justify-center align-middle flex mt-1' /> </button>
                </div>

                <div>
                     <button className='btn flex mt-5 bg-violet-100 text-violet-700 p-3 font-semibold border-none rounded-md hover:bg-violet-800 hover:text-white'> Contact Us </button>
                </div>
            </div>
            {/* left side ends */}

               </div>

               {/* ri8 starts */}

               <div className='flex items-center me-10'>
                    <img src={hero} className='mt-10 w-auto h-auto' alt="" />

               </div>

    </div>
  )
}

export default Hero;
