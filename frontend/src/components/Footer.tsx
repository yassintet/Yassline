import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <h3 className="text-xl font-bold mb-4 hover:text-[#FF385C] transition-colors cursor-pointer">
                Yassline Tour
              </h3>
            </Link>
            <p className="text-gray-400 text-sm">
              Tu compañero de confianza para descubrir Marruecos
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Nuestra flota</a></li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/circuitos" className="hover:text-white transition-colors">
                  Circuitos
                </Link>
              </li>
              <li>
                <Link href="/transporte" className="hover:text-white transition-colors">
                  Traslados
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Hoteles
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>+212 669 215 611</li>
              <li>info@yassline.com</li>
              <li>Tanger / Casablanca, Marruecos</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 Yassline Tour. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
