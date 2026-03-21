"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Popup } from "mapbox-gl";
import { FaCheckCircle, FaTimesCircle, FaDirections, FaRecycle, FaMapMarkerAlt, FaPhoneAlt, FaClock } from "react-icons/fa";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Efacility.css";
import getLocation from "@/lib/utils/getLocation";
import { calculateDistance } from "@/lib/utils/calculateLocation";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Link from "next/link";
import { fetchFacilities } from "@/lib/utils/facilityApi";
interface Facility {
  address: string;
  distance: number;
  name: string;
  capacity: number;
  lon: number;
  lat: number;
  contact: string;
  time: string;
  verified: boolean;
}

const FacilityMap: React.FC = () => {
  const [facilityData, setFacilityData] = useState<Facility[]>([]);
  const [clientLocation, setClientLocation] = useState<[number, number] | null>(
    null
  );
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [filterDistance, setFilterDistance] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const mapRef = useRef<Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routePopupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      if (!mapboxToken) {
        throw new Error("Mapbox token is not configured");
      }

      mapboxgl.accessToken = mapboxToken;

      setIsLoading(true);
      getLocation().then((coordinates) => {
        if (coordinates && coordinates.coordinates) {
          setClientLocation(coordinates.coordinates);
        } else {
          setClientLocation(null);
        }
        setIsLoading(false);
      }).catch((err) => {
        console.warn("Error getting location:", err);
        setClientLocation(null);
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please refresh the page.");
      setIsLoading(false);
    }
  }, []);

  const handleAllowLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error('User denied the request for location.');
              break;
            case error.POSITION_UNAVAILABLE:
              console.error('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              console.error('The request to get user location timed out.');
              break;
            default:
              console.error('An unknown error occurred.');
              break;
          }
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    if (clientLocation) {
      // Fetch facilities from API directly with filters to handle backend pagination properly
      const loadFacilities = async () => {
        try {
          setIsLoading(true);
          const result = await fetchFacilities(
            clientLocation[1], 
            clientLocation[0], 
            filterDistance || 500, 
            page, 
            4, 
            filterVerified ? true : undefined
          );

          setTotalPages(result.totalPages);
          setTotalElements(result.totalElements);

          const sortedFacilities = result.content
            .map((facility) => ({
              ...facility,
              distance: calculateDistance(
                clientLocation[1],
                clientLocation[0],
                facility.lat,
                facility.lon
              ),
            }))
            .sort((a, b) => a.distance - b.distance);

          setFacilityData(sortedFacilities);
          if (sortedFacilities.length > 0) {
            setSelectedFacility(0);
          } else {
            setSelectedFacility(null);
          }
          setIsLoading(false);
        } catch (err) {
          console.error("Error loading facilities:", err);
          setError("Failed to load facilities. Please try again.");
          setIsLoading(false);
        }
      };

      loadFacilities();
    }
  }, [clientLocation, filterVerified, filterDistance, page]);

  // Separate useEffect for map initialization - runs after facilityData is loaded
  useEffect(() => {
    if (!clientLocation) {
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: clientLocation,
      zoom: 10,
    });

    mapRef.current = map;
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: "Search for your location",
    });

    map.addControl(geocoder);

    geocoder.on(
      "result",
      (event: { result: { geometry: any; place_name: any } }) => {
        const { geometry, place_name } = event.result;

        if (geometry && geometry.coordinates) {
          const center = geometry.coordinates;

          // Remove previous markers if they exist
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          const selectedLocationMarker = new mapboxgl.Marker({
            color: "#3366ff",
            scale: 1.2
          })
            .setLngLat(center)
            .addTo(map);

          userMarkerRef.current = selectedLocationMarker;

          const popup = new Popup().setHTML(
            `<div class="p-2">
                <h3 class="font-bold text-indigo-600 text-lg mb-1">Selected Location</h3>
                <p class="text-sm text-gray-700">Address: ${place_name || "Address not available"}</p>
              </div>`
          );

          selectedLocationMarker.setPopup(popup);

          // Recalculate distances based on new location
          const recalculatedFacilities = facilityData
            .map((facility) => ({
              ...facility,
              distance: calculateDistance(
                center[1],
                center[0],
                facility.lat,
                facility.lon
              ),
            }))
            .sort((a, b) => a.distance - b.distance);

          setFacilityData(recalculatedFacilities);
          setClientLocation([center[0], center[1]]);

          // Find the nearest facility
          const nearestFacility = recalculatedFacilities[0];
          getDirections(center, [nearestFacility.lon, nearestFacility.lat], nearestFacility.name);
          setSelectedFacility(0);
        }
      }
    );

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    const userMarker = new mapboxgl.Marker({
      color: "#3366ff",
      scale: 1.2
    })
      .setLngLat(clientLocation)
      .addTo(map);

    const userPopup = new Popup().setHTML(
      `<div class="p-2">
          <h3 class="font-bold text-indigo-600 text-lg mb-1">Your Location</h3>
        </div>`
    );

    userMarker.setPopup(userPopup);
    userMarkerRef.current = userMarker;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    facilityData.forEach((facility, index) => {
      const popup = new Popup().setHTML(
        `<div class="p-3">
            <h3 class="font-bold text-emerald-600 text-xl mb-2">${facility.name}</h3>
            <div class="flex items-center text-sm mb-1">
              <span class="font-semibold mr-2">Capacity:</span>
              <span>${facility.capacity} tons/month</span>
            </div>
            <div class="flex items-start text-sm mb-1">
              <span class="font-semibold mr-2">Address:</span>
              <span>${facility.address}</span>
            </div>
            <div class="flex items-center text-sm mb-1">
              <span class="font-semibold mr-2">Contact:</span>
              <span>${facility.contact}</span>
            </div>
            <div class="flex items-center text-sm mb-1">
              <span class="font-semibold mr-2">Hours:</span>
              <span>${facility.time}</span>
            </div>
            <div class="flex items-center text-sm font-medium text-indigo-600">
              <span>${facility.distance.toFixed(2)} km from your location</span>
            </div>
          </div>`
      );

      const marker = new mapboxgl.Marker({
        color: facility.verified ? "#10b981" : "#f97316",
        scale: selectedFacility === index ? 1.2 : 1
      })
        .setLngLat([facility.lon, facility.lat])
        .setPopup(popup);

      // Append always-visible name label to the marker DOM element
      const markerEl = marker.getElement();
      markerEl.style.zIndex = selectedFacility === index ? "100" : "1";
      
      const labelDiv = document.createElement('div');
      labelDiv.className = `absolute top-full left-1/2 -translate-x-1/2 mt-0.5 px-2 py-0.5 bg-white text-gray-800 text-[10px] sm:text-[11px] font-bold rounded shadow-md border border-gray-200 whitespace-nowrap pointer-events-none transition-all duration-200 ${selectedFacility === index ? 'opacity-0 invisible' : 'opacity-90 hover:opacity-100'}`;
      labelDiv.innerText = facility.name.length > 25 ? facility.name.substring(0, 25) + '...' : facility.name;
      markerEl.appendChild(labelDiv);

      markersRef.current.push(marker);

      marker.addTo(map);

      marker.getElement().addEventListener("click", () => {
        // Enforce singlular popup mode: Close any other open markers before rendering
        markersRef.current.forEach((m, idx) => {
          if (idx !== index) {
            const extraPopup = m.getPopup();
            if (extraPopup && extraPopup.isOpen()) extraPopup.remove();
          }
        });

        const activeMarker = markersRef.current[index];
        const activePopup = activeMarker.getPopup();

        if (activePopup) {
          if (activePopup.isOpen()) {
            activePopup.remove();
          } else {
            activePopup.addTo(mapRef.current!);
          }
        }
        setSelectedFacility(index);
      });

      popup.on("close", () => {
        setSelectedFacility(null);
      });
    });

    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientLocation, facilityData]);

  // Update markers when selected facility changes
  useEffect(() => {
    if (markersRef.current && mapRef.current) {
      markersRef.current.forEach((marker, index) => {
        marker.getElement().className = `mapboxgl-marker mapboxgl-marker-anchor-center ${selectedFacility === index ? "pulse-marker" : ""
          }`;

        // Update marker scale and bolden the label if selected
        if (selectedFacility === index) {
          marker.setDraggable(false);
          marker.getElement().style.transform = `translate(-50%, -50%) scale(1.2)`;
          marker.getElement().style.zIndex = "100";
          const label = marker.getElement().querySelector('div.whitespace-nowrap') as HTMLElement;
          if (label) {
            label.className = "absolute top-full left-1/2 -translate-x-1/2 mt-0.5 px-2 py-0.5 bg-white text-gray-800 text-[10px] sm:text-[11px] font-bold rounded shadow-md border border-gray-200 whitespace-nowrap pointer-events-none transition-all duration-200 opacity-0 invisible";
          }
        } else {
          marker.setDraggable(false);
          marker.getElement().style.transform = `translate(-50%, -50%) scale(1.0)`;
          marker.getElement().style.zIndex = "1";
          const label = marker.getElement().querySelector('div.whitespace-nowrap') as HTMLElement;
          if (label) {
            label.className = "absolute top-full left-1/2 -translate-x-1/2 mt-0.5 px-2 py-0.5 bg-white text-gray-800 text-[10px] sm:text-[11px] font-bold rounded shadow-md border border-gray-200 whitespace-nowrap pointer-events-none transition-all duration-200 opacity-90 hover:opacity-100";
          }
        }
      });
    }
  }, [selectedFacility]);

  const getDirections = async (
    origin: [number, number],
    destination: [number, number],
    facilityName?: string
  ) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
      );

      const data = await response.json();

      if (data.code === "Ok" && mapRef.current) {
        const distanceInKm = data.routes[0].distance / 1000;
        const durationInMinutes = Math.ceil(data.routes[0].duration / 60);

        const directionsLayerId = "directions";
        if (mapRef.current.getLayer(directionsLayerId)) {
          mapRef.current.removeLayer(directionsLayerId);
          mapRef.current.removeSource(directionsLayerId);
        }

        mapRef.current.addSource(directionsLayerId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: data.routes[0].geometry,
          },
        });

        mapRef.current.addLayer({
          id: directionsLayerId,
          type: "line",
          source: directionsLayerId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#4f46e5",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });

        const bounds = new mapboxgl.LngLatBounds();
        data.routes[0].geometry.coordinates.forEach((coord: [number, number]) =>
          bounds.extend(coord)
        );
        mapRef.current.fitBounds(bounds, { padding: 60 });
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  useEffect(() => {
    if (
      selectedFacility !== null &&
      cardContainerRef.current &&
      mapRef.current &&
      facilityData.length > 0
    ) {
      const cardHeight = 220; // Approximate height of each card
      const scrollPosition = selectedFacility * cardHeight;

      cardContainerRef.current.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });

      // Get directions from current location to selected facility
      if (clientLocation && selectedFacility < facilityData.length) {
        const selected = facilityData[selectedFacility];
        getDirections(clientLocation, [selected.lon, selected.lat], selected.name);
      }
    }
  }, [selectedFacility, facilityData, clientLocation]);

  return (
    <div className="min-h-screen bg-gray-50 e-facilities-container">
      {error && (
        <div className="fixed top-[100px] right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Locating the nearest e-waste facilities...</p>
          </div>
        </div>
      ) : clientLocation ? (
        <div className="pt-32 pb-12 px-4 md:px-8 w-full">
          <div className="mb-10 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Tracking
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              E-Waste Recycling <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Locator</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-medium">
              Find certified e-waste collection and recycling centers near you. Get directions, check facility details, and book recycling services effortlessly.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <div className="bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm flex items-center hover:shadow-md transition-shadow">
              <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-gray-700 font-medium text-sm">Verified Facility</span>
            </div>
            <div className="bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm flex items-center hover:shadow-md transition-shadow">
              <span className="w-3 h-3 rounded-full bg-orange-500 mr-2 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>
              <span className="text-gray-700 font-medium text-sm">Unverified Facility</span>
            </div>
            <div className="bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm flex items-center hover:shadow-md transition-shadow">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              <span className="text-gray-700 font-medium text-sm">Your Location</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="lg:w-[55%] lg:min-w-[500px] flex flex-col gap-5">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                  </h2>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{totalElements} results</span>
                </div>

                <div className="flex gap-3">
                  <button
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${filterVerified ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' : 'bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100'}`}
                    onClick={() => { setFilterVerified(!filterVerified); setPage(0); }}
                  >
                    {filterVerified && <FaCheckCircle className="text-emerald-500" />}
                    Verified Only
                  </button>

                  <select
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm appearance-none cursor-pointer"
                    value={filterDistance || ""}
                    onChange={(e) => { setFilterDistance(e.target.value ? parseInt(e.target.value) : null); setPage(0); }}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right .75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                  >
                    <option value="">Any Distance</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                </div>
              </div>

              <div
                ref={cardContainerRef}
                className="flex-grow rounded-2xl overflow-y-auto max-h-[calc(75vh-100px)] lg:max-h-[75vh] p-1 flex flex-col gap-4"
                style={{ scrollbarWidth: 'none' }}
              >
                {facilityData.length > 0 ? (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facilityData.map((info, index) => {
                    const isSelected = selectedFacility === index;
                    return (
                    <div
                      key={index}
                      className={`group relative p-5 bg-white rounded-2xl cursor-pointer transition-all duration-300 border ${
                        isSelected 
                          ? "border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500" 
                          : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                      }`}
                      onClick={() => setSelectedFacility(index)}
                    >
                      <div className="absolute -top-3 right-4">
                        {info.verified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-wider shadow-sm">
                            <FaCheckCircle className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider shadow-sm">
                            <FaTimesCircle className="w-3.5 h-3.5" />
                            Unverified
                          </span>
                        )}
                      </div>

                      <div className="mt-2 mb-4 flex gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-gray-50 text-emerald-500 group-hover:bg-emerald-50 group-hover:scale-105'}`}>
                           <FaRecycle className="w-6 h-6" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h2 className={`font-bold text-[15px] leading-tight transition-colors line-clamp-2 ${isSelected ? 'text-emerald-700' : 'text-gray-900 group-hover:text-emerald-600'}`}>{info.name}</h2>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              {info.distance.toFixed(1)} km away
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-5 bg-gray-50/50 p-3 rounded-xl">
                        <div className="flex items-start gap-2.5 text-xs text-gray-600">
                          <FaMapMarkerAlt className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <p className="leading-snug font-medium text-gray-700 line-clamp-2">{info.address}</p>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-gray-600">
                          <FaPhoneAlt className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <p className="font-medium text-gray-700">{info.contact}</p>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-gray-600">
                          <FaClock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <p className="font-medium text-gray-700">{info.time}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-xs">
                        <button
                          className={`flex-[0.8] flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                            isSelected ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (clientLocation) {
                              getDirections(clientLocation, [info.lon, info.lat], info.name);
                            }
                          }}
                        >
                          <FaDirections className={isSelected ? 'text-indigo-500 text-sm' : 'text-gray-400 text-sm'} />
                          Directions
                        </button>

                        <Link
                          href="/citizen/recycle"
                          className="flex-[1.2] flex items-center justify-center gap-1.5 px-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold transition-all duration-200 shadow-sm hover:shadow"
                        >
                          <FaRecycle className="text-sm" />
                          Book Pickup
                        </Link>
                      </div>
                    </div>
                  )})}
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <button 
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${page === 0 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      >
                        Previous
                      </button>
                      
                      <div className="text-sm font-semibold text-gray-500 whitespace-nowrap flex items-center gap-1">
                        Page <span className="text-gray-900">{page + 1}</span> of <span className="text-gray-900">{totalPages}</span>
                      </div>
                      
                      <button 
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${page >= totalPages - 1 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-56 bg-white rounded-2xl border border-dashed border-gray-300 text-center px-6 shadow-sm">
                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <FaMapMarkerAlt className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-base font-medium">No facilities match your filters.</p>
                    <button 
                      onClick={() => { setFilterVerified(false); setFilterDistance(null); setPage(0); }}
                      className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              ref={mapContainerRef}
              id="map"
              className="flex-1 w-full min-h-[50vh] lg:min-h-0 lg:h-[75vh] rounded-2xl shadow-md border border-gray-200 overflow-hidden relative z-0"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
          <div className="max-w-md mx-auto text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Location Access Required
            </h2>

            <p className="text-gray-600 mb-8">
              We need access to your location to show you nearby e-waste recycling facilities. Please enable location services in your browser settings.
            </p>

            <button
              onClick={handleAllowLocationClick}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-md transition-colors duration-300"
            >
              Allow Location Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityMap;
