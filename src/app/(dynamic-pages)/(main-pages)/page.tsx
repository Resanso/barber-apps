import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { T } from '@/components/ui/Typography';
import { ArrowRight, Calendar, Clock, MapPin, Phone, Scissors, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      {/* Navbar */}
      <nav className="w-full border-b border-stone-200 bg-[#FDFBF7]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <Scissors className="h-6 w-6 text-amber-700" />
              <span>GENTLEMAN'S CUT</span>
            </div>

            <div className="hidden md:flex gap-6 items-center">
              <Link href="#services" className="text-sm font-medium hover:text-amber-700 transition-colors">Services</Link>
              <Link href="#about" className="text-sm font-medium hover:text-amber-700 transition-colors">About</Link>
              <Link href="#location" className="text-sm font-medium hover:text-amber-700 transition-colors">Location</Link>
              <Link href="/waitlist" className="text-sm font-medium hover:text-amber-700 transition-colors">Waitlist</Link>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" className="hidden sm:flex border border-amber-100" asChild>
                <Link href="/login">Member Login</Link>
              </Button>

            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/40 via-[#FDFBF7] to-[#FDFBF7]"></div>

        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Badge variant="outline" className="inline-flex items-center border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100">
                <Star className="mr-1 h-3 w-3 fill-amber-800" />
                <span>Premium Grooming Experience</span>
              </Badge>

              <T.H1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance text-stone-900">
                Classic Cuts,
                <span className="block text-amber-700 font-serif italic">
                  Modern Style.
                </span>
              </T.H1>

              <T.P className="mx-auto max-w-[700px] text-lg text-stone-600 md:text-xl">
                Experience the art of traditional barbering in a relaxing atmosphere.
                Precision haircuts, hot towel shaves, and beard trims for the modern gentleman.
              </T.P>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-stone-900 text-[#FDFBF7] hover:bg-amber-800 h-12 px-8" asChild>
                <Link href="/booking">
                  Book Appointment <Calendar className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100 h-12 px-8" asChild>
                <Link href="#services">
                  View Services <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 md:mt-24 flex justify-center">
            <div className="relative w-full max-w-5xl">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-200 to-stone-200 rounded-xl blur-lg opacity-40"></div>
              <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-[#FDFBF7] shadow-2xl">
                {/* Ganti gambar dengan nuansa barbershop */}
                <Image
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1600&auto=format&fit=crop"
                  alt="Barbershop Interior"
                  className="w-full h-[400px] md:h-[600px] object-cover"
                  width={1600}
                  height={900}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (Formerly Features) */}
      <section id="services" className="w-full py-16 md:py-24 lg:py-32 bg-stone-100/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-[850px]">
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl text-stone-900">
                Our Services
              </T.H2>
              <T.P className="text-lg text-stone-600 md:text-xl">
                Professional grooming services tailored to your style. Sit back, relax, and let us take care of the rest.
              </T.P>
            </div>

            <div className="w-full grid max-w-6xl gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 bg-[#FDFBF7] border-stone-200"
                >
                  <CardHeader className="flex-none">
                    <div className="flex justify-center mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                        {service.icon}
                      </div>
                    </div>
                    <CardTitle className="text-center text-xl font-serif text-stone-900">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center">
                    <CardDescription className="text-center text-base text-stone-600 mb-4">
                      {service.description}
                    </CardDescription>
                    <Badge variant="secondary" className="mt-auto bg-stone-200 text-stone-800 hover:bg-stone-300">
                      {service.price}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About/Philosophy Section (Formerly Developer) */}
      <section id="about" className="w-full py-16 md:py-24 lg:py-32 bg-[#FDFBF7]">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col gap-6">
              <Badge variant="outline" className="w-fit border-amber-200 text-amber-800">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                <span>Est. 2023</span>
              </Badge>
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl text-stone-900">
                More Than Just a Haircut
              </T.H2>
              <T.P className="text-lg text-stone-600">
                We believe that a haircut is not just a service, but an experience.
                Our barbershop combines the comfort of the old-school aesthetic with modern grooming techniques.
                <br /><br />
                Every cut is finished with a straight razor neck shave and our signature styling products.
              </T.P>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="flex items-center gap-2 text-stone-700">
                  <Clock className="h-5 w-5 text-amber-700" />
                  <span>Open 7 Days a Week</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <MapPin className="h-5 w-5 text-amber-700" />
                  <span>Downtown Location</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="bg-stone-900 text-[#FDFBF7] hover:bg-amber-800" asChild>
                  <Link href="/booking">Book Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-stone-300 text-stone-700" asChild>
                  <Link href="#gallery">View Gallery</Link>
                </Button>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="absolute -inset-4 -z-10 bg-amber-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative overflow-hidden rounded-xl shadow-xl sepia-[.2]">
                <Image
                  src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop"
                  alt="Barber working"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  width={1200}
                  height={800}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-stone-900 text-[#FDFBF7]">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-[800px]">
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Ready to Look Sharp?
              </T.H2>
              <T.P className="mx-auto max-w-[700px] text-lg text-stone-300 md:text-xl">
                Book your appointment today and experience the difference. Walk-ins are welcome, but appointments are recommended.
              </T.P>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-[#FDFBF7] text-stone-900 hover:bg-amber-50 border-none" asChild>
                <Link href="/booking">
                  Book Appointment <Calendar className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-stone-600 bg-transparent text-[#FDFBF7] hover:bg-stone-800 hover:text-white"
                asChild
              >
                <Link href="tel:+1234567890">
                  <Phone className="mr-2 h-4 w-4" /> Call Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Data Services (Menggantikan Features)
const services = [
  {
    title: 'Classic Haircut',
    description:
      'A precise cut tailored to your style, finished with a hot towel and neck shave.',
    price: '$35',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <circle cx="6" cy="6" r="3" />
        <path d="M8.12 8.12 12 12" />
        <path d="M20 4 8.12 15.88" />
        <circle cx="6" cy="18" r="3" />
        <path d="M14.8 14.8 20 20" />
      </svg>
    ),
  },
  {
    title: 'Beard Trim & Sculpt',
    description:
      'Professional shaping and trimming of your beard, including line-up and oil treatment.',
    price: '$25',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M15.84 5.92C16.3 6.05 16.73 6.26 17.13 6.55C19.61 8.37 20.83 12.53 19.26 15.03C17.68 17.52 12.97 20.65 9.18 20.95C6.5 21.16 3.88 18.25 3.12 15.75C2.67 14.24 3.16 11.85 4.58 10.13" />
        <path d="M5.5 13.5C10 13.5 12.5 9.5 12.5 9.5" />
        <path d="M13 14.5C13 14.5 15 16 16.5 14.5" />
      </svg>
    ),
  },
  {
    title: 'Hot Towel Shave',
    description:
      'The ultimate relaxation. Pre-shave oil, hot towels, and a straight razor finish.',
    price: '$40',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="m12 2-3 5h6l-3-5Z" />
        <path d="m8 7 4 8 4-8" />
        <path d="M4 22h16" />
        <path d="M4 22v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" />
      </svg>
    ),
  },
  {
    title: 'Gentleman\'s Combo',
    description:
      'Full service haircut and beard trim. The complete package for a fresh look.',
    price: '$55',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    title: 'Kids Cut',
    description:
      'Patient and friendly service for the little ones (Ages 12 and under).',
    price: '$25',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <circle cx="12" cy="5" r="1" />
        <path d="m9 20 3-6 3 6" />
        <path d="m6 8 6 2 6-2" />
        <path d="M12 10v4" />
      </svg>
    ),
  },
  {
    title: 'Hair Coloring',
    description:
      'Grey blending or full color services to help you look your absolute best.',
    price: '$45+',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
];