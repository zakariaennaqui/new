import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { ServiceContext } from '../context/ServiceContext'

const Sidebar = () => {

  const {aToken} = useContext(AdminContext)
  const {sToken} = useContext(ServiceContext)

  return (
    <div className='min-h-screen bg-white border-r'>
      {
        aToken && <ul className='text-[#515151] mt-5'>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/admin-dashboard'}>
            <img src={assets.home_icon} alt="" />
            <p className='hidden md:block'>dashboard</p>
          </NavLink>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/all-appointments'}>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>appointments</p>
          </NavLink>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/add-service'}>
            <img src={assets.add_icon} alt="" />
            <p className='hidden md:block'>add service</p>
          </NavLink>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/service-list'}>
            <img src={assets.people_icon} alt="" />
            <p className='hidden md:block'>services list</p>
          </NavLink>
        </ul>
      }
      {
        sToken && <ul className='text-[#515151] mt-5'>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/service-dashboard'}>
            <img src={assets.home_icon} alt="" />
            <p className='hidden md:block'>dashboard</p>
          </NavLink>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/service-appointments'}>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>appointments</p>
          </NavLink>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/service-calendar'}>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>calendrier</p>
          </NavLink>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/service-events'}>
            <img src={assets.appointment_icon} alt="" />
            <p className='hidden md:block'>événements</p>
          </NavLink>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/service-promo-codes'}>
            <img src={assets.add_icon} alt="" />
            <p className='hidden md:block'>codes promo</p>
          </NavLink>
          <NavLink className={({isActive})=>`flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to={'/service-profile'}>
            <img src={assets.people_icon} alt="" />
            <p className='hidden md:block'>profile</p>
          </NavLink>
        </ul>
      }
    </div>
  )
}

export default Sidebar
