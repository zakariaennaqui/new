import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const VerifyCalendarPayment = () => {
  const [searchParams] = useSearchParams()
  const success = searchParams.get('success')
  const slotId = searchParams.get('slotId')
  const provider = searchParams.get('provider')

  const { token, backendUrl } = useContext(AppContext)
  const navigate = useNavigate()

  const verifyStripe = async () => {
    try {
      if (!token || !slotId) return

      const { data } = await axios.post(
        `${backendUrl}/api/user/verifyCalendarStripe`,
        { success, slotId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        navigate('/my-calendar-bookings')
      } else {
        toast.error(data.message)
        navigate('/my-calendar-bookings')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const verifyPayzone = async () => {
    try {
      if (!token || !slotId) return

      const { data } = await axios.post(
        `${backendUrl}/api/user/verifyCalendarPayzone`, 
        { slotId }, 
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate('/my-calendar-bookings');
      } else {
        toast.error(data.message);
        navigate('/my-calendar-bookings');
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
      navigate('/my-calendar-bookings');
    }
  }

  useEffect(() => {
    if (provider === 'payzone' && success === 'true') {
      verifyPayzone()
    } else {
      verifyStripe()
    }
  }, [token])

  return (
    <div className='flex justify-center items-center h-[50vh]'>
      <p className='text-lg text-gray-600'>Traitement du paiement...</p>
    </div>
  )
}

export default VerifyCalendarPayment