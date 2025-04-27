import { useState } from 'react'
import  Home  from './components/Home.jsx'
import  Nav  from './components/Nav.jsx'
import Maps from './components/Maps.jsx'
import Tableau from './components/tableau.jsx'
import AboutUs from './components/About us.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Nav />
      <Home />
      <Maps />
      <Tableau />
       <AboutUs />
    </>
  )
}

export default App
