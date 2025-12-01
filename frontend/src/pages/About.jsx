import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>about <span className='text-gray-700 font-medium'>us</span></p>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[230px]' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>welcome to Experlik, your trusted partner appointments. Our platform connects you with top-rated servives and specialists, making it easy to book appointments online.</p>
          <p>At Experlik, we ...</p>
          <b className='text-gray-800'>our vision</b>
          <p>We are committed to providing a seamless experience, from booking your appointment to receiving reminders and follow-ups. Our goal is to empower you to take control of ...</p>
        </div>
      </div>

      <div className='text-xl my-4'>
        <p>why <span className='text-gray-700 font-semibold'>choose us</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Efficacité :</b>
          <p>Planification simplifiée des rendez-vous qui s'adapte à votre style de vie trépidant.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Commodité :</b>
          <p>Accès à un réseau de professionnels de confiance dans votre région.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
          <b>Personnalisation :</b>
          <p>Recommandations et rappels personnalisés pour vous aider à prendre ...</p>
        </div>
      </div>
    </div>
  )
}

export default About
