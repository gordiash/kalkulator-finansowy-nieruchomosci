import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Kalkulatory Nieruchomości
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/kalkulator-zakupu-nieruchomosci" className="text-gray-600 hover:text-blue-600 transition-colors">
              Zakup Nieruchomości
            </Link>
            <Link href="/kalkulator-wynajmu" className="text-gray-600 hover:text-blue-600 transition-colors">
              Opłacalność Wynajmu
            </Link>
            <Link href="/kalkulator-zdolnosci-kredytowej" className="text-gray-600 hover:text-blue-600 transition-colors">
              Zdolność Kredytowa
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 