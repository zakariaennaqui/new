import appointment_img from './appointment_img.png'
import header_img from './header_img.jpg'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.webp'
import about_image from './about_image.jpg'

import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import upload_area from './upload_area.png'

import stripe_logo from './stripe_logo.png'
import razorpay_logo from './razorpay_logo.png'
import payzone_rebrand from './payzone-rebrand.png'
import logo from './logo.svg'
import logo_meet from './logo_meet.svg'

import doc1 from './doc1.png'
import doc2 from './doc2.png'
import doc15 from './doc15.png'

import teacher from './teacher.svg'
import doctor from './doctor.svg'
import electrician from './electrician.svg'
import lawyer from './lawyer.svg'
import barber from './barber.svg'
import coach from './coach.svg'
import chef from './chef.svg'
import babysitter from './babysitter.svg'
import delivery from './delivery.svg'
import pet_groomer from './pet_groomer.svg'
import photographer from './photographer.svg'
import plumber from './plumber.svg'
import translator from './translator.svg'
import travel_agent from './travel_agent.svg'

export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    logo,
    logo_meet,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    upload_area,
    stripe_logo,
    payzone_rebrand,
    razorpay_logo
}

export const specialityData = [
    {
        speciality: 'teacher',
        image: teacher
    },
    {
        speciality: 'doctor',
        image: doctor
    },
    {
        speciality: 'electrician',
        image: electrician
    },
    {
        speciality: 'lawyer',
        image: lawyer
    },
    {
        speciality: 'barber',
        image: barber
    },
    {
        speciality: 'coach',
        image: coach
    },
    {
        speciality: 'chef',
        image: chef
    },
    {
        speciality: 'babysitter',
        image: babysitter
    },
    {
        speciality: 'delivery',
        image: delivery
    },
    {
        speciality: 'pet_groomer',
        image: pet_groomer
    },
    {
        speciality: 'photographer',
        image: photographer
    },
    {
        speciality: 'plumber',
        image: plumber
    },
    {
        speciality: 'translator',
        image: translator
    },
    {
        speciality: 'travel_agent',
        image: travel_agent
    },
]

export const doctors = [
    {
        _id: 'doc1',
        name: 'Dr. Richard James',
        image: doc1,
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: {
            line1: '17th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc2',
        name: 'Dr. Emily Larson',
        image: doc2,
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        address: {
            line1: '27th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
    {
        _id: 'doc15',
        name: 'Dr. Amelia Hill',
        image: doc15,
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        address: {
            line1: '37th Cross, Richmond',
            line2: 'Circle, Ring Road, London'
        }
    },
]