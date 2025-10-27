import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in webpack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ConnectionData {
  ip: string;
  hostname: string;
  country: string;
  status: string;
  lat?: number;
  lng?: number;
  processName?: string;
  port?: number;
}

interface WorldMapProps {
  connections: ConnectionData[];
  height?: string;
}

const WorldMap: React.FC<WorldMapProps> = ({ connections, height = "400px" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Function to get marker color based on connection status
  const getMarkerIcon = (status: string, processName?: string) => {
    let color = '#3388ff'; // Default blue
    
    if (processName) {
      // Color code by application type
      if (processName.toLowerCase().includes('zoom')) color = '#2d8cff';
      else if (processName.toLowerCase().includes('chrome') || processName.toLowerCase().includes('firefox')) color = '#ff6b35';
      else if (processName.toLowerCase().includes('discord') || processName.toLowerCase().includes('teams')) color = '#7289da';
      else if (processName.toLowerCase().includes('spotify')) color = '#1db954';
      else if (processName.toLowerCase().includes('steam')) color = '#171a21';
      else color = '#6c757d'; // Gray for unknown
    }
    
    // Create custom marker
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  // Function to get approximate coordinates based on country
  const getCountryCoordinates = (country: string): [number, number] => {
    const countryCoords: { [key: string]: [number, number] } = {
      'United States': [39.8283, -98.5795],
      'US': [39.8283, -98.5795],
      'United Kingdom': [55.3781, -3.4360],
      'UK': [55.3781, -3.4360],
      'Canada': [56.1304, -106.3468],
      'Germany': [51.1657, 10.4515],
      'France': [46.2276, 2.2137],
      'Japan': [36.2048, 138.2529],
      'China': [35.8617, 104.1954],
      'India': [20.5937, 78.9629],
      'Australia': [-25.2744, 133.7751],
      'Brazil': [-14.2350, -51.9253],
      'Russia': [61.5240, 105.3188],
      'South Korea': [35.9078, 127.7669],
      'Netherlands': [52.1326, 5.2913],
      'Singapore': [1.3521, 103.8198],
      'Sweden': [60.1282, 18.6435],
      'Switzerland': [46.8182, 8.2275],
      'Ireland': [53.4129, -8.2439],
      'Unknown': [0, 0],
      'N/A': [0, 0],
      'Local': [0, 0]
    };
    
    return countryCoords[country] || [0, 0];
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        attributionControl: false
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for connections
    connections.forEach((connection, index) => {
      if (!mapInstanceRef.current) return;
      
      const [lat, lng] = getCountryCoordinates(connection.country);
      
      // Skip invalid coordinates
      if (lat === 0 && lng === 0 && connection.country !== 'Unknown') return;
      
      // Add some random offset to avoid overlapping markers
      const offsetLat = lat + (Math.random() - 0.5) * 2;
      const offsetLng = lng + (Math.random() - 0.5) * 4;
      
      const marker = L.marker([offsetLat, offsetLng], {
        icon: getMarkerIcon(connection.status, connection.processName)
      }).addTo(mapInstanceRef.current);

      // Create popup content
      const popupContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
            ${connection.processName || 'Unknown Process'}
          </h4>
          <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
            <p style="margin: 2px 0;"><strong>IP:</strong> ${connection.ip}</p>
            ${connection.hostname !== 'N/A' ? `<p style="margin: 2px 0;"><strong>Host:</strong> ${connection.hostname}</p>` : ''}
            <p style="margin: 2px 0;"><strong>Country:</strong> ${connection.country}</p>
            ${connection.port ? `<p style="margin: 2px 0;"><strong>Port:</strong> ${connection.port}</p>` : ''}
            <p style="margin: 2px 0;"><strong>Status:</strong> 
              <span style="color: ${connection.status === 'active' ? '#10b981' : '#6b7280'};">
                ${connection.status}
              </span>
            </p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    return () => {
      // Cleanup markers when component unmounts
      markersRef.current.forEach(marker => {
        mapInstanceRef.current?.removeLayer(marker);
      });
    };
  }, [connections]);

  useEffect(() => {
    // Cleanup map when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full border rounded-lg overflow-hidden shadow-sm">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="relative"
      />
      <div className="p-3 bg-gray-50 border-t text-xs text-gray-600">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></div>
            <span>General Traffic</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-sm"></div>
            <span>Video Conf</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow-sm"></div>
            <span>Browser</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500 border border-white shadow-sm"></div>
            <span>Communication</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm"></div>
            <span>Media</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;