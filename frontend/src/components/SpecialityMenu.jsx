import React, { useEffect, useRef } from 'react';
import { specialityData } from '../assets/assets';
import { Link } from 'react-router-dom';

const SpecialityMenu = () => {
  const scrollRef = useRef(null);

  // Optional: Auto-scroll
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;

    const scroll = () => {
      scrollAmount += 1;
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0; // Reset scroll
        scrollAmount = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 20);

    return () => clearInterval(interval);
  }, []);

  // Duplicate the data for seamless looping
  const loopedData = [...specialityData, ...specialityData];

  return (
    <div className='flex flex-col items-center gap-4 py-16 text-gray-800' id='speciality'>
      <h1 className='text-3xl font-medium'>find by speciality</h1>
      <p className='sm:w-1/3 text-center text-sm'>
        Simply browse through our extensive list of trusted services, schedule your appointment hassle-free
      </p>

      <div
        ref={scrollRef}
        className='flex sm:justify-start gap-4 py-5 w-full overflow-x-scroll no-scrollbar whitespace-nowrap scroll-smooth'
      >
        {loopedData.map((item, index) => (
          <Link
            onClick={() => scrollTo(0, 0)}
            className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500 w-24'
            key={index}
            to={`/services/${item.speciality}`}
          >
            <img className='w-16 sm:w-24 mb-2' src={item.image} alt="" />
            <p>{item.speciality}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
