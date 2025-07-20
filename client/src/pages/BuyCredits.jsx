import React, {useContext} from 'react';
import { plans, assets } from '../assets/assets';
import {AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'

const BuyCredits = () => {

  const {user} = useContext(AppContext)


  return (
    <motion.div 
    initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    className='flex flex-col items-center gap-6 py-10 px-4'>
      <button className='px-4 py-2 border border-zinc-300 cursor-pointer rounded-full text-sm font-medium hover:bg-gray-100 transition'>
        OUR PLANS
      </button>
      <h1 className='font-semibold text-3xl'>Choose the plan</h1>

      <div className='flex flex-wrap justify-center gap-6 text-left mt-8'>
        {plans.map((item, index) => (
          <div
            key={index}
            className='bg-white shadow-md rounded-lg p-6 w-72 text-center hover:scale-105 transition-all duration-500'
          >
            <img width={40}
              src={assets.logo_icon}
              alt='Plan logo'
               
            />
            <p className='text-lg font-semibold mb-2'>{item.id}</p>
            <p className='text-sm text-gray-500'>{item.desc}</p>
            <p className='mt-6'>
              <span className='text-3xl font-medium'>${item.price}
              </span>/{item.credits} Credits</p>
              <button className='w-full bg-gray-800 text-white mt-8 
              text-sm rounded-md py-2.5 min-w-52'>{user ? 'Purchase' : 'Get Started'}</button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default BuyCredits;
