import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Check } from 'lucide-react';
import { showSuccessToast, showErrorToast, showSnapAISuccess } from '@/utils/toast-utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SnapAIShowcase from '@/components/SnapAIShowcase';

const SnapAI = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ make: string; model: string; year: string | number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      resetState();
    }
  };

  const handleCameraCapture = (imgSrc: string) => {
    setImage(imgSrc);
    resetState();
  };

  const simulateAIProcessing = async () => {
    setIsProcessing(true);
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate AI identifying the car
    const carDetails = {
      make: "Toyota",
      model: "Camry",
      year: 2023,
    };

    setResults(carDetails);
    showSnapAISuccess(carDetails);
    setIsProcessing(false);
  };

  const resetState = () => {
    setResults(null);
  };

  useEffect(() => {
    // Cleanup function to revoke the data URL when the component unmounts
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Add the Navbar to include the logo */}
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Snap<span className="text-primary">AI</span></h1>
            <p className="text-xl text-gray-600">
              Identify your car instantly with just a photo
            </p>
          </div>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="mx-auto w-fit">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="camera">Take Photo</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Car Image</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  {image ? (
                    <div className="relative">
                      <img
                        src={image}
                        alt="Uploaded Car"
                        className="max-h-64 rounded-md object-contain"
                      />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-500" />
                      <p className="text-gray-500">Click to upload or drag and drop an image</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    {image ? "Change Image" : "Upload Image"}
                  </Button>
                </CardContent>
                {results && (
                  <CardFooter className="justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Identified Car:</p>
                      <p className="text-lg font-semibold">
                        {results.year} {results.make} {results.model}
                      </p>
                    </div>
                    <Check className="h-6 w-6 text-green-500" />
                  </CardFooter>
                )}
                {isProcessing && (
                  <CardFooter>
                    <Progress value={50} className="w-full" />
                  </CardFooter>
                )}
                {!isProcessing && image && !results && (
                  <CardFooter>
                    <Button onClick={simulateAIProcessing}>Identify Car</Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="camera" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Take a Photo of Your Car</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <SnapAIShowcase onCapture={handleCameraCapture} />
                  </div>
                </CardContent>
                {results && (
                  <CardFooter className="justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Identified Car:</p>
                      <p className="text-lg font-semibold">
                        {results.year} {results.make} {results.model}
                      </p>
                    </div>
                    <Check className="h-6 w-6 text-green-500" />
                  </CardFooter>
                )}
                {isProcessing && (
                  <CardFooter>
                    <Progress value={50} className="w-full" />
                  </CardFooter>
                )}
                {!isProcessing && image && !results && (
                  <CardFooter>
                    <Button onClick={simulateAIProcessing}>Identify Car</Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-16">
            <SnapAIShowcase />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SnapAI;
