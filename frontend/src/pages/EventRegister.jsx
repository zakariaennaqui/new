import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const EventRegister = () => {
  const { eventId } = useParams();
  const { backendUrl, token, userData } = useContext(AppContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [registering, setRegistering] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const navigate = useNavigate();

  const getEventDetails = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/event/all');
      if (data.success) {
        const foundEvent = data.events.find(e => e._id === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
          setFinalPrice(foundEvent.price || 0);
        } else {
          toast.error('Événement non trouvé');
          navigate('/events');
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim() || event.isFree) return;

    setValidatingPromo(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/promo/validate', {
        code: promoCode,
        serviceId: event.serviceId
      });

      if (data.success) {
        setPromoDiscount(data.promoCode);
        let discountedPrice = event.price;
        
        if (data.promoCode.discountType === 'fixed') {
          discountedPrice = Math.max(0, event.price - data.promoCode.discountValue);
        } else {
          discountedPrice = event.price * (1 - data.promoCode.discountValue / 100);
        }
        
        setFinalPrice(discountedPrice);
        toast.success(`Code promo appliqué! Réduction: ${
          data.promoCode.discountType === 'fixed' 
            ? `$${data.promoCode.discountValue}` 
            : `${data.promoCode.discountValue}%`
        }`);
      } else {
        toast.error(data.message);
        setPromoDiscount(null);
        setFinalPrice(event.price);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setPromoDiscount(null);
      setFinalPrice(event.price);
    } finally {
      setValidatingPromo(false);
    }
  };

  const clearPromoCode = () => {
    setPromoCode('');
    setPromoDiscount(null);
    setFinalPrice(event.price);
  };

  // Free event registration
  const registerForFreeEvent = async () => {
    setRegistering(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/event/register', {
        eventId,
        promoCode: null
      }, {
        headers: { token }
      });

      if (data.success) {
        toast.success(data.message);
        navigate('/my-events');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setRegistering(false);
    }
  };

  // Payment methods for paid events
  const payWithStripe = async () => {
    setRegistering(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/event/payment-stripe', {
        eventId,
        promoCode: promoDiscount ? promoCode : null
      }, {
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
    } finally {
      setRegistering(false);
    }
  };

  const payWithRazorpay = async () => {
    setRegistering(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/event/payment-razorpay', {
        eventId,
        promoCode: promoDiscount ? promoCode : null
      }, {
        headers: { token }
      });

      if (data.success) {
        initRazorpayPayment(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setRegistering(false);
    }
  };

  const initRazorpayPayment = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Event Registration',
      description: `Registration for ${event.title}`,
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + '/api/event/verify-razorpay', {
            ...response,
            eventId,
            promoCode: promoDiscount ? promoCode : null
          }, {
            headers: { token }
          });

          if (data.success) {
            toast.success('Paiement réussi! Inscription confirmée.');
            navigate('/my-events');
          } else {
            toast.error(data.message);
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

  const payWithPayzone = async () => {
    setRegistering(true);
    try {
      const { data } = await axios.post(backendUrl + '/api/event/payment-payzone', {
        eventId,
        promoCode: promoDiscount ? promoCode : null
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
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRegistrationOpen = () => {
    if (!event) return false;
    return new Date() <= new Date(event.registrationDeadline) && 
           event.participants.length < event.maxParticipants;
  };

  useEffect(() => {
    getEventDetails();
  }, [eventId]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-lg text-gray-600'>Chargement...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500 text-lg'>Événement non trouvé</p>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto py-8'>
      <div className='bg-white border rounded-lg shadow-sm p-6'>
        <div className='flex items-center mb-6'>
          <img 
            src={event.serviceData.image} 
            alt={event.serviceData.name}
            className='w-16 h-16 rounded-full mr-4'
          />
          <div>
            <h2 className='text-xl font-semibold text-gray-800'>{event.serviceData.name}</h2>
            <p className='text-gray-600'>{event.serviceData.speciality}</p>
          </div>
        </div>

        <h1 className='text-2xl font-bold text-gray-800 mb-4'>{event.title}</h1>
        <p className='text-gray-600 mb-6'>{event.description}</p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='space-y-3'>
            <div>
              <span className='font-medium text-gray-700'>Lieu:</span>
              <p className='text-gray-600'>{event.location}</p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Date de début:</span>
              <p className='text-gray-600'>{formatDate(event.startDate)}</p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Date de fin:</span>
              <p className='text-gray-600'>{formatDate(event.endDate)}</p>
            </div>
          </div>
          <div className='space-y-3'>
            <div>
              <span className='font-medium text-gray-700'>Places disponibles:</span>
              <p className='text-gray-600'>{event.maxParticipants - event.participants.length} / {event.maxParticipants}</p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Limite d'inscription:</span>
              <p className='text-gray-600'>{formatDate(event.registrationDeadline)}</p>
            </div>
            <div>
              <span className='font-medium text-gray-700'>Prix:</span>
              <p className={`font-semibold ${event.isFree ? 'text-green-600' : 'text-blue-600'}`}>
                {event.isFree ? 'Gratuit' : `$${event.price}`}
              </p>
            </div>
          </div>
        </div>

        {!event.isFree && (
          <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
            <h3 className='font-medium text-gray-700 mb-3'>Code Promo (optionnel)</h3>
            <div className='flex space-x-2'>
              <input
                type='text'
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder='Entrez votre code promo'
                className='flex-1 border rounded px-3 py-2'
                disabled={validatingPromo}
              />
              <button
                onClick={validatePromoCode}
                disabled={validatingPromo || !promoCode.trim()}
                className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50'
              >
                {validatingPromo ? 'Validation...' : 'Appliquer'}
              </button>
              {promoDiscount && (
                <button
                  onClick={clearPromoCode}
                  className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
                >
                  Supprimer
                </button>
              )}
            </div>
            {promoDiscount && (
              <div className='mt-2 p-2 bg-green-100 text-green-800 rounded text-sm'>
                ✅ Code promo appliqué: {promoDiscount.discountType === 'fixed' 
                  ? `$${promoDiscount.discountValue} de réduction` 
                  : `${promoDiscount.discountValue}% de réduction`
                }
              </div>
            )}
          </div>
        )}

        {!event.isFree && (
          <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
            <div className='flex justify-between items-center'>
              <span className='font-medium text-gray-700'>Prix original:</span>
              <span className={promoDiscount ? 'line-through text-gray-500' : 'font-semibold'}>${event.price}</span>
            </div>
            {promoDiscount && (
              <div className='flex justify-between items-center mt-2'>
                <span className='font-medium text-gray-700'>Prix final:</span>
                <span className='font-semibold text-green-600'>${finalPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <div className='flex justify-between items-center'>
          <button
            onClick={() => navigate('/events')}
            className='text-gray-600 hover:text-gray-800'
          >
            ← Retour aux événements
          </button>
          
          {isRegistrationOpen() ? (
            <div className='flex flex-col space-y-2'>
              {event.isFree ? (
                <button
                  onClick={registerForFreeEvent}
                  disabled={registering}
                  className='bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50'
                >
                  {registering ? 'Inscription...' : 'S\'inscrire gratuitement'}
                </button>
              ) : (
                <div className='flex flex-col space-y-2'>
                  <p className='text-sm text-gray-600 text-center mb-2'>Choisissez votre méthode de paiement:</p>
                  <button
                    onClick={payWithStripe}
                    disabled={registering}
                    className='bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:opacity-50'
                  >
                    {registering ? 'Traitement...' : 'Payer avec Stripe'}
                  </button>
                  <button
                    onClick={payWithRazorpay}
                    disabled={registering}
                    className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50'
                  >
                    {registering ? 'Traitement...' : 'Payer avec Razorpay'}
                  </button>
                  <button
                    onClick={payWithPayzone}
                    disabled={registering}
                    className='bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50'
                  >
                    {registering ? 'Traitement...' : 'Payer avec Payzone'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              disabled
              className='bg-gray-300 text-gray-500 px-6 py-2 rounded cursor-not-allowed'
            >
              {event.participants.length >= event.maxParticipants ? 'Événement complet' : 'Inscriptions fermées'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegister;