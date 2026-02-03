"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ClientIonIcon from "../../utils/ClientIonIcon";
import logo from "../../../assets/ELocate-s.png"
import { getEmail, getUser, getUserName, handleLogout, isAuthenticated } from "../sign-in/auth";
import { FiUser } from 'react-icons/fi';
import getLocation from "../../utils/getLocation";
import Toast from "../Components/Toast";


interface NavItemProps {
    label: string;
}

const Header = () => {
    const [isNavbarActive, setIsNavbarActive] = useState(false);
    const [isHeaderActive, setIsHeaderActive] = useState(false);
    const [locations, setLocation] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [toastConfig, setToastConfig] = useState({ isOpen: false, title: '', message: '' });

    const handleLocationClick = () => {
        // Show toast requesting location access
        setToastConfig({
            isOpen: true,
            title: 'Requesting Location Access',
            message: 'Please allow location access to find nearby e-waste facilities...'
        });

        // Request location in background
        if (navigator.geolocation) {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=pk.eyJ1Ijoic2h1ZW5jZSIsImEiOiJjbG9wcmt3czMwYnZsMmtvNnpmNTRqdnl6In0.vLBhYMBZBl2kaOh1Fh44Bw`)
                        .then(response => response.json())
                        .then(data => {
                            const city = data.features[0].context.find((context: { id: string | string[]; }) => context.id.includes('place')).text;
                            const state = data.features[0].context.find((context: { id: string | string[]; }) => context.id.includes('region')).text;
                            setLocation(`${city}, ${state}`);
                            // Show success toast
                            setToastConfig({
                                isOpen: true,
                                title: 'Location Access Granted',
                                message: `Your location has been set to: ${city}, ${state}`
                            });
                        })
                        .catch(error => {
                            setLocation('Location Unavailable');
                            setToastConfig({
                                isOpen: true,
                                title: 'Location Error',
                                message: 'Unable to fetch location details. Please try again.'
                            });
                        });
                },
                (error) => {
                    setLocation('Location Unavailable');
                    setToastConfig({
                        isOpen: true,
                        title: 'Location Access Denied',
                        message: 'Please enable location access in your browser settings.'
                    });
                },
                options
            );
        } else {
            setLocation('Location Unavailable');
            setToastConfig({
                isOpen: true,
                title: 'Location Not Supported',
                message: 'Your browser does not support geolocation.'
            });
        }
    };

    const handleToggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    useEffect(() => {
        setMounted(true);
        document.documentElement.classList.remove('no-js');

        if (navigator.geolocation) {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=pk.eyJ1Ijoic2h1ZW5jZSIsImEiOiJjbG9wcmt3czMwYnZsMmtvNnpmNTRqdnl6In0.vLBhYMBZBl2kaOh1Fh44Bw`)
                        .then(response => response.json())
                        .then(data => {
                            const city = data.features[0].context.find((context: { id: string | string[]; }) => context.id.includes('place')).text;
                            const state = data.features[0].context.find((context: { id: string | string[]; }) => context.id.includes('region')).text;
                            setLocation(`${city}, ${state}`);
                        })
                        .catch(error => {
                        });
                },
                (error) => {
                    setLocation('Location Unavailable');
                },
                options
            );
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsHeaderActive(true);
            } else {
                setIsHeaderActive(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const user = getUser();
    const displayName = user?.username || user?.fullName || user?.email || "User";

    const toggleNavbar = () => {
        setIsNavbarActive(!isNavbarActive);
    };

    return (
        <React.Fragment>
            <header className={`header ${isHeaderActive ? "active" : ""}`} data-header>
                <div className="container shadow-md">
                    <Link href="/citizen">
                        <Image
                            src={logo}
                            alt="ELocate"
                            width={100}
                            height={100}
                            className="logo ml-4 logo md:ml-16 "
                        />
                    </Link>

                    <nav className={`navbar ${isNavbarActive ? "active" : ""}`} data-navbar>
                        <div className="wrapper">
                            <Link href="/citizen" className="logo">
                                ELocate
                            </Link>
                            <button
                                className="nav-close-btn"
                                aria-label="close menu"
                                data-nav-toggler
                                onClick={toggleNavbar}
                            >
                                <ClientIonIcon
                                    icon="closeOutline"
                                    className={`close-icon ${isNavbarActive ? "" : "hidden"}`}
                                ></ClientIonIcon>
                            </button>
                        </div>

                        <ul className="navbar-list">
                            <NavItem label="Home" />
                            <NavItem label="About" />
                            <NavItem label="E-Facilities" />
                            <NavItem label='Book-Recycle' />
                            <NavItem label="Recycle" />
                            <NavItem label="Education" />
                            <NavItem label="Contactus" />
                            <NavItem label="Rules" />
                        </ul>
                    </nav>

                    <button
                        onClick={handleLocationClick}
                        className='font-montserrat font-bold text-xl ml-12 md:ml-4 md:text-2xl text-emerald-600 flex items-center gap-[1vh] hover:text-emerald-700 transition-colors cursor-pointer'
                    >
                        <ClientIonIcon icon="location" aria-hidden="true" role="img"></ClientIonIcon>
                        {locations || 'Loading...'}
                    </button>

                    {(mounted && user) ? (
                        <div className="relative">
                            <button
                                className="md:mr-8 text-sm md:text-xl font-semibold"
                                onClick={handleToggleDropdown}
                            >
                                {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute top-12 right-0 projects p-4  shadow-md divide-y rounded-lg w-44 mt-2">
                                    <Link href="/citizen/profile" className="hover:text-emerald-500">
                                        Profile
                                    </Link>
                                    <button
                                        className="hover:text-emerald-500"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : mounted ? (
                        <div className="flex items-center gap-2 md:mr-8">
                            <Link href="/sign-in" className="btn-md btn-outline">SignIn</Link>
                            <Link href="/citizen/sign-up" className="btn-md btn-outline">Register</Link>
                        </div>
                    ) : null}
                    <button
                        className="nav-open-btn"
                        aria-label="open menu"
                        data-nav-toggler
                        onClick={toggleNavbar}
                    >
                        <ClientIonIcon icon="menuOutline" aria-hidden="true" role="img"></ClientIonIcon>
                    </button>

                    <div
                        className={`overlay ${isNavbarActive ? "active" : ""}`}
                        data-nav-toggler
                        data-overlay
                        onClick={toggleNavbar}
                    ></div>
                </div>
            </header>

            {/* Toast Notification - Rendered outside header for proper z-index */}
            <Toast
                isOpen={toastConfig.isOpen}
                onClose={() => setToastConfig({ ...toastConfig, isOpen: false })}
                title={toastConfig.title}
                message={toastConfig.message}
                autoHideDuration={5000}
            />
        </React.Fragment>
    );
};

const NavItem = ({ label }: NavItemProps) => {
    return (
        <li className="navbar-link">
            <Link href={label === "Home" ? "/citizen" : `/citizen/${label.toLowerCase()}`}>
                {label}
            </Link>
        </li>
    );
};

export default Header;

