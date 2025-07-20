import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion'

const Results = () => {
  const [image, setImage] = useState(assets.sample_img_1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const onSubmitHandler = async(e) => {

  }

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <motion.form 
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={onSubmitHandler}
      className='flex flex-col min-h-[90vh] justify-center items-center px-4'
    >
      
      {/* Image with animated loading bar */}
      <div className='relative mb-6'>
        <img
          src={image}
          alt='Generated'
          className='max-w-sm rounded shadow-md'
          onLoad={handleImageLoad}
        />
        {!isImageLoaded && (
          <span className='absolute bottom-0 left-0 h-1 bg-blue-500 w-full transition-all duration-[10s]' />
        )}
      </div>

      {/* Loading Text */}
      <p className={!loading ? 'hidden': "text-gray-500 mb-4 text-sm"}>Loading...</p>

      {/* Input + Button when image is NOT loaded */}
      {!isImageLoaded && (
        <div className='flex w-full max-w-xl bg-neutral-500 text-white text-sm p-1 mt-6 rounded-full'>
          <input
            onChange={(e) => setInput(e.target.value)} value={input}
            type='text'
            placeholder='Describe what you want to generate'
            className='flex-1 bg-transparent outline-none px-4 py-2 placeholder-white text-white text-sm'
          />
          <button
            type='submit'
            className='bg-zinc-900 px-6 sm:px-10 py-2 sm:py-3 rounded-full hover:bg-zinc-800 transition-all'
          >
            Generate
          </button>
        </div>
      )}

      {/* After image is loaded */}
      {isImageLoaded && (
        <div className='flex gap-3 flex-wrap justify-center text-white mt-10 text-sm'>
          <p
            className='border border-zinc-900 text-black px-8 py-3 rounded-full cursor-pointer bg-transparent hover:bg-zinc-100 transition'
            onClick={() => {
              // Simulate new generation
              setIsImageLoaded(false);
              setImage(assets.sample_img_1); // Replace with generated image in real app
            }}
          >
            Generate Another
          </p>
          <a
            href={image}
            download
            className='bg-zinc-900 px-10 py-3 rounded-full cursor-pointer hover:bg-zinc-800 transition'
          >
            Download
          </a>
        </div>
      )}
    </motion.form>
  );
};

export default Results;
