import {React, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import {useNavigate} from 'react-router-dom'
import { assets } from '../assets/assets'

const MyAppointments = () => {

  const {backendUrl, token, getServicesData} = useContext(AppContext)

  const [appointments, setAppointments] = useState([])
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_")
    return dateArray[0]+ " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  const navigate = useNavigate()

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token }})
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getServicesData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + '/api/user/verifyRazorpay', response , { headers: { token }})
          if (data.success) {
            getUserAppointments()
            navigate('/my-appointments')
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token }})
      if (data.success) {
        initPay(data.order)
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const appointmentStripe = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, {
        headers: { token }
      })
      if (data.success) {
        window.location.replace(data.session_url)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const appointmentSharedSkills = async (appointment) => {
  try {
    // Simuler les données de paiement avec customerId numérique
    const paymentData = {
      customerId: parseInt(appointment.userId) || 123456, // Conversion en number
      orderId: appointment._id,
      price: appointment.price || 100,
      description: `Rendez-vous avec ${appointment.docData.name}`,
      customerEmail: appointment.userEmail || 'client@example.com',
      customerName: appointment.userName || 'Client',
      ipAdress: window.clientIp || '127.0.0.1', // Meilleure gestion de l'IP
      applicationSource: "SharedSkills",
      currency: "MAD", // Ajout de la devise
      language: "fr_FR" // Langue française
    };

    // Vérification des données avant envoi
    console.log("Données de paiement:", paymentData);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://vps.les-experts.ma/';
    form.target = '_blank';

    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

  } catch (error) {
    console.error("Erreur de paiement :", error);
    toast.error("Erreur lors de l'initialisation du paiement");
  }
};

  useEffect(()=>{
    if (token) {
      getUserAppointments()
    }
  }, [token])

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
      <div>
        {appointments.map((item, index) => (
          <div key={index} className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b">
            <div>
              <img src={item.docData.image} alt="" className="w-32 bg-indigo-50" />
            </div>
            <div className='flex-1 text-sm text-zinc-600'>
              <p className="text-neutral-800 font-semibold">{item.docData.name}</p>
              <p className="flex items-center gap-1 text-neutral-800 font-semibold cursor-pointer underline" title="send email msg" onClick={() => {window.location.href = `mailto:${item.docData.email}`;}}>
                <img src={assets.chats_icon} alt="" className="w-5 h-5 cursor-pointer"/>{item.docData.email}
              </p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>address:</p>
              <p className='text-xs'>{item.docData.address.line1}</p>
              <p className='text-xs'>{item.docData.address.line2}</p>
              <p className="text-xs mt-1"> <span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
            </div>
            <div className='flex flex-col gap-2 justify-end'>
              {!item.cancelled && item.payment && !item.isCompleted && <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>paid</button>}
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <>
                  <button onClick={() => appointmentRazorpay(item._id)} className="flex items-center justify-center gap-2 text-sm text-stone-500 text-center sm:min-w-48 py-2 px-3 border hover:bg-primary hover:text-white transition-all duration-300">
                    <img src={assets.razorpay_logo} alt="Razorpay" className="h-4 w-auto"/>Pay with Razorpay
                  </button>
                  <button onClick={() => appointmentStripe(item._id)} className="flex items-center justify-center gap-2 text-sm text-stone-500 text-center sm:min-w-48 py-2 px-3 border hover:bg-primary hover:text-white transition-all duration-300">
                    <img src={assets.stripe_logo} alt="Stripe" className="h-4 w-auto"/>Pay with Stripe
                  </button>
                  <button onClick={() => appointmentSharedSkills(item)} className='flex items-center justify-center gap-2 text-sm text-stone-500 text-center sm:min-w-48 py-2 px-3 border hover:bg-primary hover:text-white transition-all duration-300'>
                    <img src={assets.payzone_rebrand} alt="" className="h-4 w-auto"/>Pay with Payzone
                  </button>
                </>
              )}
              {!item.cancelled && !item.isCompleted && <button onClick={()=>cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300'>cancel appointment</button>}
              {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>appointment cancelled</button>}
              {item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyAppointments