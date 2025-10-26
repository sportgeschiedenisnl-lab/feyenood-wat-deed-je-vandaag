import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-16 py-8 px-4 border-t border-gray-700 text-center text-gray-400">
      <div className="max-w-4xl mx-auto">
        <p className="mb-2">
          Een initiatief van{' '}
          <a href="https://sportgeschiedenis.nl/" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">
            Sportgeschiedenis.nl
          </a>
        </p>
        <p className="mb-2">
          Foto's afkomstig uit de collectie van het Nationaal Archief via Wikimedia Commons.
        </p>
        <p>
          Contact:{' '}
          <a href="mailto:jurryt@sportgeschiedenis.nl" className="text-red-500 hover:underline">
            Jurryt van de Vooren
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
