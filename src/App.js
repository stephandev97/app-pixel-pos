import React from 'react';
import { useSelector } from 'react-redux';
import './App.css';
import Checkout from './pages/Checkout/Checkout';
import FinishOrder from './pages/FinishOrder/FinishOrder';
import Home from './pages/Home/Home';
import Navbar from './pages/Navbar/Navbar';
import OrderFinished from './pages/OrderFinished/OrderFinished';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Prueba from './pages/PRUEBA/prueba';

function App() {
  const theme = createTheme({
    overrides: {
      MuiCssBaseline: {
        "@global": {
          "*::-webkit-scrollbar": {
            width: "5px"
          },
          "*::-webkit-scrollbar-track": {
            background: "#E4EFEF"
          },
          "*::-webkit-scrollbar-thumb": {
            background: "#1D388F61",
            borderRadius: "10px"
          }
        }
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
    <div className='App'>
        <Home/>
        <Checkout/>
        <Navbar/>
        <FinishOrder/>
        <OrderFinished/>
    </div>
    </ThemeProvider>
  );
}

export default App;
