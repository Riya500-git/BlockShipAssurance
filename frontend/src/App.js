import './App.css';
import Scan from './Scan';
import Owner from './Owner';
import List from './List';
import Create from './Create';
import Navbar from './components/Navbar';
import Home from './Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/shipper" element={<Create />}/>

            <Route path="/partner" element={<Scan />} />

            <Route path="/myparcels" element={<List/>} />

            <Route path="/owner" element={<Owner />} />
          </Routes>
        </Router>
  );
}

export default App;
