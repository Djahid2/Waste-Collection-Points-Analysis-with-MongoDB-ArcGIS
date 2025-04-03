import React from 'react';
import '../css/about.css'; // Import your CSS file for styling
const participants = [
    { id: 1, name: 'Aoudia djahid'},
    { id: 2, name: 'Samir zhgouf' },
    { id: 3, name: 'Amimer Abderhamane'},
    { id: 4, name: 'shun', role: 'Participant' },
    { id: 5, name: 'Chelouche Abdelah' },

];

const AboutUs = () => {

    return (
        <div id='About'>
            <h2>About us </h2>
            <div className='about-container'>
            
            <ul>
                {participants.map(participant => (
                    <li key={participant.id}>{participant.name}</li>
                ))}
            </ul>
        </div>
        </div>
    );
};

export default AboutUs;