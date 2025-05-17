
import React from 'react';
import TrustedBanner from '@/components/TrustedBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';

const AboutUs = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TrustedBanner />
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Snap My Car</h1>
            
            <div className="flex justify-center mb-10">
              <img
                src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg"
                alt="Snap My Car Logo"
                className="h-24 w-auto object-contain"
              />
            </div>

            <div className="prose max-w-none text-gray-700 space-y-6">
              <p className="text-lg">
                Snap My Car is Australia's leading automotive marketplace, connecting buyers and sellers 
                nationwide. With our innovative AI-powered technology, we're transforming the way people 
                buy and sell cars across the country.
              </p>
              
              <Separator className="my-8" />
              
              <h2 className="text-2xl font-semibold text-gray-800 mt-8">Our Mission</h2>
              <p>
                Our mission is to make car buying and selling as simple, transparent, and efficient as possible. 
                We leverage cutting-edge technology to create a seamless experience for all our users, 
                whether they're looking to find their dream car or sell their current vehicle.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 mt-8">Our Vision</h2>
              <p>
                We envision a future where anyone can buy or sell a car with just a few clicks, 
                powered by our innovative SnapAI technology that can identify and value any vehicle from just a photo.
              </p>
              
              <Separator className="my-8" />
              
              <h2 className="text-2xl font-semibold text-gray-800">Our Values</h2>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-medium text-xl text-blue-700 mb-2">Innovation</h3>
                  <p>We constantly push technological boundaries to improve our service.</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-medium text-xl text-green-700 mb-2">Transparency</h3>
                  <p>We believe in honest, clear communication with our customers.</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-6">
                  <h3 className="font-medium text-xl text-amber-700 mb-2">Customer Focus</h3>
                  <p>Every feature and improvement is designed with our users in mind.</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="font-medium text-xl text-purple-700 mb-2">Reliability</h3>
                  <p>We deliver consistent, dependable service that users can trust.</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-800 mt-8">Our History</h2>
              <p>
                Founded in 2023, Snap My Car has quickly grown to become one of Australia's most 
                innovative automotive platforms. Our team of industry experts and technology specialists 
                has worked tirelessly to create a user-friendly platform that addresses the pain points 
                traditional car selling and buying methods present.
              </p>
              <p>
                In 2024, we launched our groundbreaking SnapAI feature, allowing users to identify and 
                value their vehicles instantly with just a photo, revolutionizing the car selling process.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
