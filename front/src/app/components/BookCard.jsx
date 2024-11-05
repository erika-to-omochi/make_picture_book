import React from 'react';

function BookCard({ title, description, imageSrc, altText, additionalInfo }) {
  return (
    <div
      className="card w-80 shadow-xl mx-auto p-4 mb-4"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
    >
      <div className="card-body">
        <h2 className="card-title text-lg font-semibold mb-2 text-heading">{title}</h2>
        <p className="text-sm text-bodyText mb-2">{description}</p>
        <img
          src={imageSrc}
          alt={altText}
          className="rounded-lg object-cover w-full h-48 mb-2"
        />
        <p className="text-sm text-bodyText">{additionalInfo}</p>
      </div>
    </div>
  );
}

export default BookCard;
