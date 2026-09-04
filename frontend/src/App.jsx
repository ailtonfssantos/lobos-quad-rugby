import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';

import Home from './pages/Home';
import Team from './pages/Team';
import Join from './pages/Join';
import Training from './pages/Training';
import Competitions from './pages/Competitions';
import Sponsors from './pages/Sponsors';
import About from './pages/About';
import AvisoLegal from './pages/AvisoLegal';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import PoliticaCookies from './pages/PoliticaCookies';

// Admin
import AdminLogin from './pages/admin/Login';
import AdminLayout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import Inscripciones from './pages/admin/Inscripciones';
import Patrocinadores from './pages/admin/Patrocinadores';
import Jugadores from './pages/admin/Jogadores';
import Eventos from './pages/admin/Eventos';
import Jornadas from './pages/admin/Jornadas';

// Componente principal que verifica a rota
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={
          <>
            <Navbar />
            <Home />
            <Footer />
          </>
        } />
        <Route path="/equipo" element={<><Navbar /><Team /><Footer /></>} />
        <Route path="/sobre-nosotros" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/entrenamientos" element={<><Navbar /><Training /><Footer /></>} />
        <Route path="/competiciones" element={<><Navbar /><Competitions /><Footer /></>} />
        <Route path="/unete" element={<><Navbar /><Join /><Footer /></>} />
        <Route path="/patrocinadores" element={<><Navbar /><Sponsors /><Footer /></>} />
        <Route path="/aviso-legal" element={<><Navbar /><AvisoLegal /><Footer /></>} />
        <Route path="/privacidad" element={<><Navbar /><PoliticaPrivacidad /><Footer /></>} />
        <Route path="/cookies" element={<><Navbar /><PoliticaCookies /><Footer /></>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inscripciones" element={<Inscripciones />} />
          <Route path="patrocinadores" element={<Patrocinadores />} />
          <Route path="jugadores" element={<Jugadores />} /> 
          <Route path="eventos" element={<Eventos />} /> 
          <Route path="jornadas" element={<Jornadas />} />
        </Route>
      </Routes>
      
      {/* WhatsApp só aparece se NÃO for admin */}
      {!isAdminRoute && <WhatsAppButton />}
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;