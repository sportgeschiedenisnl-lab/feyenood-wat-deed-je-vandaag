
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import DatePicker from './components/DatePicker';
import EventCard from './components/EventCard';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchFeyenoordPhotos } from './services/wikimediaService';
import { processEventsWithGemini } from './services/geminiService';
import type { WikimediaImage, EventGroup, ProcessedEvent } from './types';

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [processedEvents, setProcessedEvents] = useState<ProcessedEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState<boolean>(false);

  // Cache all fetched photos to avoid re-fetching from Wikimedia on date change
  const allPhotosCache = useRef<WikimediaImage[] | null>(null);

  const processDataForDate = useCallback(async (date: Date) => {
    setIsLoading(true);
    setProcessedEvents([]);
    setError(null);
    setNoResults(false);

    try {
      // Step 1: Fetch all photos from Wikimedia if not cached
      if (allPhotosCache.current === null) {
        const photos = await fetchFeyenoordPhotos();
        allPhotosCache.current = photos;
      }
      
      const photos = allPhotosCache.current;

      // Step 2: Filter photos for the selected month and day
      const day = date.getDate();
      const month = date.getMonth();
      const filteredPhotos = photos.filter(photo => {
        const photoDate = new Date(photo.date);
        return photoDate.getDate() === day && photoDate.getMonth() === month;
      });

      if (filteredPhotos.length === 0) {
        setNoResults(true);
        setIsLoading(false);
        return;
      }
      
      // Step 3: Group photos by full historical date
      const groups: { [key: string]: WikimediaImage[] } = {};
      filteredPhotos.forEach(photo => {
        if (!groups[photo.date]) {
          groups[photo.date] = [];
        }
        groups[photo.date].push(photo);
      });
      
      const eventGroups: EventGroup[] = Object.keys(groups).map(dateKey => ({
        date: dateKey,
        images: groups[dateKey],
      }));

      // Step 4: Process groups with Gemini AI
      const aiResults = await processEventsWithGemini(eventGroups);

      // Step 5: Combine AI results with image data
      const finalEvents: ProcessedEvent[] = aiResults.map(result => {
        const originalGroup = eventGroups.find(g => g.date === result.date);
        if (!originalGroup) return null; // Should not happen
        
        // Select a random image from the group
        const randomImage = originalGroup.images[Math.floor(Math.random() * originalGroup.images.length)];
        
        return {
          ...result,
          image: randomImage,
          wikimediaUrl: randomImage.descriptionurl,
          photoCount: originalGroup.images.length,
        };
      }).filter((e): e is ProcessedEvent => e !== null);

      // Sort events chronologically
      finalEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setProcessedEvents(finalEvents);

    } catch (err) {
      console.error(err);
      setError("Er is een fout opgetreden bij het ophalen van de gegevens. Probeer het later opnieuw.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    processDataForDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const formattedDateTitle = selectedDate.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto px-4">
        <DatePicker initialDate={selectedDate} onSearch={setSelectedDate} />
        
        <div className="mt-8">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : noResults ? (
            <div className="text-center py-16 px-4 bg-gray-800 rounded-lg">
              <p className="text-2xl text-gray-300">"Geen woorden en geen daden!"</p>
              <p className="text-lg text-gray-400 mt-2">Voor deze datum zijn geen foto's gevonden in het Nationaal Archief.</p>
            </div>
          ) : processedEvents.length > 0 ? (
            <>
              <h2 className="text-3xl font-bold text-center mb-8">
                Wat deed Feyenoord in de geschiedenis op {formattedDateTitle}?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {processedEvents.map(event => (
                  <EventCard key={event.date} event={event} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;