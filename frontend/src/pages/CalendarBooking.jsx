import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../assets/assets';

const CalendarBooking = () => {
  const { serviceId } = useParams();
  const { backendUrl, token, services, currencySymbol } = useContext(AppContext);
  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  const getServiceInfo = () => {
    const foundService = services.find(s => s._id === serviceId);
    setService(foundService);
  };

  const getAvailableSlots = async () => {
    try {
      const startDate = selectedDate;
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 30); // Afficher 7 jours

      const { data } = await axios.get(
        `${backendUrl}/api/calendar/available-slots/${serviceId}`,
        {
          params: {
            startDate,
            endDate: endDate.toISOString().split('T')[0]
          }
        }
      );

      if (data.success) {
        setSlots(data.slots);
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

  const bookSlot = async (slotId) => {
    if (!token) {
      toast.warn('Veuillez vous connecter pour réserver');
      navigate('/login');
      return;
    }

    setBooking(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/calendar/book-slot`,
        { slotId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate('/my-calendar-bookings');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setBooking(false);
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

  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  useEffect(() => {
    if (services.length > 0) {
      getServiceInfo();
    }
  }, [services, serviceId]);

  useEffect(() => {
    if (service) {
      getAvailableSlots();
    }
  }, [service, selectedDate]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-lg text-gray-600'>Chargement des créneaux...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500 text-lg'>Service non trouvé</p>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate();

  return (
    <div className='py-8'>
      <button onClick={() => navigate('/services')} className='text-blue-500 hover:text-primary mb-4' > ← Retour aux services</button>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img src={service.image} alt={service.name} className='bg-primary w-full sm:max-w-72 rounded-lg'/>
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
            <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>{service.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
            {/* <p className='text-gray-500'>{service.email}</p> */}
            <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{service.degree} - {service.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{service.experience}</button>
            </div>

            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>about <img src={assets.info_icon} alt="" /></p>
              <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{service.about}</p>
            </div>
            <p className='text-gray-500 font-medium mt-4'>appointment fee: <span className='text-gray-600'>{currencySymbol}{service.fees}</span></p>
        </div>
      </div>

      <div className='mb-6'>
        <label className='block text-sm font-medium mb-2'>Sélectionner une date:</label>
        <input
          type='date'
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
          className='border rounded px-3 py-2'
        />
      </div>

      <div className='space-y-6'>
        {Object.keys(groupedSlots).length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>Aucun créneau disponible pour cette période</p>
            <p className='text-gray-400 mt-2'>Essayez de sélectionner une autre date</p>
          </div>
        ) : (
          Object.entries(groupedSlots).map(([date, dateSlots]) => (
            <div key={date} className='bg-white border rounded-lg p-6 shadow-sm'>
              <h3 className='text-lg font-semibold mb-4 text-gray-800'>
                {formatDate(date)}
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                {dateSlots.map(slot => (
                  <button
                    key={slot._id}
                    onClick={() => bookSlot(slot._id)}
                    disabled={booking}
                    className='p-3 border rounded-lg text-center hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <div className='font-medium text-gray-800'>
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {slot.duration} min
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarBooking;