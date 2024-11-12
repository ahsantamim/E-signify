'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { IoMdArrowDropdown } from 'react-icons/io';
import { GrCircleQuestion } from 'react-icons/gr';
import { TbMessages } from 'react-icons/tb';
import { VscWorkspaceTrusted } from 'react-icons/vsc';
import Footer from '../Footer';
import DocumentAlias from './DocumentAlias';

const Home = () => {
  return (
    <div>
      <div className="w-full h-16 bg-[var(--button-color)] flex justify-center items-center">
        <p className=" text-white">
          Save time by sending documents for signature in minutes.
          <Link
            href="/dashboard/create-template"
            className="text-decoration-line: underline ml-2"
          >
            Start an Envelope
          </Link>{' '}
        </p>
      </div>
      <div className="w-full relative h-[800px] lg:h-[300px] ">
        <Image
          src="/background.png"
          layout="fill"
          objectFit="cover"
          quality={100}
          alt="background"
        />
        <div
          className="absolute inset-0 flex flex-col justify-center px-4 text-white gap-20
                lg:flex-row lg:items-center"
        >
          <div className="c-1 flex flex-col gap-4 ">
            <div className="text-lg">Welcome back</div>
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 bg-gray-400 text-white rounded-full"></div>
              <div className="sign">random user signature</div>
            </div>
          </div>
          <div className="c-2 flex flex-col gap-10">
            <div className="text-lg">Last 6 months</div>
            <div className="flex gap-10 flex-col lg:flex-row">
              <div className="item-1 flex gap-3 items-center justify-between lg:flex-col lg:items-start">
                <div className="flex order-1 gap-4 items-center lg:order-none">
                  <div className="text-2xl lg:text-5xl ">0</div>
                  <div className="inline order-2 lg:hidden">
                    <MdOutlineKeyboardArrowRight size={50} />
                  </div>
                </div>
                <div className="texts text-lg order-none lg:order-none">
                  Action Required
                </div>
              </div>
              <hr className="border-t border-white w-full lg:hidden" />
              <div className="item-2 flex gap-3 items-center justify-between lg:flex-col lg:items-start">
                <div className="flex order-1 gap-4 items-center lg:order-none">
                  <div className="text-2xl lg:text-5xl ">1</div>
                  <div className="inline order-2 lg:hidden">
                    <MdOutlineKeyboardArrowRight size={50} />
                  </div>
                </div>
                <div className="texts text-lg order-none lg:order-none">
                  Waiting for Others
                </div>
              </div>
              <hr className="border-t border-white w-full lg:hidden" />
              <div className="item-3 flex gap-3 items-center justify-between lg:flex-col lg:items-start">
                <div className="flex order-1 gap-4 items-center lg:order-none">
                  <div className="text-2xl lg:text-5xl ">0</div>
                  <div className="inline order-2 lg:hidden">
                    <MdOutlineKeyboardArrowRight size={50} />
                  </div>
                </div>
                <div className="texts text-lg order-none lg:order-none">
                  Expiring Soon
                </div>
              </div>
              <hr className="border-t border-white w-full lg:hidden" />
              <div className="item-1 flex gap-3 items-center justify-between lg:flex-col lg:items-start">
                <div className="flex order-1 gap-4 items-center lg:order-none">
                  <div className="text-2xl lg:text-5xl ">2</div>
                  <div className="inline order-2 lg:hidden">
                    <MdOutlineKeyboardArrowRight size={50} />
                  </div>
                </div>
                <div className="texts text-lg order-none lg:order-none">
                  Completed
                </div>
              </div>
              <hr className="border-t border-white w-full lg:hidden" />
            </div>
          </div>
        </div>
      </div>
      <DocumentAlias
        docu_title={'Get a document signed'}
        docu_text={
          "Not ready to start from a blank envelope? Try using one of E-Signify's"
        }
        docu_img={'/paper.png'}
        btn_show={'visible'}
        docu_link={'Starter Templates'}
        btn_text={'Get Signatures'}
      />
      <div className="more-section h-[600px] flex justify-center items-center lg:h-auto">
        <div className="w-3/4 flex flex-col gap-6">
          <div className="text-2xl">Want to do more?</div>
          <hr className="border-t border-gray-400 w-full" />
          <div className="flex flex-col w-full gap-20  lg:flex-row">
            <div className="container-1 flex w-full border border-gray-200 rounded-lg lg:w-2/5">
              <div className="w-1/4 bg-custom-red rounded-l-lg p-4 flex justify-center items-center">
                <Image
                  src="/up-arrow.png"
                  width={75}
                  height={50}
                  alt="up-arrow"
                />
              </div>
              <div className="w-3/4 p-4 space-y-2 flex flex-col">
                <p className="text-xl ">Ready to save more time?</p>
                <p>
                  From easier tracking to reusable templates, there's a plan for
                  your business.
                  <Link href="#" className="text-blue-600">
                    View Plans
                  </Link>
                </p>
              </div>
            </div>
            <div className="container-2 flex w-full border border-gray-200 rounded-lg lg:w-2/5">
              <div className="w-1/4 bg-custom-yellow rounded-l-lg p-4 flex justify-center items-center">
                <Image
                  src="/headphone.png"
                  width={75}
                  height={50}
                  alt="up-arrow"
                />
              </div>
              <div className="w-3/4 p-4 space-y-2 flex flex-col">
                <p className="text-xl">Need help getting started?</p>
                <p>
                  Get help with basic questions.
                  <br />
                  <Link href="#" className="text-blue-600">
                    View Our Guide
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="participate-section h-auto bg-gray-300 text-slate-700 py-10 mt-10 flex justify-center items-center">
        <div className="w-3/4 flex flex-col justify-between items-center gap-10 lg:flex-row lg:gap-0 lg:justify-between lg:items-start">
          <div className="section-1 flex flex-col gap-6">
            <p>
              Want to participate in E-Signify research studies such as surveys,
              interviews, <br /> and testing of new product ideas and features?
            </p>
            <Link href="#" className="text-blue-600">
              Join our Product Experience Research Panel
            </Link>
          </div>
          <div className="section-2 flex flex-col w-full justify-start gap-2 lg:w-fit">
            <div className="flex gap-2 ">
              <div className="">
                <GrCircleQuestion size={20} />
              </div>
              <div className="w-full">Support Home</div>
            </div>
            <div className="flex gap-3 items-center justify-between">
              <div className="">
                <TbMessages size={20} />
              </div>
              <div className="w-full">Community</div>
            </div>
            <div className="flex gap-3 items-center justify-between">
              <div className="">
                <VscWorkspaceTrusted size={20} />
              </div>
              <div className="w-full">Trust Center</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
