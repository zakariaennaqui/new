import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import {
  FaInstagram,
  FaLinkedin,
  FaGlobe,
  FaFacebook,
  FaTwitter
} from 'react-icons/fa' // ← Importation des icônes

const Footer = () => {
  const navigate = useNavigate()

  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* left section */}
        <div>
          <img onClick={() => navigate('meet')} className='cursor-pointer' src={assets.logo} alt="Experlik Logo" />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>...</p>
        </div>

        {/* center section */}
        <div>
          <p className='text-xl font-medium mb-5'>Company</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/about" className="hover:underline">About Us</a></li>
            <li><a href="/contact" className="hover:underline">Contact Us</a></li>
            <li><a href="/privacy-policy" className="hover:underline">Privacy Policy</a></li>
          </ul>
        </div>

        {/* right section */}
        <div>
          <p className='text-xl font-medium mb-5'>Get in Touch</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+212-767-235-196</li>
            <li className="flex items-center gap-1 text-neutral-800 font-semibold cursor-pointer underline" onClick={() => {window.location.href = `mailto:Experlik@gmail.com`;}}><img src={assets.chats_icon} alt="" className="w-5 h-5 cursor-pointer"/>Experlik@gmail.com</li>
            <a className="flex items-center gap-1 text-neutral-800 font-semibold cursor-pointer hover:underline" href="https://experlik.ma" ><FaGlobe className="w-5 h-5 cursor-pointer" />experlik.ma</a>
          </ul>

          {/* social media icons */}
          <div className='flex gap-4 mt-4 text-xl'>
            <a href='https://www.instagram.com/experlik' target='_blank' rel='noopener noreferrer' className='text-gray-600 hover:text-black'>
              <FaInstagram />
            </a>
            <a href='https://www.linkedin.com/company/experlik' target='_blank' rel='noopener noreferrer' className='text-gray-600 hover:text-black'>
              <FaLinkedin />
            </a>
            <a href='https://www.facebook.com/experlik.ma' target='_blank' rel='noopener noreferrer' className='text-gray-600 hover:text-black'>
              <FaFacebook />
            </a>
            <a href='https://x.com/experlik' target='_blank' rel='noopener noreferrer' className='text-gray-600 hover:text-black'>
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>© 2025 Experlik. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Footer
