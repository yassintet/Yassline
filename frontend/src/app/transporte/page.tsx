import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Plane, 
  MapPin, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  Car,
  Building2
} from "lucide-react";

const services = [
  {
    icon: Plane,
    title: "Transfers Aeropuerto",
    description: "Te esperamos con cartel en llegadas. Sin esperas.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: MapPin,
    title: "Inter-Ciudades",
    description: "Viaja de Tánger a Marrakech o Casablanca con total confort.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Clock,
    title: "Disposición por Horas",
    description: "Tu chófer privado para reuniones o compras.",
    color: "from-green-500 to-emerald-500"
  }
];

const routes = [
  {
    from: "Tánger",
    to: "Chefchaouen",
    price: "Desde 120€",
    duration: "1h 30min",
    vehicle: "Mercedes Vito"
  },
  {
    from: "Casablanca",
    to: "Marrakech",
    price: "Desde 180€",
    duration: "3h",
    vehicle: "Mercedes V-Class"
  },
  {
    from: "Aeropuerto Casablanca",
    to: "Centro Ciudad",
    price: "Desde 45€",
    duration: "30min",
    vehicle: "Mercedes Vito"
  }
];

const fleet = [
  {
    name: "Mercedes V-Class",
    category: "VIP",
    image: "/img/v-class1.jpg",
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Mercedes Vito",
    category: "Familia",
    image: "/img/vito (6).jpg",
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Mercedes Sprinter",
    category: "Grupos",
    image: "/img/sprinter.jpg",
    color: "from-green-500 to-emerald-500"
  }
];

export default function TransportePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0066CC]/90 to-[#004499]/95"></div>
          <Image
            src="/img/v-class1.jpg"
            alt="Transporte VIP"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Traslados VIP y Transporte Interurbano
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6">
              Aeropuertos, Estaciones y Servicio a Disposición
            </p>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Chofer profesional</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Vehículos de lujo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Puntualidad garantizada</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Soluciones de transporte adaptadas a tus necesidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tarifas Populares
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Rutas más solicitadas con precios transparentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {routes.map((route, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#FF385C] transition-colors shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-[#0066CC]" />
                      <span className="font-semibold text-gray-900">{route.from}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 my-2" />
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#FF385C]" />
                      <span className="font-semibold text-gray-900">{route.to}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duración:</span>
                    <span className="text-sm font-semibold text-gray-900">{route.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vehículo:</span>
                    <span className="text-sm font-semibold text-gray-900">{route.vehicle}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-2xl font-bold text-gray-900">{route.price}</span>
                  </div>
                  <button className="w-full mt-4 bg-[#FF385C] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#E01E4F] transition-colors">
                    Reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Quick View */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestra Flota
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Vehículos Mercedes-Benz de última generación
            </p>
            <Link
              href="/"
              className="text-[#0066CC] hover:text-[#0052A3] font-semibold inline-flex items-center gap-2 transition-colors"
            >
              Ver toda la flota
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fleet.map((vehicle, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold`}>
                      {vehicle.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {vehicle.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Car className="w-4 h-4" />
                    <span>Transporte de lujo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0066CC] to-[#004499]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Necesitas una ruta personalizada?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Contáctanos para obtener un presupuesto a medida
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#FF385C] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors">
              Solicitar Presupuesto
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
              Llamar Ahora
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
