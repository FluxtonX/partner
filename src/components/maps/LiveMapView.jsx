import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNowStrict } from 'date-fns';
import L from 'leaflet';

const userIconHtml = `
  <div class="bg-blue-500 p-2 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  </div>
`;

const userIcon = new L.DivIcon({
  html: userIconHtml,
  className: 'leaflet-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const projectIconHtml = `
  <div class="bg-emerald-500 p-2 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/>
      <path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/>
      <path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
    </svg>
  </div>
`;

const projectIcon = new L.DivIcon({
  html: projectIconHtml,
  className: 'leaflet-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function LiveMapView({ data }) {
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };
  
  const mapCenter = data.length > 0 && data[0].start_location
    ? [data[0].start_location.latitude, data[0].start_location.longitude]
    : [40.7128, -74.0060]; // Default to NYC if no data

  // Get unique projects to avoid rendering duplicate markers
  const uniqueProjects = [...new Map(data.map(item => [item.project.id, item.project])).values()];

  return (
    <MapContainer center={mapCenter} zoom={10} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User Markers */}
      {data.map(item => (
        item.start_location &&
        <Marker 
          key={item.id} 
          position={[item.start_location.latitude, item.start_location.longitude]}
          icon={userIcon}
        >
          <Popup>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={item.user.profile_image_url} alt={item.user.display_name} />
                <AvatarFallback>{getInitials(item.user.display_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold">{item.user.display_name || item.user.full_name}</p>
                <p className="text-sm text-slate-600">
                  Clocked In: {formatDistanceToNowStrict(new Date(item.start_time))} ago
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t">
              <p className="font-semibold">Project:</p>
              <p>{item.project.title}</p>
              <p className="text-xs text-slate-500">{item.project.site_address}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Project Site Markers */}
      {uniqueProjects.map(project => 
        project.site_location?.latitude && project.site_location?.longitude && (
           <Marker 
              key={`proj-${project.id}`} 
              position={[project.site_location.latitude, project.site_location.longitude]} 
              icon={projectIcon}
            >
             <Popup>
                <div>
                  <p className="font-bold">{project.title}</p>
                  <p className="text-sm text-slate-600">Project Site</p>
                  <p>{project.site_address}</p>
                </div>
              </Popup>
           </Marker>
        )
      )}
    </MapContainer>
  );
}