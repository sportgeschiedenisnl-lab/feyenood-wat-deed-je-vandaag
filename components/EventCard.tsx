
import React from 'react';
import type { ProcessedEvent } from '../types';

interface EventCardProps {
  event: ProcessedEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formattedDate = new Date(event.date).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 flex flex-col">
      <img src={event.image.url} alt={event.headline} className="w-full h-56 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-sm text-red-400 mb-1">{formattedDate}</p>
        <h3 className="text-2xl font-bold text-white mb-3">{event.headline}</h3>
        <div className="text-gray-300 flex-grow mb-4">
            {event.matchInfo && (
                <p className="font-semibold">{event.matchInfo}</p>
            )}
        </div>
        <a 
          href={event.wikimediaUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-red-500 hover:text-red-400 self-start transition-colors duration-200 mt-auto"
        >
          Bekijk op Wikimedia &rarr;
        </a>
      </div>
    </div>
  );
};

export default EventCard;