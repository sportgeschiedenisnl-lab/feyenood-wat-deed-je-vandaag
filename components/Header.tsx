import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-8 px-4">
      <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-wider">
        <span className="block text-red-600">Feyenoord,</span>
        <span className="block text-white">wat deden we vandaag?</span>
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 mt-4">
        <span className="text-red-600">Geen woorden,</span>
        <span className="text-white"> maar foto's</span>
      </p>
    </header>
  );
};

export default Header;
