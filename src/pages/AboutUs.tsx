
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">About Snap My Car</h1>
          
          <div className="mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/3">
                    <div className="bg-slate-100 rounded-lg p-6">
                      <img 
                        src="https://i.ibb.co/FqhBrfc1/Whats-App-Image-2025-04-24-at-16-33-19.jpg" 
                        alt="Snap My Car" 
                        className="w-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
                    <p className="text-gray-700 mb-4">
                      Founded in 2023, Snap My Car started with a simple mission: to transform the way people buy and sell cars in Australia.
                      We recognized the challenges and frustrations that people faced in the traditional car marketplace and
                      set out to create a more transparent, efficient, and user-friendly experience.
                    </p>
                    <p className="text-gray-700">
                      Today, we're proud to be one of the fastest-growing automotive marketplaces, connecting thousands of buyers and sellers
                      across the country. Our innovative features like SnapAI and instant car valuation have revolutionized the industry,
                      making car transactions faster, safer, and more enjoyable for everyone involved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="mission" className="w-full mb-12">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mission">Our Mission</TabsTrigger>
              <TabsTrigger value="values">Our Values</TabsTrigger>
              <TabsTrigger value="team">Our Team</TabsTrigger>
            </TabsList>
            <TabsContent value="mission" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
                  <p className="text-gray-700 mb-4">
                    At Snap My Car, our mission is to provide the most convenient and trustworthy platform for 
                    Australians to buy and sell vehicles. We aim to simplify the process of car ownership from start to finish,
                    making it accessible for everyone regardless of their automotive knowledge.
                  </p>
                  <p className="text-gray-700">
                    We believe that buying or selling a car should be as easy as taking a photo, and we're constantly
                    innovating to make that vision a reality. By combining cutting-edge technology with personalized service,
                    we're building the future of automotive commerce.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="values" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Our Values</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="text-lg font-medium mb-2">Transparency</h4>
                      <p className="text-gray-700">We believe in honest, clear communication with our customers and within our team.</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="text-lg font-medium mb-2">Innovation</h4>
                      <p className="text-gray-700">We're constantly seeking new ways to improve the car buying and selling experience.</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="text-lg font-medium mb-2">Customer-first</h4>
                      <p className="text-gray-700">Every decision we make is guided by what's best for our users.</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="text-lg font-medium mb-2">Reliability</h4>
                      <p className="text-gray-700">We strive to be a trusted partner in every automotive transaction.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="team" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-4">Leadership Team</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="bg-slate-100 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-400">AL</span>
                      </div>
                      <h4 className="text-lg font-medium">Alex Lee</h4>
                      <p className="text-gray-600">Chief Executive Officer</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-slate-100 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-400">SP</span>
                      </div>
                      <h4 className="text-lg font-medium">Sarah Parker</h4>
                      <p className="text-gray-600">Chief Technology Officer</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-slate-100 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-400">MJ</span>
                      </div>
                      <h4 className="text-lg font-medium">Michael Johnson</h4>
                      <p className="text-gray-600">Chief Operations Officer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
