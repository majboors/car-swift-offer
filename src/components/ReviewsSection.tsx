
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

interface Review {
  image: string;
  title: string;
  author: string;
  date: string;
  score: number;
  scoreOutOf: number;
}

const reviews: Review[] = [
  {
    image: "/lovable-uploads/81f60840-ae50-493d-83c5-1fd76ee68afa.png",
    title: "Chevrolet Silverado 2025 Tow Test",
    author: "Philip Lord",
    date: "Apr 24th",
    score: 79,
    scoreOutOf: 100
  },
  {
    image: "/lovable-uploads/017bcd51-4a8d-41cf-b0c7-c4ac29688026.png",
    title: "Toyota Yaris Cross Urban 2025 Review",
    author: "Bruce Newton",
    date: "Apr 22nd",
    score: 68,
    scoreOutOf: 100
  },
  {
    image: "/lovable-uploads/dbfca8c9-20cf-495f-a562-6daf731aa402.png",
    title: "BMW X3 20 xDrive 2025 Review",
    author: "Trent Giunco",
    date: "Apr 20th",
    score: 81,
    scoreOutOf: 100
  }
];

const ReviewsSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 mb-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <Star className="w-6 h-6 text-[#007ac8]" />
          </div>
          <h2 className="text-2xl font-semibold">Expert car reviews</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full border-gray-300">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full border-gray-300">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Carousel className="mb-8">
        <CarouselContent>
          {reviews.map((review) => (
            <CarouselItem key={review.title} className="md:basis-1/2 lg:basis-1/3">
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="relative">
                  <div className="absolute top-4 left-4 bg-gray-800 text-white px-2 py-1 text-xs rounded">
                    REVIEW
                  </div>
                  <img 
                    src={review.image} 
                    alt={review.title} 
                    className="w-full h-60 object-cover" 
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">{review.score}</span>
                    <span className="text-gray-500">/{review.scoreOutOf}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {review.date} · {review.author}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="text-center">
        <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-[#007ac8] hover:text-white">
          Show all car reviews
        </Button>
      </div>
    </section>
  );
};

export default ReviewsSection;
