import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>contact <span className='text-gray-700 font-semibold'>us</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px]' src={assets.contact_image} alt="" />

        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-lg text-gray-600'>our office</p>
          <p className='text-gray-500'>255, Technopark Casablanca<br />...</p>
          <p className='text-gray-500'>tel: (212) 767-235196</p>
          <p className="flex items-center gap-1 text-gray-500 font-semibold cursor-pointer underline" title="send email msg" onClick={() => {window.location.href = `mailto:Experlik@gmail.com`;}}><img src={assets.chats_icon} alt="" className="w-5 h-5 cursor-pointer"/>Experlik@gmail.com</p>
          <p className='font-semibold text-lg text-gray-600'>careers at Experlik</p>
          <p className='text-gray-500'>descrip</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
        </div>
      </div>
    </div>
  )
}

export default Contact
