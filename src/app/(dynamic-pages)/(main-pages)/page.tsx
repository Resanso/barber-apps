import MobileMenu from '@/components/nav/MobileMenu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { T } from '@/components/ui/Typography';
import { ArrowRight, Calendar, Clock, MapPin, Phone, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  // Warna Dasar: #204B49

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar */}
      <nav className="w-full border-b border-[#204B49]/20 bg-[#204B49]/95 backdrop-blur-md sticky top-0 z-50 text-slate-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-20 items-center justify-between">
            {/* Logo Putih aman di sini karena background gelap */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logos/barber-logo.png"
                alt="Gentleman's Cut"
                width={140}
                height={140}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Ubah text jadi terang, hover jadi warna emas/amber muda agar elegan */}
            <div className="hidden md:flex gap-6 items-center">
              <Link href="#services" className="text-sm font-medium hover:text-amber-200 transition-colors">Services</Link>
              <Link href="#hero" className="text-sm font-medium hover:text-amber-200 transition-colors">About</Link>
              <Link href="#about" className="text-sm font-medium hover:text-amber-200 transition-colors">Location</Link>
              <Link href="/waitlist" className="text-sm font-medium hover:text-amber-200 transition-colors">Waiting list</Link>
            </div>

            <div className="flex items-center gap-4">
              <MobileMenu /> {/* Pastikan icon di mobile menu disesuaikan warnanya */}
              <Button variant="outline" className="hidden sm:flex border-slate-400 bg-transparent text-white hover:bg-white hover:text-[#204B49]" asChild>
                <Link href="/login">Member Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - DARK THEME */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden bg-[#204B49]">
        {/* Background decoration - Subtle glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#2D6A67] via-[#204B49] to-[#204B49]"></div>

        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="flex flex-col items-center gap-6">
              {/* Badge: White transparent style */}
              <Badge variant="outline" className="inline-flex items-center border-white/20 bg-white/10 text-slate-100 hover:bg-white/20 backdrop-blur-sm px-4 py-1.5">
                <Star className="mr-2 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="tracking-wide">Premium Grooming Experience</span>
              </Badge>

              <div className="flex flex-col items-center gap-6">
                {/* Logo Hero */}
                <Image
                  src="/logos/barber-logo-hero.png"
                  alt="Gentleman's Cut"
                  width={680}
                  height={140}
                  className="w-full max-w-[500px] md:max-w-[680px] h-auto object-contain drop-shadow-2xl"
                  priority
                />

                {/* Text: Light color for dark background */}
                <T.P className="mx-auto max-w-[700px] text-lg text-slate-300 md:text-xl leading-relaxed">
                  Escalate Barbershop Excellence with Advancements.
                  <br className="hidden md:block" />
                  <span className="text-amber-200 font-medium mt-2 block">Service Hours: 10.00 - 21.00</span>
                </T.P>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              {/* Button: White contrast */}
              <Button size="lg" className="bg-slate-50 text-[#204B49] hover:bg-slate-200 h-12 px-8 font-semibold shadow-lg shadow-black/20" asChild>
                <Link href="/booking">
                  Book Appointment <Calendar className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {/* Button: Outline light */}
              <Button size="lg" variant="outline" className="border-slate-400/50 bg-transparent text-slate-100 hover:bg-white/10 hover:text-white h-12 px-8" asChild>
                <Link href="#services">
                  View Services <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 md:mt-24 flex justify-center">
            <div className="relative w-full max-w-5xl group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-200/20 to-slate-200/20 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-1000"></div>
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#1a3d3b] shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1600&auto=format&fit=crop"
                  alt="Barbershop Interior"
                  className="w-full h-[400px] md:h-[600px] object-cover opacity-90"
                  width={1600}
                  height={900}
                  priority
                />
                {/* Gradient fade to match section background */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#204B49] via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="w-full py-16 md:py-24 lg:py-32 bg-slate-100/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-[850px]">
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl text-slate-900">
                Our Services
              </T.H2>
              <T.P className="text-lg text-slate-600 md:text-xl">
                Professional grooming services tailored to your style. Sit back, relax, and let us take care of the rest.
              </T.P>
            </div>

            <div className="w-full grid max-w-6xl gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="h-full flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 bg-white border-slate-200 group"
                >
                  <CardHeader className="flex-none pb-2">
                    {/* Ikon dihapus, langsung Title */}
                    <CardTitle className="text-center text-xl font-bold uppercase tracking-wider text-[#204B49]">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center px-6 pb-8">
                    {/* Price & Duration */}
                    <div className="text-center mb-6 space-y-1">
                      <div className="text-lg font-bold text-amber-600">
                        Price: {service.price}
                      </div>
                      <div className="text-sm font-medium text-amber-700/80">
                        Duration: {service.duration}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-center text-sm leading-relaxed text-slate-600 mb-6">
                      {service.description}
                    </p>

                    {/* Features (Bold text at bottom) */}
                    {service.features && (
                      <div className="mt-auto pt-4 border-t border-slate-100 w-full text-center">
                        <p className="text-xs font-bold text-slate-800 leading-snug">
                          {service.features}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About/Philosophy Section */}
      <section id="about" className="w-full py-16 md:py-24 lg:py-32 bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col gap-6">
              <Badge variant="outline" className="w-fit border-[#204B49]/30 text-[#204B49]">
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                <span>Est. 2023</span>
              </Badge>
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl text-slate-900">
                A short brief about our establishment
              </T.H2>
              <T.P className="text-lg text-slate-600">
                TRICH Barberspace emerged as a pioneering force in the barbershop industry, introducing a unique blend of exceptional service and breakthrough innovation to elevate the customer experience. Came from the word “Trichology” which means study of hair, TRICH Barberspace is the first cutting-edge establishment that harmonizes time-honored barbershop craftsmanship with the latest advancements in technology for the optimization of accuracy and also to create an unforgettable experience for our customers.
              </T.P>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="h-5 w-5 text-[#204B49]" />
                  <span>Open 7 Days a Week</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="h-12 w-12 text-[#204B49]" />
                  <span>Jl. Sumbawa No.24, Merdeka, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40113</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="bg-slate-900 text-white hover:bg-[#204B49]" asChild>
                  <Link href="/login">Book Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700" asChild>
                  <Link href="#gallery">View Gallery</Link>
                </Button>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              {/* Background blur adjusted to Base Color */}
              <div className="absolute -inset-4 -z-10 bg-[#204B49] rounded-full blur-3xl opacity-20"></div>
              <div className="relative overflow-hidden rounded-xl shadow-xl sepia-[.1]">
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

      {/* CTA Section - Background changed to Base Color */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-[#204B49] text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-[800px]">
              <T.H2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Ready to Look Sharp?
              </T.H2>
              <T.P className="mx-auto max-w-[700px] text-lg text-slate-200 md:text-xl">
                Book your appointment today and experience the difference. Walk-ins are welcome, but appointments are recommended.
              </T.P>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-[#204B49] hover:bg-slate-100 border-none" asChild>
                <Link href="/login">
                  Book Appointment <Calendar className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-400 bg-transparent text-white hover:bg-[#1a3d3b] hover:text-white"
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

// Data Services Terbaru (Sesuai Gambar)
const services = [
  {
    title: 'THE TRICH EXPERIENCE',
    price: 'IDR 135.000',
    duration: '2 Hours',
    description:
      'The ultimate grooming journey. Includes The Cutting Edge service plus 2 additional treatments of your choice.',
    features: 'The Cutting Edge + 2 additional services (Trim & Treat / Creambath / Mask Off)'
  },
  {
    title: 'THE CUTTING EDGE',
    price: 'IDR 85.000',
    duration: '1 Hour',
    description:
      'Achieve a Haircut as sharp as your style with our signature service. Comprehensive service featuring a cleansing wash, warm towel, and styling.',
    features: 'Haircut + Hair Wash + Warm Towel + Hot Stone Massage + Hairstyling'
  },
  {
    title: 'TRUE COLORS',
    price: 'IDR 250.000 - 750.000*',
    duration: '3 Hours',
    description:
      'Forge a fresh look with our Sharp-Edge Hair Coloring service using premium, scalp-friendly dyes. *Final price determined after service.',
    features: 'Full Colors / Highlight Colors'
  },
  {
    title: 'TRIM & TREAT',
    price: 'IDR 35.000',
    duration: '30 Minutes',
    description:
      'Refine your look with a precise shave and soothing treatment.',
    features: 'Shaving + Warm Towel + After-shave Serum'
  },
  {
    title: 'MASK OFF',
    price: 'IDR 35.000',
    duration: '30 Minutes',
    description:
      'Upgrade your haircut experience with our post-trim Face Treatment. Cleanse, soothe, and invigiorate your skin with a premium mask.',
    features: 'Face Mask + Face Wash + Warm Towel'
  },
  {
    title: 'CREAMBATH',
    price: 'IDR 35.000',
    duration: '30 Minutes',
    description:
      'Transform your hair and indulge in pure relaxation with our revitalizing Creambath service.',
    features: 'Hair Wash + Hair Creambath + Scalp Massage + Hair Vitamin Serum'
  },
];