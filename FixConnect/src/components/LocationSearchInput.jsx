import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';
import { Input } from './ui/input';

export function LocationSearchInput({ onLocationSelect, initialAddress }) {
    const [query, setQuery] = useState(initialAddress || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!query || query.length < 3 || !isOpen) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                // OpenStreetMap Nominatim API, restricted to Philippines
                const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5`);
                setResults(res.data);
            } catch (err) {
                console.error("Geocoding failed", err);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query, isOpen]);

    const handleSelect = (item) => {
        setQuery(item.display_name);
        setIsOpen(false);
        onLocationSelect({
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
        });
    };

    const handleChange = (e) => {
        setQuery(e.target.value);
        setIsOpen(true);
        // Clear previous selected coords if they type manually
        onLocationSelect({ address: e.target.value, lat: null, lng: null });
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={handleChange}
                    placeholder="Search pickup location..."
                    className="pl-9 bg-background/50 border-border/50 focus:border-primary"
                    onFocus={() => setIsOpen(true)}
                />
                {loading && <Loader2 className="absolute right-3 top-3 h-4 w-4 text-primary animate-spin" />}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-md shadow-lg z-[1000] max-h-60 overflow-y-auto">
                    {results.map((item, idx) => (
                        <div
                            key={idx}
                            className="p-3 text-sm hover:bg-muted cursor-pointer border-b border-border/50 last:border-0"
                            onClick={() => handleSelect(item)}
                        >
                            {item.display_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
