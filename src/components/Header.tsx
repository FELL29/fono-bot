import { Button } from "@/components/ui/button";
import { MessageCircle, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import fonoBotIcon from "@/assets/fonobot-icon.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsConditionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const conditionsItems = [
    { label: "Crianças Típicas", href: "/criancas-tipicas" },
    { label: "Espectro Autista", href: "/espectro-autista" },
    { label: "Síndrome de Down", href: "/sindrome-down" },
    { label: "Transtornos da Linguagem", href: "/transtornos-linguagem" },
  ];

  const navItems = user ? [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Avaliação", href: "/avaliacao" },
  ] : [
    { label: "Início", href: "/" },
    { label: "Sobre", href: "/sobre" },
    { label: "Condições", href: "/condicoes", hasDropdown: true },
    { label: "Preços", href: "/precos" },
    { label: "Contato", href: "/contato" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.substring(1);
    return location.pathname === href;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src={fonoBotIcon} alt="FonoBot" className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold text-foreground">FonoBot</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                item.hasDropdown ? (
                  <div key={item.label} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsConditionsOpen(!isConditionsOpen)}
                      className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isConditionsOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
                        {conditionsItems.map((conditionItem) => (
                          <Link
                            key={conditionItem.label}
                            to={conditionItem.href}
                            className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            onClick={() => setIsConditionsOpen(false)}
                          >
                            {conditionItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : item.href.startsWith("/#") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`transition-colors ${
                      isActive(item.href) 
                        ? "text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`transition-colors ${
                      isActive(item.href) 
                        ? "text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              {user ? (
                <Button variant="ghost" className="hidden md:inline-flex" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="hidden md:inline-flex"
                    onClick={() => navigate('/auth')}
                  >
                    Entrar
                  </Button>
                  <Button 
                    variant="default" 
                    className="hidden md:inline-flex"
                    onClick={() => navigate('/auth')}
                  >
                    Começar Agora
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden">
          <div className="container mx-auto px-4 pt-20 pb-8">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                item.hasDropdown ? (
                  <div key={item.label} className="space-y-2">
                    <span className="text-lg font-medium text-foreground">{item.label}</span>
                    <div className="ml-4 space-y-2">
                      {conditionsItems.map((conditionItem) => (
                        <Link
                          key={conditionItem.label}
                          to={conditionItem.href}
                          className="block text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {conditionItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : item.href.startsWith("/#") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`text-lg transition-colors ${
                      isActive(item.href) 
                        ? "text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`text-lg transition-colors ${
                      isActive(item.href) 
                        ? "text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              <div className="pt-4 space-y-3">
                {user ? (
                  <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }}
                    >
                      Entrar
                    </Button>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }}
                    >
                      Começar Agora
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;