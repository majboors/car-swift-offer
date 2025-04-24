
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Review {
  image: string;
  title: string;
  author: string;
  date: string;
  score: number;
}

const reviews: Review[] = [
  {
    image: "/lovable-uploads/81f60840-ae50-493d-83c5-1fd76ee68afa.png",
    title: "2024 Toyota RAV4 Review",
    author: "John Smith",
    date: "24 Apr 2025",
    score: 4.5
  },
  {
    image: "/lovable-uploads/017bcd51-4a8d-41cf-b0c7-c4ac29688026.png",
    title: "2024 Honda CR-V Review",
    author: "Sarah Johnson",
    date: "23 Apr 2025",
    score: 4.8
  },
  {
    image: "/lovable-uploads/dbfca8c9-20cf-495f-a562-6daf731aa402.png",
    title: "2024 Tesla Model Y Review",
    author: "Mike Wilson",
    date: "22 Apr 2025",
    score: 4.7
  }
];

const ReviewsSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12 mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-50 rounded-full">
          <Star className="w-6 h-6 text-[#007ac8]" />
        </div>
        <h2 className="text-2xl font-semibold">Expert Car Reviews</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reviews.map((review) => (
          <Card key={review.title} className="overflow-hidden">
            <div className="aspect-[16/9] relative">
              <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                {review.score}/5.0
              </div>
              <img src={review.image} alt={review.title} className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{review.title}</h3>
              <p className="text-sm text-gray-500">
                By {review.author} · {review.date}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" className="hover:bg-[#007ac8] hover:text-white">
          Show all car reviews
        </Button>
      </div>
    </section>
  );
};

export default ReviewsSection;
