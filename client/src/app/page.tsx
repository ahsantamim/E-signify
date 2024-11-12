'use client';

import Navbar from '@/components/dashboard/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // Import Swiper styles
import 'swiper/css/pagination';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [videoPlaying, setVideoPlaying] = useState(false); // State to track if video is playing

  const handleGetStarted = () => {
    if (email) {
      router.push(`/auth/register?email=${encodeURIComponent(email)}`);
    } else {
      alert('Please enter your email.');
    }
  };

  // Function to start the video
  const handlePlayClick = () => {
    setVideoPlaying(true);
  };

  // Handle the slide change and update the underline scale
  const totalSlides = 6; // Number of images
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [swiperInstance, setSwiperInstance] = useState<any>(null); // Store swiper instance

  // Handle slide change
  const handleSlideChange = (swiper: any) => {
    setCurrentSlide(swiper.activeIndex);
  };

  useEffect(() => {
    // Set up the Swiper instance when it's initialized
    if (swiperInstance) {
      swiperInstance.on('slideChange', handleSlideChange);
    }

    return () => {
      // Clean up event listener when component is unmounted
      if (swiperInstance) {
        swiperInstance.off('slideChange', handleSlideChange);
      }
    };
  }, [swiperInstance]);

  return (
    <div>
      <div className="sticky top-0 z-50 bg-white shadow">
        <Navbar />
      </div>
      {/* Root background with radial gradient */}
      <div
        className="w-full h-screen relative"
        style={{
          background:
            'radial-gradient(100% 100% at 50% -20%, rgb(255, 82, 82) 0%, rgb(76, 0, 255) 100%)',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* Content of the page */}
        <div className="relative z-10">
          {/* Hero Section */}
          <header className="flex flex-col items-center justify-center py-24 text-center text-white relative z-10">
            <div className="animate-fadeIn p-8 ">
              <h1 className="text-7xl font-thin">
                Everything you need to agree
              </h1>
            </div>

            <p className="mt-4 text-lg max-w-xl">
              Simplify and manage agreements with ease.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-8 py-2 rounded-sm text-black"
              />
              <button
                onClick={handleGetStarted}
                className="px-4 py-2 bg-[var(--button-login-color)] text-white font-medium rounded-sm hover:bg-[var(--button-login-hover-color)]"
              >
                Get Started
              </button>
            </div>
          </header>

          {/* Video Section */}
          <section className="relative w-full py-12">
            {/* Video Card centered in the header background */}
            <div className="absolute top-0 left-0 w-full h-1/2" />

            <div className="relative flex justify-center z-10">
              {/* Extended Video Card (Slightly Less than Full Screen) */}
              <div className="w-8/12 max-w-screen-xl rounded-lg overflow-hidden shadow-lg bg-slate-800 hover:shadow-xl transition-shadow mx-auto">
                <div className="relative w-full h-[500px]">
                  {/* YouTube iframe */}
                  {videoPlaying ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/qaTB_u1THVs?autoplay=1"
                      title="YouTube video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full bg-black flex justify-center items-center">
                      <button
                        onClick={handlePlayClick}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 bg-opacity-70 rounded-full text-white hover:bg-opacity-100 transition-all"
                        style={{
                          fontSize: '2rem',
                        }}
                      >
                        &#9654; {/* Unicode for Play Icon */}
                      </button>
                    </div>
                  )}
                </div>
                {/* Optional Video Title and Description */}
              </div>
            </div>

            {/* Bottom half of the video section should be white */}
            <div className="w-full h-1/2 bg-white absolute bottom-0 left-0"></div>
          </section>

          {/* New Section (E-Signify content text) */}
          <section className="py-12 bg-white">
            <div className="container mx-auto flex justify-center">
              {/* E-Signify content centered and 50% width */}
              <div className="w-1/2 flex flex-col items-center text-center">
                <h2 className="text-3xl mb-4 font-thin">
                  E-Signify revolutionized e-signatures and now we're leading in{' '}
                  <span className="text-purple-600">
                    Intelligent Agreement Management (IAM)
                  </span>
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  E-Signify IAM brings agreements to life, allowing
                  organizations to leverage their agreement data effectively.
                </p>
              </div>
            </div>
          </section>

          {/* IAM Applications Section */}
          <section className="py-12 bg-gray-100">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">
                IAM Applications
              </h2>
              <div className="flex flex-wrap justify-center gap-8">
                {/* Card 1 */}
                <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                  <a href="#">
                    <img
                      className="rounded-t-lg"
                      src="/docs/images/blog/image-1.jpg"
                      alt=""
                    />
                  </a>
                  <div className="p-5">
                    <a href="#">
                      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Introducing Intelligent Agreement Management
                      </h5>
                    </a>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                      Capture the critical business value that’s hiding in your
                      agreements. Now you can make informed, data-backed
                      decisions when every agreement lives on a trusted
                      platform.
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Read more
                      <svg
                        className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                  <a href="#">
                    <img
                      className="rounded-t-lg"
                      src="/docs/images/blog/image-1.jpg"
                      alt=""
                    />
                  </a>
                  <div className="p-5">
                    <a href="#">
                      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Are you stuck in the agreement trap?
                      </h5>
                    </a>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                      When your business-critical agreement data is trapped in a
                      pile of PDFs, revenue gets lost, customers churn, and your
                      legal risks increase. There's a better way.
                    </p>
                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Read more
                      <svg
                        className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-8">
              Trusted by Organizations Worldwide
            </h2>
            <p className="max-w-2xl mx-auto">
              Trusted by millions of users for secure and efficient agreement
              management.
            </p>
          </section>

          {/*Slider/ Caresoul Section*/}
          <section className="py-12 bg-gray-100">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">
                Our Image Gallery
              </h2>

              <div className="relative">
                <Swiper
                  spaceBetween={30}
                  slidesPerView={4} // Show 4 images at once
                  loop={false} // Disable looping
                  grabCursor={true} // Enable drag cursor for better UX
                  breakpoints={{
                    640: {
                      slidesPerView: 1, // Show 1 image on small screens
                    },
                    768: {
                      slidesPerView: 2, // Show 2 images on medium screens
                    },
                    1024: {
                      slidesPerView: 4, // Show 4 images on larger screens
                    },
                  }}
                  onSwiper={setSwiperInstance} // Store swiper instance on initialization
                  onSlideChange={handleSlideChange} // Listen to slide change event
                  className="my-8"
                >
                  {/* Image Cards */}
                  {[...Array(totalSlides).keys()].map((_, index) => (
                    <SwiperSlide key={index}>
                      <div className="bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                        <img
                          className="rounded-t-lg w-full h-64 object-cover"
                          src={`/images/image-${index + 1}.PNG`} // Correct path from the public folder
                          alt={`Image ${index + 1}`}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Underline Progress */}
                <div
                  className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transition-transform duration-300 mb-5"
                  style={{
                    transform: `scaleX(${(currentSlide + 1) / totalSlides})`, // Scale based on current slide
                    transformOrigin: 'left',
                  }}
                />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-6 bg-gray-900 text-white text-center">
            <p>© 2024 Your Company. All rights reserved.</p>
            <p className="mt-2">
              <Link href="/privacy">Privacy Policy</Link> |{' '}
              <Link href="/terms">Terms of Service</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
