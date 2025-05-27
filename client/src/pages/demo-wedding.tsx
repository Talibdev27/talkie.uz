import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Heart, Users, Camera, MessageSquare } from "lucide-react";
import { CountdownTimer } from "@/components/countdown-timer";
import { Link } from "wouter";

export default function DemoWedding() {
  const weddingDate = new Date('2024-08-15T15:00:00');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F1F1] to-white">
      {/* Hero Section */}
      <div 
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-playfair font-bold mb-4">
            Emily & James
          </h1>
          <p className="text-2xl md:text-3xl font-light mb-8">
            Two hearts, one love story
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>August 15, 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>Garden Paradise Venue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <CountdownTimer targetDate={weddingDate} />
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-playfair font-bold text-[#2C3338] mb-8">
            Our Love Story
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Couple"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="text-left">
              <p className="text-lg text-[#2C3338]/80 leading-relaxed mb-6">
                We met on a rainy Tuesday at our favorite coffee shop downtown. What started as a simple 
                conversation about books turned into hours of talking, and we knew something special was beginning.
              </p>
              <p className="text-lg text-[#2C3338]/80 leading-relaxed">
                Five years later, James proposed in that same coffee shop, and now we're ready to start 
                the most beautiful chapter of our lives together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wedding Details */}
      <section className="py-16 px-6 bg-[#F8F1F1]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-playfair font-bold text-[#2C3338] text-center mb-12">
            Wedding Details
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 shadow-lg">
              <CardContent className="text-center">
                <Calendar className="h-12 w-12 text-[#D4B08C] mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-[#2C3338] mb-2">Ceremony</h3>
                <p className="text-[#2C3338]/70 mb-2">August 15, 2024</p>
                <p className="text-[#2C3338]/70">3:00 PM</p>
              </CardContent>
            </Card>
            <Card className="p-6 shadow-lg">
              <CardContent className="text-center">
                <MapPin className="h-12 w-12 text-[#D4B08C] mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-[#2C3338] mb-2">Venue</h3>
                <p className="text-[#2C3338]/70 mb-2">Garden Paradise Venue</p>
                <p className="text-[#2C3338]/70">123 Love Lane, Romance City</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Photo Gallery Preview */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-playfair font-bold text-[#2C3338] text-center mb-12 flex items-center justify-center gap-3">
            <Camera className="h-8 w-8 text-[#D4B08C]" />
            Our Memories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Bride holding bouquet
              "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Couple portrait
              "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Wedding rings
              "https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Wedding ceremony
              "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Reception dancing
              "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"  // Wedding cake
            ].map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Beautiful wedding memory ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                onError={(e) => {
                  // Fallback to a different image if one fails to load
                  const fallbackImages = [
                    "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                  ];
                  e.currentTarget.src = fallbackImages[index % fallbackImages.length];
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section className="py-16 px-6 bg-[#F8F1F1]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-playfair font-bold text-[#2C3338] mb-8 flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-[#D4B08C]" />
            RSVP
          </h2>
          <p className="text-lg text-[#2C3338]/80 mb-8">
            We can't wait to celebrate with you! Please let us know if you'll be joining us on our special day.
          </p>
          <Card className="p-8 shadow-lg">
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full p-3 border border-[#D4B08C]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B08C]"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-3 border border-[#D4B08C]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B08C]"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <select className="w-full p-3 border border-[#D4B08C]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B08C]">
                  <option>Will you attend?</option>
                  <option>Yes, I'll be there!</option>
                  <option>Sorry, can't make it</option>
                  <option>Maybe</option>
                </select>
                <input
                  type="number"
                  placeholder="Number of guests"
                  className="w-full p-3 border border-[#D4B08C]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B08C]"
                />
              </div>
              <textarea
                rows={4}
                placeholder="Special dietary requirements or message for the couple..."
                className="w-full p-3 border border-[#D4B08C]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B08C]"
              ></textarea>
              <Button className="w-full bg-[#D4B08C] hover:bg-[#C09E7A] text-white py-3 text-lg">
                Send RSVP
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Guest Messages */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-playfair font-bold text-[#2C3338] text-center mb-12 flex items-center justify-center gap-3">
            <MessageSquare className="h-8 w-8 text-[#D4B08C]" />
            Messages from Friends & Family
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Sarah & Michael",
                message: "So excited to celebrate with you both! You're perfect for each other. Can't wait to see Emily in her dress! 💕",
                avatar: "S"
              },
              {
                name: "Mom & Dad Johnson",
                message: "James, you're getting the most wonderful daughter-in-law! Emily, welcome to our family with open hearts. Love you both!",
                avatar: "J"
              },
              {
                name: "The Wilsons",
                message: "Wishing you a lifetime of love, laughter, and endless adventures together. So happy for you both!",
                avatar: "W"
              },
              {
                name: "College Friends",
                message: "From study groups to wedding bells! We've watched your love story unfold and it's been beautiful. Congratulations! 🎉",
                avatar: "F"
              }
            ].map((message, index) => (
              <Card key={index} className="p-6 shadow-md">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D4B08C] text-white rounded-full flex items-center justify-center font-semibold">
                      {message.avatar}
                    </div>
                    <h4 className="font-semibold text-[#2C3338]">{message.name}</h4>
                  </div>
                  <p className="text-[#2C3338]/80 italic">"{message.message}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#2C3338] text-white text-center">
        <p className="text-lg font-light">
          With love, Emily & James
        </p>
        <p className="text-sm opacity-70 mt-2">
          August 15, 2024 • Garden Paradise Venue
        </p>
        <div className="mt-4">
          <Link href="/create-wedding">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#2C3338]">
              Create Your Own Wedding Site
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}