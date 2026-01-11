"use client";

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 font-montserrat">
            <div className="text-center">
                <h1 className="text-5xl font-bold text-emerald-800 mb-4">Welcome to EcoCycle</h1>
                <p className="text-xl text-gray-700 mb-8">Your E-Waste Recycling Solution</p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/sign-in"
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                        Sign In
                    </a>
                    <a
                        href="/citizen"
                        className="px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
                    >
                        Explore as Guest
                    </a>
                </div>
            </div>
        </div>
    );
}