
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "1",
    title: "Get a free Instant Offer™ in minutes",
    description: "Enter your car details to get an obligation-free Instant Offer™. Accept the offer within 7 days.",
    image: "public/lovable-uploads/f2a3f8b6-d55c-45e4-af81-f6ffecf13dcc.png"
  },
  {
    number: "2",
    title: "Schedule an inspection with the official local dealer",
    description: "Your official local dealer will contact you to schedule an inspection at the dealership or at home",
    image: "public/lovable-uploads/001a79b1-6139-4ce7-8712-fe6057917e38.png"
  },
  {
    number: "3",
    title: "Finalise the details and get paid the next business day",
    description: "Hand over the keys and receive payment to your chosen account.",
    image: "public/lovable-uploads/c979fcb3-80ac-42f9-b3f1-634ef9e382e9.png"
  }
];

const InstantOfferSteps = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">How Instant Offer™ works</h2>
        
        {steps.map((step, index) => (
          <div key={step.number} className="mb-16 last:mb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className="flex items-start gap-4">
                  <span className="text-4xl font-bold text-[#007ac8]">{step.number}.</span>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-gray-600 mb-6">{step.description}</p>
                    <Button className="bg-[#007ac8] hover:bg-[#0069b4]">
                      Get a free Instant Offer
                    </Button>
                  </div>
                </div>
              </div>
              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <img
                  src={step.image}
                  alt={step.title}
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InstantOfferSteps;
