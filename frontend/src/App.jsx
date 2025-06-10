import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Button, Nav } from 'react-bootstrap';
import { SunFill, MoonFill } from 'react-bootstrap-icons';
import { useTheme } from './contexts/ThemeContext';
import Homepage from "./pages/Homepage";
import CertificateCreateForm from "../components/CertificateCreateForm";
import Footer from "../components/Footer";

function App() {
  const { isDarkMode, toggleTheme } = useTheme();

    return (
    <Router>
      <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
        {/* Use the custom variable for navbar background */}
        <Navbar variant={isDarkMode ? 'dark' : 'light'} expand="lg" className="shadow-sm" style={{ backgroundColor: 'var(--app-navbar-bg)' }}>
          <Container>
            <Navbar.Brand as={Link} to="/">Certificate Manager</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Button variant="outline-secondary" onClick={toggleTheme} className="d-flex align-items-center">
                  {isDarkMode ? <SunFill color="#ffc107" /> : <MoonFill />}
                  <span className="ms-2 d-lg-none">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <main className="flex-grow-1 py-4">
          <Container>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/certificates/new" element={<CertificateCreateForm />} />
            </Routes>
          </Container>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;

