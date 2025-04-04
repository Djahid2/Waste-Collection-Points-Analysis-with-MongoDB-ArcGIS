import React from 'react'; 
import '../css/home.css';
import img1 from '../assets/2.jpg';
const Home = () => {
    return(
        <div className="home" id='home'>
            <div>
            <h1>Welcome to Ecopoint</h1>
            <p>Your one-stop solution for eco-friendly navigation.</p>
            <p>Discover the best routes that minimize your carbon footprint.</p>
         
            </div>
            <div className="home-image">
                <img src={img1} alt="Ecopoint" />
            </div>
           
        </div>
    )
}
export default Home;