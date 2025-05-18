import React, { useState } from 'react';
import './HouseViewer.css';

function HouseViewer({ house }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!house) {
    return <section className="house-viewer"><p>No house selected.</p></section>;
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % house.photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + house.photos.length) % house.photos.length);
  };

  return (
    <section className="house-viewer">
      <h2>{house.name}</h2>
      <p className="house-address">{house.address} - <span className="house-price">{house.price}</span></p>
      <div className="image-gallery">
        {house.photos && house.photos.length > 0 ? (
          <>
            <img src={house.photos[currentImageIndex]} alt={`${house.name} - view ${currentImageIndex + 1}`} className="main-house-image" onError={(e) => e.target.src = '/placeholder-house-large.png'} />
            {house.photos.length > 1 && <div className="gallery-nav"><button onClick={prevImage}>&lt; Prev</button><button onClick={nextImage}>Next &gt;</button></div>}
          </>
        ) : <img src="/placeholder-house-large.png" alt="Placeholder" className="main-house-image"/> }
      </div>
      <p className="house-description">{house.description}</p>
    </section>
  );
}

export default HouseViewer;