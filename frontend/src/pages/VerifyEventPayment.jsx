import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyEventPayment = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const eventId = searchParams.get('eventId');
  const promoCode = searchParams.get('promoCode');
  const provider = searchParams.get('provider');

  const { token, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const verifyStripePayment = async () => {
    try {
      if (!token || !eventId) return;

      const { data } = await axios.post(
        `${backendUrl}/api/event/verify-stripe`,
        { success, eventId, promoCode },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate('/my-events');
      } else {
        toast.error(data.message);
        navigate('/events');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      navigate('/events');
    }
  };

  const verifyPayzonePayment = async () => {
    try {
      if (!token || !eventId) return;

      const { data } = await axios.post(
        `${backendUrl}/api/event/verify-payzone`,
        { eventId, promoCode },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate('/my-events');
      } else {
        toast.error(data.message);
        navigate('/events');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      navigate('/events');
    }
  };

  useEffect(() => {
    if (provider === 'payzone' && success === 'true') {
      verifyPayzonePayment();
    } else if (!provider) {
      // Default to Stripe verification
      verifyStripePayment();
    }
  }, [token]);

  return (
    <div className='flex justify-center items-center h-[50vh]'>
      <p className='text-lg text-gray-600'>Traitement du paiement...</p>
    </div>
  );
};

export default VerifyEventPayment;