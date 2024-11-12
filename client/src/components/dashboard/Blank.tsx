import Link from 'next/link';
import React from 'react';

export default function Blank() {
  return (
    <div className='w-full h-20 bg-gray-300 flex flex-row justify-center items-center space-x-8'>
      <h1 className='font-bold text-2xl'>Get started</h1>
      <p className='text-lg'>What's next?</p>
      <Link href="/dashboard/create-template"><button className='border border-black px-4 py-2 hover:bg-gray-200'>
        Send a Document
      </button></Link>
    </div>
  );
}
