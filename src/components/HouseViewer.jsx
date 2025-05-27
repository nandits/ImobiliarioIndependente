import React, { useState } from 'react';
import './HouseViewer.css';

function HouseViewer({ house }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!house) {
    return <section className="house-viewer"><p>No house selected.</p></section>;
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % house.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + house.images.length) % house.images.length);
  };


  return (
    <section className="house-viewer">
      <h2>{house.title}</h2>
      <p className="house-description">{house.description}</p>
      <p className="house-address">{house.address}</p>
      <span className="house-price">{house.price}</span>
      <div className="image-gallery">
        {house.images && house.images.length > 0 ? (
          <>
            <img src={house.images[currentImageIndex].picUrl} alt={`${house.title} - view ${currentImageIndex + 1}`} className="main-house-image" onError={(e) => e.target.src = '/placeholder-house-large.png'} />
            <p>{house.images[currentImageIndex].picDescription}</p>
            {house.images.length > 1 && <div className="gallery-nav"><button onClick={prevImage}>&lt; Prev</button><button onClick={nextImage}>Next &gt;</button></div>}
          </>
        ) : 
          <img src="/placeholder-house-large.png" alt="Placeholder" className="main-house-image"/>
        }
      </div>
    </section>
  );
}

export default HouseViewer;