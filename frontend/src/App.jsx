import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BaseLayout from './layouts/BaseLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import License from './pages/License';
import Contact from './pages/Contact';
import About from './pages/About';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <BaseLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/license" element={<License />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </BaseLayout>
      </Router>
    </HelmetProvider>
  );
}

export default App;
