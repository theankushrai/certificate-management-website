import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from "../pages/Homepage";
import CertificateCreateForm from "../components/CertificateCreateForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/certificates/new" element={<CertificateCreateForm />} />
      </Routes>
    </Router>
  );
}

export default App;
