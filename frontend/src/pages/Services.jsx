import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Services = () => {

  const {speciality} = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  const navigate = useNavigate()

  const {services} = useContext(AppContext)

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(services.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(services)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [services, speciality])

  return (
    <div>
      <p className='text-gray-600'>browse through the services</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <button className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${showFilter ? 'bg-primary text-white' : ''}`} onClick={()=>setShowFilter(prev => !prev)}>filters</button>
        <div className={`flex-col gap-4 text-sm text-gray-600 ${showFilter ? 'flex' : 'hidden sm:flex'}`}>
          <p onClick={()=>speciality === 'teacher' ? navigate('/services') : navigate('/services/teacher') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "teacher" ? "bg-indigo-100 text-black" : "" } `} >teacher</p>
          <p onClick={()=>speciality === 'doctor' ? navigate('/services') : navigate('/services/doctor') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "doctor" ? "bg-indigo-100 text-black" : "" } `} >doctor</p>
          <p onClick={()=>speciality === 'electrician' ? navigate('/services') : navigate('/services/electrician') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "electrician" ? "bg-indigo-100 text-black" : "" } `} >electrician</p>
          <p onClick={()=>speciality === 'lawyer' ? navigate('/services') : navigate('/services/lawyer') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "lawyer" ? "bg-indigo-100 text-black" : "" } `} >lawyer</p>
          <p onClick={()=>speciality === 'barber' ? navigate('/services') : navigate('/services/barber') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "barber" ? "bg-indigo-100 text-black" : "" } `} >barber</p>
          <p onClick={()=>speciality === 'coach' ? navigate('/services') : navigate('/services/coach') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "coach" ? "bg-indigo-100 text-black" : "" } `} >coach</p>
          <p onClick={()=>speciality === 'chef' ? navigate('/services') : navigate('/services/chef') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "chef" ? "bg-indigo-100 text-black" : "" } `} >chef</p>
          <p onClick={()=>speciality === 'babysitter' ? navigate('/services') : navigate('/services/babysitter') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "babysitter" ? "bg-indigo-100 text-black" : "" } `} >babysitter</p>
          <p onClick={()=>speciality === 'delivery' ? navigate('/services') : navigate('/services/delivery') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "delivery" ? "bg-indigo-100 text-black" : "" } `} >delivery</p>
          <p onClick={()=>speciality === 'pet_groomer' ? navigate('/services') : navigate('/services/pet_groomer') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "pet_groomer" ? "bg-indigo-100 text-black" : "" } `} >pet_groomer</p>
          <p onClick={()=>speciality === 'photographer' ? navigate('/services') : navigate('/services/photographer') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "photographer" ? "bg-indigo-100 text-black" : "" } `} >photographer</p>
          <p onClick={()=>speciality === 'plumber' ? navigate('/services') : navigate('/services/plumber') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "plumber" ? "bg-indigo-100 text-black" : "" } `} >plumber</p>
          <p onClick={()=>speciality === 'translator' ? navigate('/services') : navigate('/services/translator') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "translator" ? "bg-indigo-100 text-black" : "" } `} >translator</p>
          <p onClick={()=>speciality === 'travel_agent' ? navigate('/services') : navigate('/services/travel_agent') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === "travel_agent" ? "bg-indigo-100 text-black" : "" } `} >travel_agent</p>

        </div>
        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {
            filterDoc.map((item, index) => (
              <div onClick={()=>navigate(`/appointment/${item._id}`)} key={index} className='border border-blue-400 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500'>
                <img src={item.image} alt={item.name} className='bg-blue-50' />
                <div className='p-4'>
                    <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : 'bg-gray-500'} text-xs font-semibold px-2 py-1 rounded-full`}>
                        <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-500'} rounded-full`}></p><p>{item.available ? 'Available' : 'Not Available'}</p>
                    </div>
                    <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                    <p className='text-gray-600 text-sm'>{item.speciality}</p>
                    <div className='mt-2 flex gap-2'>
                      <button
                        onClick={(e) => {e.stopPropagation(); navigate(`/appointment/${item._id}`); scrollTo(0,0)}}
                        className='text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600'
                      >
                        Rendez-vous
                      </button>
                      <button
                        onClick={(e) => {e.stopPropagation(); navigate(`/calendar-booking/${item._id}`); scrollTo(0,0)}}
                        className='text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600'
                      >
                        Créneaux
                      </button>
                    </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Services
