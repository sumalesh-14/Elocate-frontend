"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ClientIonIcon from "@/components/ClientIonIcon";
import logo from "../../../assets/ELocate-s.png"
import { getEmail, getUser, getUserName, handleLogout, isAuthenticated } from "../sign-in/auth";
import { FiUser } from 'react-icons/fi';
import { LayoutDashboard, Menu as MenuIcon, Recycle, LogOut, ChevronDown, Home, Info, Zap, BookOpen, Trash2, GraduationCap, Mail, FileText, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";
import getLocation from "@/lib/utils/getLocation";
import Toast from "../Components/Toast";


interface NavItemProps {
    label: string;
}

const Header = () => {
    const pathname = usePathname();
    const isDashboardRoute = pathname?.startsWith("/citizen/book-recycle");
    const [isNavbarActive, setIsNavbarActive] = useState(false);
    const [isHeaderActive, setIsHeaderActive] = useState(isDashboardRoute ? true : false);
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

                    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
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

                    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`)
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
        if (isDashboardRoute) {
            setIsHeaderActive(true);
            return;
        }

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
    }, [isDashboardRoute]);

    const user = getUser();
    const displayName = user?.username || user?.fullName || user?.email || "User";

    const toggleNavbar = () => {
        setIsNavbarActive(!isNavbarActive);
    };

    return (
        <React.Fragment>
            <header className={`header fixed top-10 left-0 w-full z-50 transition-all duration-300 flex items-center ${isHeaderActive || isDashboardRoute ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-md h-24" : "bg-transparent h-28"}`} data-header>
                <div className="container mx-auto flex items-center px-4 md:px-16">
                    <Link href="/citizen" className="flex items-center gap-3 hover:scale-[1.02] transition-transform flex-shrink-0">
                        <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/50">
                            <Recycle size={24} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">E-Locate</span>
                            <span className="text-[10px] font-bold text-emerald-600 tracking-[0.2em] leading-none mt-1 ml-0.5">ECO-SOLUTION</span>
                        </div>
                    </Link>

                    <nav className={`fixed top-0 right-0 h-full w-full max-w-[300px] bg-white shadow-2xl z-[1001] p-8 flex flex-col gap-8 transition-transform duration-500 ease-in-out md:hidden ${isNavbarActive ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                            <span className="text-xl font-black text-emerald-600 uppercase">Menu</span>
                            <button
                                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                                onClick={toggleNavbar}
                            >
                                <ClientIonIcon icon="closeOutline" className="text-2xl text-slate-600" />
                            </button>
                        </div>

                        <ul className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <MobileNavItem key={item.label} {...item} onClick={toggleNavbar} />
                            ))}
                        </ul>

                        <div className="mt-auto border-t pt-6 border-slate-100">
                            <button
                                onClick={() => { handleLocationClick(); toggleNavbar(); }}
                                className="w-full flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                            >
                                <MapPin size={20} />
                                <span className="text-sm truncate">{locations || 'Set Current Location'}</span>
                            </button>
                        </div>
                    </nav>

                    <nav className="hidden lg:flex items-center gap-8 ml-12">
                        {navItems.map((item) => (
                            <NavItem key={item.label} label={item.label} />
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-4">
                        <button
                            onClick={handleLocationClick}
                            className='hidden xl:flex items-center gap-3 px-6 py-3.5 bg-emerald-50/90 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 hover:shadow-lg hover:shadow-emerald-200/40 transition-all duration-300 group shadow-sm'
                        >
                            <MapPin size={18} className="text-emerald-600 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-black truncate max-w-[200px] uppercase tracking-wider">
                                {locations || 'Set Location'}
                            </span>
                            {!locations && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>}
                        </button>

                        {(mounted && user) ? (
                            <div className="relative group">
                                <button
                                    className="flex items-center gap-3 px-4 py-2 rounded-full border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-300"
                                    onClick={handleToggleDropdown}
                                >
                                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden xl:block text-sm font-black text-slate-700">
                                        {displayName.split(' ')[0]}
                                    </span>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-slate-100 shadow-2xl shadow-emerald-900/10 rounded-2xl overflow-hidden z-[100] animate-slide-in-top">
                                        <div className="px-6 py-5 border-b border-slate-50 bg-gradient-to-br from-emerald-50/50 to-white">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Authenticated</p>
                                            <p className="text-base font-black text-slate-800 truncate">{displayName}</p>
                                            <p className="text-xs text-slate-400 truncate mt-0.5">{getEmail() || 'Citizen Account'}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link href="/citizen/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 group/item">
                                                <div className="p-2 bg-slate-50 group-hover/item:bg-white rounded-lg transition-colors">
                                                    <FiUser className="text-slate-400 group-hover/item:text-emerald-500" size={18} />
                                                </div>
                                                <span>Profile Settings</span>
                                            </Link>
                                            <Link href="/citizen/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 group/item">
                                                <div className="p-2 bg-slate-50 group-hover/item:bg-white rounded-lg transition-colors">
                                                    <LayoutDashboard className="text-slate-400 group-hover/item:text-emerald-500" size={18} />
                                                </div>
                                                <span>Citizen Dashboard</span>
                                            </Link>
                                            <div className="h-px bg-slate-50 my-2 mx-4"></div>
                                            <button
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 group/item"
                                                onClick={handleLogout}
                                            >
                                                <div className="p-2 bg-rose-50/50 group-hover/item:bg-white rounded-lg transition-colors">
                                                    <LogOut className="text-rose-400 group-hover/item:text-rose-500" size={18} />
                                                </div>
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : mounted ? (
                            <div className="flex items-center gap-4">
                                <Link href="/sign-in" className="text-base font-black text-slate-700 hover:text-emerald-600 transition-all duration-300 uppercase tracking-widest px-8">SignIn</Link>
                                <Link href="/citizen/sign-up" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3.5 rounded-2xl text-base font-black shadow-xl shadow-emerald-200/50 transition-all duration-300 hover:scale-105 active:scale-95 uppercase">
                                    Register
                                </Link>
                            </div>
                        ) : null}
                    </div>
                    <button
                        className="nav-open-btn"
                        aria-label="open menu"
                        data-nav-toggler
                        onClick={toggleNavbar}
                    >
                        <ClientIonIcon icon="menuOutline" aria-hidden="true" role="img"></ClientIonIcon>
                    </button>

                    {isDashboardRoute && (
                        <button
                            className="bg-eco-50 p-2 rounded-lg text-eco-900 md:hidden ml-4 flex items-center justify-center shadow-sm border border-eco-100"
                            onClick={() => window.dispatchEvent(new CustomEvent('toggle-citizen-sidebar'))}
                        >
                            <MenuIcon size={20} />
                        </button>
                    )}

                    <div
                        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] transition-opacity duration-500 md:hidden ${isNavbarActive ? "opacity-100 visible" : "opacity-0 invisible"}`}
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

const navItems = [
    { label: "Home", icon: Home },
    { label: "About", icon: Info },
    { label: "E-Facilities", icon: Zap },
    { label: "Book-Recycle", icon: BookOpen },
    { label: "Recycle", icon: Trash2 },
    { label: "Education", icon: GraduationCap },
    { label: "Contactus", icon: Mail },
    { label: "Rules", icon: FileText },
];

const NavItem = ({ label }: NavItemProps) => {
    const pathname = usePathname();
    const href = label === "Home" ? "/citizen" : `/citizen/${label.toLowerCase().replace(/\s+/g, '-')}`;
    const isActive = pathname === href || (label === "Home" && pathname === "/citizen");

    return (
        <li className={`relative group ${isActive ? 'active' : ''}`}>
            <Link
                href={href}
                className={`text-base font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-500'}`}
            >
                {label}
                <span className={`absolute -bottom-2 left-0 h-[2.5px] bg-emerald-500 transition-all duration-300 rounded-full ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
        </li>
    );
};

interface MobileNavItemProps extends NavItemProps {
    icon: any;
    onClick: () => void;
}

const MobileNavItem = ({ label, icon: Icon, onClick }: MobileNavItemProps) => {
    const pathname = usePathname();
    const href = label === "Home" ? "/citizen" : `/citizen/${label.toLowerCase().replace(/\s+/g, '-')}`;
    const isActive = pathname === href || (label === "Home" && pathname === "/citizen");

    return (
        <li>
            <Link
                href={href}
                onClick={onClick}
                className={`flex items-center gap-4 p-4 rounded-xl font-bold transition-all duration-300 ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-500'}`}
            >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                    <Icon size={20} />
                </div>
                <span className="text-base">{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
            </Link>
        </li>
    );
};

export default Header;

