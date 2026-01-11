"use client";
import React, { useState } from "react";
import Link from "next/link";
import DashboardSidebar from "../../Components/DashboardSidebar";
import {
    MdLaptopMac,
    MdSmartphone,
    MdPrint,
    MdTv,
    MdHeadphones,
    MdWatch,
    MdKeyboard,
    MdDevicesOther,
    MdArrowBack,
    MdArrowForward,
    MdCheckCircle,
    MdCalendarToday,
    MdLocationOn,
    MdInfo,
} from "react-icons/md";
import { useRouter } from "next/navigation";

// TypeScript Interfaces
interface DeviceType {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
}

interface FormData {
    deviceType: string;
    deviceBrand: string;
    deviceModel: string;
    deviceCondition: string;
    quantity: number;
    additionalNotes: string;
    pickupDate: string;
    pickupTime: string;
    address: string;
    city: string;
    zipCode: string;
    phoneNumber: string;
}

const RecycleRequestForm = () => {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        deviceType: "",
        deviceBrand: "",
        deviceModel: "",
        deviceCondition: "",
        quantity: 1,
        additionalNotes: "",
        pickupDate: "",
        pickupTime: "",
        address: "",
        city: "",
        zipCode: "",
        phoneNumber: "",
    });

    const deviceTypes: DeviceType[] = [
        {
            id: "laptop",
            name: "Laptop",
            icon: <MdLaptopMac className="text-4xl" />,
            description: "Notebooks, MacBooks, etc.",
        },
        {
            id: "smartphone",
            name: "Smartphone",
            icon: <MdSmartphone className="text-4xl" />,
            description: "iPhones, Android phones",
        },
        {
            id: "printer",
            name: "Printer",
            icon: <MdPrint className="text-4xl" />,
            description: "Inkjet, Laser printers",
        },
        {
            id: "tv",
            name: "Television",
            icon: <MdTv className="text-4xl" />,
            description: "LED, LCD, Plasma TVs",
        },
        {
            id: "headphones",
            name: "Audio Devices",
            icon: <MdHeadphones className="text-4xl" />,
            description: "Headphones, Speakers",
        },
        {
            id: "smartwatch",
            name: "Wearables",
            icon: <MdWatch className="text-4xl" />,
            description: "Smartwatches, Fitness bands",
        },
        {
            id: "keyboard",
            name: "Peripherals",
            icon: <MdKeyboard className="text-4xl" />,
            description: "Keyboards, Mice, etc.",
        },
        {
            id: "other",
            name: "Other",
            icon: <MdDevicesOther className="text-4xl" />,
            description: "Other electronic devices",
        },
    ];

    const deviceConditions = [
        { value: "working", label: "Working", description: "Device is fully functional" },
        { value: "minor-issues", label: "Minor Issues", description: "Small defects, mostly working" },
        { value: "broken", label: "Broken", description: "Not working or severely damaged" },
        { value: "parts-only", label: "Parts Only", description: "For parts or scrap" },
    ];

    const timeSlots = [
        "09:00 AM - 11:00 AM",
        "11:00 AM - 01:00 PM",
        "01:00 PM - 03:00 PM",
        "03:00 PM - 05:00 PM",
        "05:00 PM - 07:00 PM",
    ];

    const steps = [
        { number: 1, title: "Device Type", description: "Select device category" },
        { number: 2, title: "Device Details", description: "Provide device information" },
        { number: 3, title: "Pickup Schedule", description: "Choose date and time" },
        { number: 4, title: "Address", description: "Confirm pickup location" },
        { number: 5, title: "Review", description: "Review and submit" },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Validate phone number to allow only numbers and common phone formatting characters
        if (name === "phoneNumber") {
            // Allow only digits, +, -, (, ), and spaces
            const phoneRegex = /^[0-9+\-() ]*$/;
            if (!phoneRegex.test(value)) {
                return; // Don't update if invalid characters are entered
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDeviceTypeSelect = (deviceId: string) => {
        setFormData((prev) => ({ ...prev, deviceType: deviceId }));
    };

    const nextStep = () => {
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        // TODO: Implement API call to submit the form
        console.log("Form submitted:", formData);
        alert("Recycle request submitted successfully!");
        router.push("/citizen/book-recycle/requests");
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.deviceType !== "";
            case 2:
                return formData.deviceBrand !== "" && formData.deviceModel !== "" && formData.deviceCondition !== "";
            case 3:
                return formData.pickupDate !== "" && formData.pickupTime !== "";
            case 4:
                return formData.address !== "" && formData.city !== "" && formData.zipCode !== "" && formData.phoneNumber !== "";
            default:
                return true;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="flex flex-1">
                <DashboardSidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />

                <main className="flex-1 h-full flex flex-col overflow-hidden bg-gray-50 md:ml-80">
                    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8">
                        <div className="max-w-5xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <Link
                                    href="/citizen/book-recycle"
                                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-4 transition-colors"
                                >
                                    <MdArrowBack className="text-xl" />
                                    Back to Dashboard
                                </Link>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">New Recycle Request</h1>
                                <p className="text-xl text-gray-600">
                                    Schedule a pickup for your electronic waste in just a few steps
                                </p>
                            </div>

                            {/* Progress Steps */}
                            <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    {steps.map((step, index) => (
                                        <React.Fragment key={step.number}>
                                            <div className="flex flex-col items-center flex-1">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${currentStep > step.number
                                                        ? "bg-green-500 text-white"
                                                        : currentStep === step.number
                                                            ? "bg-green-500 text-white ring-4 ring-green-100"
                                                            : "bg-gray-200 text-gray-500"
                                                        }`}
                                                >
                                                    {currentStep > step.number ? <MdCheckCircle className="text-2xl" /> : step.number}
                                                </div>
                                                <p
                                                    className={`mt-2 text-sm font-medium text-center hidden md:block ${currentStep >= step.number ? "text-gray-900" : "text-gray-500"
                                                        }`}
                                                >
                                                    {step.title}
                                                </p>
                                                <p className="text-xs text-gray-400 text-center hidden lg:block">{step.description}</p>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div
                                                    className={`h-1 flex-1 mx-2 rounded transition-all ${currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                                                        }`}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
                                {/* Step 1: Device Type Selection */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Device Type</h2>
                                            <p className="text-gray-600">Choose the category that best matches your device</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {deviceTypes.map((device) => (
                                                <button
                                                    key={device.id}
                                                    onClick={() => handleDeviceTypeSelect(device.id)}
                                                    className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${formData.deviceType === device.id
                                                        ? "border-green-500 bg-green-50 shadow-md"
                                                        : "border-gray-200 hover:border-green-300"
                                                        }`}
                                                >
                                                    <div
                                                        className={`${formData.deviceType === device.id ? "text-green-600" : "text-gray-600"
                                                            } mb-3`}
                                                    >
                                                        {device.icon}
                                                    </div>
                                                    <h3 className="font-semibold text-gray-900 mb-1">{device.name}</h3>
                                                    <p className="text-xs text-gray-500">{device.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Device Details */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Details</h2>
                                            <p className="text-gray-600">Tell us more about your device</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Device Brand <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="deviceBrand"
                                                    value={formData.deviceBrand}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Apple, Samsung, HP"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Device Model <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="deviceModel"
                                                    value={formData.deviceModel}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., MacBook Pro 2020, Galaxy S21"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Device Condition <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {deviceConditions.map((condition) => (
                                                    <button
                                                        key={condition.value}
                                                        onClick={() => setFormData((prev) => ({ ...prev, deviceCondition: condition.value }))}
                                                        className={`p-4 rounded-lg border-2 text-left transition-all ${formData.deviceCondition === condition.value
                                                            ? "border-green-500 bg-green-50"
                                                            : "border-gray-200 hover:border-green-300"
                                                            }`}
                                                    >
                                                        <h4 className="font-semibold text-gray-900 mb-1">{condition.label}</h4>
                                                        <p className="text-sm text-gray-500">{condition.description}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="50"
                                                className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Additional Notes (Optional)
                                            </label>
                                            <textarea
                                                name="additionalNotes"
                                                value={formData.additionalNotes}
                                                onChange={handleInputChange}
                                                rows={4}
                                                placeholder="Any additional information about the device..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Pickup Schedule */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Pickup</h2>
                                            <p className="text-gray-600">Choose a convenient date and time for pickup</p>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                                            <MdInfo className="text-blue-600 text-xl mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm text-blue-900 font-medium">Pickup Information</p>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Our team will arrive during your selected time slot. Please ensure someone is available to hand over the device.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Pickup Date <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                                                    <input
                                                        type="date"
                                                        name="pickupDate"
                                                        value={formData.pickupDate}
                                                        onChange={handleInputChange}
                                                        min={new Date().toISOString().split("T")[0]}
                                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Pickup Time Slot <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {timeSlots.map((slot) => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setFormData((prev) => ({ ...prev, pickupTime: slot }))}
                                                        className={`p-4 rounded-lg border-2 text-left font-medium transition-all ${formData.pickupTime === slot
                                                            ? "border-green-500 bg-green-50 text-green-700"
                                                            : "border-gray-200 hover:border-green-300 text-gray-700"
                                                            }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Address */}
                                {currentStep === 4 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pickup Address</h2>
                                            <p className="text-gray-600">Confirm your pickup location</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Street Address <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <MdLocationOn className="absolute left-3 top-4 text-gray-400 text-xl" />
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    placeholder="Enter your complete address"
                                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    City <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., San Francisco"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ZIP Code <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="zipCode"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., 94103"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                placeholder="e.g., +1 (555) 123-4567"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Review */}
                                {currentStep === 5 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Request</h2>
                                            <p className="text-gray-600">Please review all details before submitting</p>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Device Information */}
                                            <div className="bg-gray-50 rounded-lg p-6">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <MdLaptopMac className="text-green-600" />
                                                    Device Information
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Device Type</p>
                                                        <p className="font-medium text-gray-900 capitalize">{formData.deviceType}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Brand</p>
                                                        <p className="font-medium text-gray-900">{formData.deviceBrand}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Model</p>
                                                        <p className="font-medium text-gray-900">{formData.deviceModel}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Condition</p>
                                                        <p className="font-medium text-gray-900 capitalize">{formData.deviceCondition.replace("-", " ")}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Quantity</p>
                                                        <p className="font-medium text-gray-900">{formData.quantity}</p>
                                                    </div>
                                                </div>
                                                {formData.additionalNotes && (
                                                    <div className="mt-4">
                                                        <p className="text-gray-500 text-sm">Additional Notes</p>
                                                        <p className="font-medium text-gray-900 text-sm mt-1">{formData.additionalNotes}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Pickup Details */}
                                            <div className="bg-gray-50 rounded-lg p-6">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <MdCalendarToday className="text-green-600" />
                                                    Pickup Schedule
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Date</p>
                                                        <p className="font-medium text-gray-900">{formData.pickupDate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Time Slot</p>
                                                        <p className="font-medium text-gray-900">{formData.pickupTime}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Details */}
                                            <div className="bg-gray-50 rounded-lg p-6">
                                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <MdLocationOn className="text-green-600" />
                                                    Pickup Address
                                                </h3>
                                                <div className="text-sm space-y-2">
                                                    <p className="font-medium text-gray-900">{formData.address}</p>
                                                    <p className="text-gray-700">
                                                        {formData.city}, {formData.zipCode}
                                                    </p>
                                                    <p className="text-gray-700">Phone: {formData.phoneNumber}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                                            <MdCheckCircle className="text-green-600 text-xl mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm text-green-900 font-medium">Ready to Submit</p>
                                                <p className="text-sm text-green-700 mt-1">
                                                    By submitting this request, you agree to our terms and conditions for e-waste recycling.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${currentStep === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <MdArrowBack />
                                    Previous
                                </button>

                                {currentStep < 5 ? (
                                    <button
                                        onClick={nextStep}
                                        disabled={!isStepValid()}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${isStepValid()
                                            ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        Next
                                        <MdArrowForward />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md transition-all"
                                    >
                                        <MdCheckCircle />
                                        Submit Request
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RecycleRequestForm;
