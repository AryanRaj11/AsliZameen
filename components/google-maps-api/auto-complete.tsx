'use client'

import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";

const PlaceAutocomplete = ({ onPlaceSelect, defaultValue }: {
    onPlaceSelect: (data: { address: string; lat: number; lng: number } | null) => void,
    defaultValue: string
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

    useEffect(() => {
        if (!places || !inputRef.current) return;
        
        const options = {
            fields: ['geometry', 'formatted_address', 'name'],
            componentRestrictions: { country: 'in' } 
        };
        
        const ac = new places.Autocomplete(inputRef.current, options);
        setGeocoder(new google.maps.Geocoder());

        const listener = ac.addListener('place_changed', () => {
            const place = ac.getPlace();
            if (place.geometry?.location) {
                onPlaceSelect({
                    address: place.formatted_address || place.name || '',
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                });
            }
        });

        return () => listener.remove();
    }, [places]);

    // Handle the case where the user types manually and clicks away
    const handleChange = async () => {
        const textValue = inputRef.current?.value;
        if (!textValue || !geocoder) return;

        // Try to geocode the raw text to get lat/lng
        geocoder.geocode({ address: textValue, componentRestrictions: { country: 'in' } }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
                const result = results[0];
                onPlaceSelect({
                    address: result.formatted_address,
                    lat: result.geometry.location.lat(),
                    lng: result.geometry.location.lng()
                });
            }
        });
    };

    return (
        <Input
            ref={inputRef}
            required
            //onBlur={handleBlur} // <--- Captures manual input when user leaves the field
            onChange={handleChange}
            defaultValue={defaultValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  // Prevent form from submitting before geocoding is done
                  e.preventDefault(); 
                  handleChange();
              }}}
            placeholder="Search for area, landmark or society..."
            className="w-full"
        />
    );
};

interface AutoCompleteProps {
    onSelect: (data: { address: string; lat: number; lng: number }) => void;
    defaultValue?: string;
}

export default function AutoComplete({ onSelect, defaultValue = '' }: AutoCompleteProps) {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
            <div className="w-full">
                <PlaceAutocomplete 
                    onPlaceSelect={(data) => data && onSelect(data)} 
                    defaultValue={defaultValue} 
                />
            </div>
        </APIProvider>
    );
}

// 'use client'

// import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
// import { useState, useRef, useEffect } from "react";
// import { Input } from "../ui/input";

// // --- Internal Helper Component ---
// const PlaceAutocomplete = ({ onPlaceSelect, defaultValue }: {
//     onPlaceSelect: (place: google.maps.places.PlaceResult) => void,
//     defaultValue: string
//   }) => {
//     const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
//     const inputRef = useRef<HTMLInputElement>(null);
//     const places = useMapsLibrary('places');
  
//     useEffect(() => {
//       if (!places || !inputRef.current) return;
//       const options = {
//         fields: ['geometry', 'formatted_address', 'name'],
//         componentRestrictions: { country: 'in' } 
//       };
//       const ac = new places.Autocomplete(inputRef.current, options);
//       setPlaceAutocomplete(ac);
//     }, [places]);
  
//     useEffect(() => {
//       if (!placeAutocomplete) return;
      
//       const listener = placeAutocomplete.addListener('place_changed', () => {
//         onPlaceSelect(placeAutocomplete.getPlace());
//       });

//       return () => listener.remove(); // Cleanup listener
//     }, [onPlaceSelect, placeAutocomplete]);
  
//     return (
//       <Input
//         ref={inputRef}
//         required
//         defaultValue={defaultValue}
//         placeholder="Search for area, landmark or society..."
//         className="w-full"
//       />
//     );
//   };

// // --- Exported Component ---
// interface AutoCompleteProps {
//   onSelect: (data: { address: string; lat: number; lng: number }) => void;
//   defaultValue?: string;
// }

// export default function AutoComplete({ onSelect, defaultValue = '' }: AutoCompleteProps) {
//     const handleInternalSelect = (place: google.maps.places.PlaceResult) => {
//         if (!place.geometry?.location) return;

//         // Extracting data to send back to SearchForm
//         const data = {
//             address: place.formatted_address || place.name || '',
//             lat: place.geometry.location.lat(),
//             lng: place.geometry.location.lng()
//         };

//         onSelect(data); // This sends the data "Up" to the SearchForm
//     };

//     return (
//         <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
//             <div className="w-full">
//                 <PlaceAutocomplete 
//                     onPlaceSelect={handleInternalSelect} 
//                     defaultValue={defaultValue} 
//                 />
//             </div>
//         </APIProvider>
//     );
// }