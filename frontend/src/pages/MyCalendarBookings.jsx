import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

import { assets } from '../assets/assets';

const MyCalendarBookings = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserBookings = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/calendar/user-bookings`, {
        headers: { token }
      });

      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Calendar Booking Payment',
      description: 'Calendar Booking Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);

        try {
          const { data } = await axios.post(backendUrl + '/api/user/verifyCalendarRazorpay', response, { headers: { token } });
          if (data.success) {
            getUserBookings();
            toast.success('Paiement réussi');
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const bookingPaymentRazorpay = async (slotId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/calendar-payment-razorpay', { slotId }, { headers: { token } });
      if (data.success) {
        initPay(data.order);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const bookingPaymentStripe = async (slotId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/calendar-payment-stripe', { slotId }, {
        headers: { token }
      });

      if (data.success) {
        window.location.replace(data.session_url);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const bookingPaymentPayzone = async (slotId) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/user/calendar-payment-payzone', {
        slotId
      }, {
        headers: { token }
      });

      if (data.success) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.formData.url;

        Object.entries(data.formData.data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cancelBooking = async (slotId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/calendar/cancel-booking`,
        { slotId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (date, startTime) => {
    const slotDateTime = new Date(`${date}T${startTime}:00`);
    return slotDateTime > new Date();
  };

  useEffect(() => {
    if (token) {
      getUserBookings();
    }
  }, [token]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-lg text-gray-600'>Chargement de vos réservations...</p>
      </div>
    );
  }

  return (
    <div className='py-8'>
      <h1 className='text-2xl font-bold text-gray-800 mb-6'>Mes Réservations de Créneaux</h1>

      {bookings.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg mb-4'>Aucune réservation de créneau</p>
          <a 
            href='/services' 
            className='text-blue-500 hover:text-blue-600 underline'
          >
            Découvrir les services disponibles
          </a>
        </div>
      ) : (
        <div className='space-y-4'>
          {bookings.map(booking => (
            <div key={booking._id} className='bg-white border rounded-lg shadow-sm p-6'>
              <div className='flex justify-between items-start'>
                <div className='flex items-center'>
                  <img 
                    src={booking.bookingData.serviceData.image} 
                    alt={booking.bookingData.serviceData.name}
                    className='w-16 h-16 rounded-full mr-4'
                  />
                  <div>
                    <h3 className='text-lg font-semibold text-gray-800'>
                      {booking.bookingData.serviceData.name}
                    </h3>
                    <p className='text-gray-600'>{booking.bookingData.serviceData.speciality}</p>
                    <p className='text-gray-500 text-sm'>{booking.bookingData.serviceData.email}</p>
                  </div>
                </div>
                
                <div className='text-right'>
                  <div className={`inline-block px-3 py-1 text-sm rounded-full ${
                    isUpcoming(booking.date, booking.startTime)
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isUpcoming(booking.date, booking.startTime) ? 'À venir' : 'Passé'}
                  </div>
                </div>
              </div>

              <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div>
                  <span className='font-medium text-gray-700'>Date:</span>
                  <p className='text-gray-600'>{formatDate(booking.date)}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Heure:</span>
                  <p className='text-gray-600'>{booking.startTime} - {booking.endTime}</p>
                </div>
                <div>
                  <span className='font-medium text-gray-700'>Durée:</span>
                  <p className='text-gray-600'>{booking.duration} minutes</p>
                </div>
              </div>

              <div className='mt-4 text-xs text-gray-500'>
                Réservé le: {formatDateTime(booking.bookingData.bookedAt)}
              </div>

              <div className='mt-4 flex flex-col gap-2'>
                {/* Payment buttons */}
                {!booking.cancelled && booking.payment && !booking.isCompleted && (
                  <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50'>
                    Payé
                  </button>
                )}
                
                {!booking.cancelled && !booking.payment && !booking.isCompleted && booking.amount > 0 && (
                  <div className='flex flex-col gap-2'>
                    <button 
                      onClick={() => bookingPaymentRazorpay(booking._id)} 
                      className="flex items-center justify-center gap-2 text-sm text-stone-500 text-center sm:min-w-48 py-2 px-3 border hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      <img src={assets.razorpay_logo} alt="Razorpay" className="h-4 w-auto"/>
                      Payer avec Razorpay
                    </button>
                    <button 
                      onClick={() => bookingPaymentStripe(booking._id)} 
                      className="flex items-center justify-center gap-2 text-sm text-stone-500 text-center sm:min-w-48 py-2 px-3 border hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      <img src={assets.stripe_logo} alt="Stripe" className="h-4 w-auto"/>
                      Payer avec Stripe
                    </button>
                    <button 
                      onClick={() => bookingPaymentPayzone(booking._id)} 
                      className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300'
                    >
                      Payer avec Payzone
                    </button>
                  </div>
                )}
                
                {/* Cancel button */}
                {isUpcoming(booking.date, booking.startTime) && !booking.cancelled && !booking.isCompleted && (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300'
                  >
                    Annuler la réservation
                  </button>
                )}
                
                {/* Status indicators */}
                {booking.cancelled && !booking.isCompleted && (
                  <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                    Réservation annulée
                  </button>
                )}
                {booking.isCompleted && (
                  <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>
                    Terminé
                  </button>
                )}
                
                {booking.amount === 0 && !booking.cancelled && !booking.isCompleted && (
                  <button className='sm:min-w-48 py-2 border rounded text-stone-500 bg-green-50'>
                    Gratuit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCalendarBookings;