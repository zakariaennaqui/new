import React, { useContext, useEffect } from 'react';
import { ServiceContext } from '../../context/ServiceContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const ServiceAppointments = () => {
  const { sToken, appointments, getAppointments, completeAppointment, cancelAppointment } = useContext(ServiceContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (sToken) {
      getAppointments();
    }
  }, [sToken, getAppointments]);

  const rows = [...(appointments || [])].reverse(); // ne pas muter l’original

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>all appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-auto overflow-x-auto'>

        {/* Header */}
        <div className='hidden sm:grid
                        grid-cols-[0.4fr_1.8fr_1.2fr_0.9fr_0.7fr_1.8fr_0.9fr_1.1fr]
                        gap-1 py-3 px-6 border-b font-medium text-black'>
          <p>#</p>
          <p>client</p>
          <p title='send msg' className="flex items-center gap-1"><img src={assets.chats_icon} alt="" className="w-3 h-3 cursor-pointer" />phone</p>
          {/* <p>phone<img src={assets.chats_icon} alt="" className="w-3 h-3 cursor-pointer inline align-middle ml-1"/></p> */}
          <p>payment</p>
          <p>age</p>
          <p>date &amp; time</p>
          <p>fees</p>
          <p>actions</p>
        </div>

        {rows.map((item, index) => {
          const phone = item?.userData?.phone || '—';
          const ageValue = calculateAge && item?.userData?.dob ? calculateAge(item.userData.dob) : null;
          const age = (ageValue !== null && !isNaN(ageValue)) ? ageValue : '—';
          const imgSrc = item?.userData?.image || assets.default_user; // à définir
          const name = item?.userData?.name || 'Unknown';

          return (
            <div
              key={item._id || index}
              className='sm:grid
                         grid-cols-[0.4fr_1.8fr_1.2fr_0.9fr_0.7fr_1.8fr_0.9fr_1.1fr]
                         gap-1 items-center text-gray-500 py-3 px-6 border-b
                         hover:bg-gray-50
                         flex flex-wrap sm:flex-none'
            >
              {/* # */}
              <p className='hidden sm:block'>{index + 1}</p>

              {/* client */}
              <div className='flex items-center gap-2 min-w-[120px]'>
                <img className='w-8 h-8 rounded-full object-cover' src={imgSrc} alt="" />
                <p>{name}</p>
              </div>

              {/* phone */}
              <p className='min-w-[100px] underline text-primary' title='send msg' onClick={() => {window.location.href=`https://wa.me/${phone}`}}>{phone}</p>

              {/* payment */}
              <div>
                <p className='text-xs inline border border-primary px-2 rounded-full'>
                  {item.payment ? 'Online' : 'CASH'}
                </p>
              </div>

              {/* age */}
              <p className='hidden sm:block'>
                {item.isCalendarBooking && (!item.userData?.dob || item.userData.dob === 'Not Selected') 
                  ? '—' 
                  : age
                }
              </p>

              {/* date & time */}
              <p className='min-w-[160px]'>
                {item.isCalendarBooking 
                  ? `${item.slotDate.replace(/_/g, '-')}, ${item.slotTime}`
                  : `${slotDateFormat(item.slotDate)}, ${item.slotTime}`
                }
              </p>

              {/* fees */}
              <p>{currency}{item.amount}</p>

              {/* actions / statut */}
              {item.cancelled ? (
                <p className='text-red-400 text-xs font-medium'>Cancelled</p>
              ) : item.isCompleted ? (
                <p className='text-green-500 text-xs font-medium'>Completed</p>
              ) : (
                <div className='flex gap-1'>
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className='w-10 cursor-pointer'
                    src={assets.cancel_icon}
                    alt="cancel"
                  />
                  <img
                    onClick={() => completeAppointment(item._id)}
                    className='w-10 cursor-pointer'
                    src={assets.tick_icon}
                    alt="complete"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceAppointments;