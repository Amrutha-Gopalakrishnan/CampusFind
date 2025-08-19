import React, { memo } from 'react'

const Navbar = memo(() => {
  return (
    <div>
      <nav className='flex gap-8 justify-between p-5'>
        <h1 className='text-4xl text-violet-800 font-bold ms-30 '>BelongiFy</h1>

          <div className='flex gap-8 me-30'>
                <button className='btn flex bg-violet-100 text-violet-700 p-3 font-semibold border-none rounded-md hover:bg-violet-800 hover:text-white'>Get Started</button>
           
            <button className='btn flex bg-violet-100 p-3  text-violet-700 font-semibold border-none rounded-md hover:bg-violet-800 hover:text-white'>Login</button>
   
            <button className='btn flex bg-violet-100 p-3  text-violet-700 font-semibold border-none rounded-md hover:bg-violet-800 hover:text-white'>SignUp</button>
   
        </div>
      </nav>
    </div>
  )
})

export default Navbar