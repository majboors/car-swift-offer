
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How does Instant Offer work?",
    answer: "Enter your car details to receive an instant valuation. If you're happy with the offer, accept it within 7 days and schedule an inspection with an accredited dealer."
  },
  {
    question: "Who is purchasing my car if I sell with Instant Offer?",
    answer: "Your car will be purchased by one of our accredited dealers in your local area."
  },
  {
    question: "Why should I sell my car with Instant Offer?",
    answer: "Instant Offer provides a quick, hassle-free way to sell your car with competitive pricing and no obligation to buy another vehicle."
  }
];

const InstantOfferFAQ = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently asked questions
        </h2>
        
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-8">
          <Button variant="outline" className="text-[#007ac8]">
            View all FAQs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstantOfferFAQ;
