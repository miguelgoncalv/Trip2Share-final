import React from 'react';
import './PlacesRecommended.css'; 

function PlacesRecommended() {
  const places = [
    { 
      name: 'Capri Island, Italy 🇮🇹', 
      description: 'A picturesque island with rugged landscapes, azure waters, and historic charm.',
      imagePath: '/Images/capri.png' 
    },
    { 
      name: 'Mount Fuji, Japan 🇯🇵', 
      description: 'Land of contrasts, blending ancient traditions with cutting-edge modernity.',
      imagePath: '/Images/japan.png'
    },
    { 
      name: 'São Paulo, Brazil 🇧🇷', 
      description: 'Brazil s bustling metropolis, rich in culture and diversity.',
      imagePath: '/Images/sao.png' 
    // ...more places
    }
  ];

  return (
    <div className="places-recommended">
      <h2>Places Recommended</h2>
      {places.map((place, index) => (
        <div key={index} className="place">
          <a href="https://www.google.com/travel/flights" target="_blank" rel="noopener noreferrer">
  <img src={place.imagePath} alt={place.name} className="place-image" />
</a>
          <h3>{place.name}</h3>
          <p>{place.description}</p>
        </div>
      ))}
    </div>
  );
}

export default PlacesRecommended;
