import React, { useState } from 'react';
import { 
  Laptop, Smartphone, Printer, Tv, Headphones, Watch, Keyboard, HardDrive, 
  ArrowRight, ArrowLeft, Upload, Check, MapPin, Calendar, Clock, Truck, Package
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

// --- Types ---
type Step = 1 | 2 | 3 | 4 | 5;
type DeviceType = 'Laptop' | 'Smartphone' | 'Printer' | 'Television' | 'Audio' | 'Wearables' | 'Peripherals' | 'Other';
type Condition = 'Working' | 'Minor Issues' | 'Broken' | 'Parts Only';
type ServiceType = 'Pickup' | 'Dropoff';

interface FormData {
  deviceType: DeviceType | null;
  brand: string;
  model: string;
  condition: Condition | null;
  quantity: number;
  notes: string;
  serviceType: ServiceType | null;
  pickupDate: string;
  pickupTime: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

const INITIAL_DATA: FormData = {
  deviceType: null,
  brand: '',
  model: '',
  condition: null,
  quantity: 1,
  notes: '',
  serviceType: null,
  pickupDate: '',
  pickupTime: '',
  address: '',
  contactName: 'John Doe', // Dummy auto-populated
  contactEmail: 'john.doe@example.com', // Dummy auto-populated
  contactPhone: '+1 (555) 123-4567', // Dummy auto-populated
};

export const NewRecycleRequest: React.FC = () => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    showToast('Recycle request submitted successfully!', 'success');
    // Ideally redirect or reset
    setCurrentStep(1);
    setFormData(INITIAL_DATA);
  };

  // --- Step Components ---

  const Step1_DeviceType = () => {
    const devices: { type: DeviceType; icon: any; desc: string }[] = [
      { type: 'Laptop', icon: Laptop, desc: 'Notebooks, MacBooks' },
      { type: 'Smartphone', icon: Smartphone, desc: 'iPhones, Androids' },
      { type: 'Printer', icon: Printer, desc: 'Inkjet, Laser' },
      { type: 'Television', icon: Tv, desc: 'LED, LCD, Plasma' },
      { type: 'Audio', icon: Headphones, desc: 'Speakers, Headsets' },
      { type: 'Wearables', icon: Watch, desc: 'Smartwatches, Bands' },
      { type: 'Peripherals', icon: Keyboard, desc: 'Mice, Keyboards' },
      { type: 'Other', icon: HardDrive, desc: 'Misc Electronics' },
    ];

    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Select Device Type</h2>
          <p className="text-gray-500">Choose the category that best matches your device</p>
        </div>

        {/* Photo Upload Option */}
        <div className="bg-eco-50 border-2 border-dashed border-eco-200 rounded-2xl p-8 text-center hover:bg-eco-100/50 transition-colors cursor-pointer group">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-eco-600 shadow-sm group-hover:scale-110 transition-transform">
            <Upload size={24} />
          </div>
          <h3 className="font-semibold text-eco-900">Upload a Photo</h3>
          <p className="text-sm text-eco-600 mt-1">Our AI will automatically identify your device</p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Or select manually</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {devices.map((device) => {
            const Icon = device.icon;
            const isSelected = formData.deviceType === device.type;
            return (
              <button
                key={device.type}
                onClick={() => updateField('deviceType', device.type)}
                className={`
                  p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md flex flex-col items-center text-center gap-4
                  ${isSelected 
                    ? 'border-eco-500 bg-eco-50 ring-1 ring-eco-500' 
                    : 'border-gray-100 bg-white hover:border-eco-200'}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                  ${isSelected ? 'bg-eco-500 text-white' : 'bg-gray-50 text-gray-500'}
                `}>
                  <Icon size={24} />
                </div>
                <div>
                  <div className={`font-bold ${isSelected ? 'text-eco-900' : 'text-gray-900'}`}>{device.type}</div>
                  <div className="text-xs text-gray-500 mt-1">{device.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const Step2_DeviceDetails = () => {
    const conditions: { val: Condition; label: string; desc: string }[] = [
      { val: 'Working', label: 'Working', desc: 'Device is fully functional' },
      { val: 'Minor Issues', label: 'Minor Issues', desc: 'Small defects, mostly working' },
      { val: 'Broken', label: 'Broken', desc: 'Not working or severely damaged' },
      { val: 'Parts Only', label: 'Parts Only', desc: 'For parts or scrap' },
    ];

    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Device Details</h2>
          <p className="text-gray-500">Tell us more about your device</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Device Brand <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.brand}
              onChange={(e) => updateField('brand', e.target.value)}
              placeholder="e.g., Apple, Samsung, HP"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Device Model <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.model}
              onChange={(e) => updateField('model', e.target.value)}
              placeholder="e.g., MacBook Pro 2020"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Device Condition <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conditions.map((cond) => (
              <button
                key={cond.val}
                onClick={() => updateField('condition', cond.val)}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm
                  ${formData.condition === cond.val 
                    ? 'border-eco-500 bg-eco-50' 
                    : 'border-gray-100 bg-white hover:border-eco-200'}
                `}
              >
                <div className={`font-bold ${formData.condition === cond.val ? 'text-eco-900' : 'text-gray-900'}`}>{cond.label}</div>
                <div className="text-xs text-gray-500 mt-1">{cond.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Quantity</label>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => updateField('quantity', Math.max(1, formData.quantity - 1))}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600"
            >
              -
            </button>
            <span className="text-xl font-bold text-gray-900 w-8 text-center">{formData.quantity}</span>
            <button 
              onClick={() => updateField('quantity', formData.quantity + 1)}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Additional Notes (Optional)</label>
          <textarea 
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Any additional information about the device..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all resize-none"
          />
        </div>
      </div>
    );
  };

  const Step3_ServiceType = () => {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Pickup or Drop-off?</h2>
          <p className="text-gray-500">Choose how you want to recycle your device</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => updateField('serviceType', 'Pickup')}
            className={`
              p-8 rounded-2xl border-2 text-left transition-all hover:shadow-lg group relative overflow-hidden
              ${formData.serviceType === 'Pickup' 
                ? 'border-eco-500 bg-eco-50' 
                : 'border-gray-100 bg-white hover:border-eco-200'}
            `}
          >
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors
              ${formData.serviceType === 'Pickup' ? 'bg-eco-500 text-white' : 'bg-gray-100 text-gray-500'}
            `}>
              <Truck size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Pickup</h3>
            <p className="text-gray-500 text-sm leading-relaxed">We'll come to your location to collect your e-waste. Convenient and hassle-free.</p>
            {formData.serviceType === 'Pickup' && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-eco-500 rounded-full flex items-center justify-center text-white">
                <Check size={14} />
              </div>
            )}
          </button>

          <button
            onClick={() => updateField('serviceType', 'Dropoff')}
            className={`
              p-8 rounded-2xl border-2 text-left transition-all hover:shadow-lg group relative overflow-hidden
              ${formData.serviceType === 'Dropoff' 
                ? 'border-eco-500 bg-eco-50' 
                : 'border-gray-100 bg-white hover:border-eco-200'}
            `}
          >
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors
              ${formData.serviceType === 'Dropoff' ? 'bg-eco-500 text-white' : 'bg-gray-100 text-gray-500'}
            `}>
              <Package size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Drop-off Location</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Find a certified recycling center near you and drop off your items anytime.</p>
            {formData.serviceType === 'Dropoff' && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-eco-500 rounded-full flex items-center justify-center text-white">
                <Check size={14} />
              </div>
            )}
          </button>
        </div>

        {formData.serviceType === 'Pickup' && (
          <div className="pt-6 border-t border-gray-100 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Preferred Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={formData.pickupDate}
                    onChange={(e) => updateField('pickupDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Preferred Time Slot</label>
                <div className="relative">
                  <select 
                    value={formData.pickupTime}
                    onChange={(e) => updateField('pickupTime', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all appearance-none bg-white"
                  >
                    <option value="">Select a time...</option>
                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                    <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                  </select>
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Step4_Address = () => {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {formData.serviceType === 'Pickup' ? 'Pickup Location' : 'Your Location'}
          </h2>
          <p className="text-gray-500">
            {formData.serviceType === 'Pickup' 
              ? 'Where should we collect the items from?' 
              : 'We need your address to find the nearest drop-off point.'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Enter your full address"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 transition-all"
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input 
                  type="text" 
                  value={formData.contactName}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  value={formData.contactEmail}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.contactPhone}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Step5_Review = () => {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
          <p className="text-gray-500">Please verify your request details before submitting</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900">Request Summary</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
              {formData.serviceType}
            </span>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Device Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium text-gray-900">{formData.deviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand/Model</span>
                    <span className="font-medium text-gray-900">{formData.brand} {formData.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-medium text-gray-900">{formData.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium text-gray-900">{formData.quantity}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Logistics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service</span>
                    <span className="font-medium text-gray-900">{formData.serviceType}</span>
                  </div>
                  {formData.serviceType === 'Pickup' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium text-gray-900">{formData.pickupDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time</span>
                        <span className="font-medium text-gray-900">{formData.pickupTime}</span>
                      </div>
                    </>
                  )}
                  <div className="flex flex-col mt-2">
                    <span className="text-gray-600 text-sm mb-1">Address</span>
                    <span className="font-medium text-gray-900 text-right">{formData.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {formData.notes && (
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Additional Notes</h4>
                <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-xl">{formData.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <button className="flex items-center gap-2 text-eco-600 font-medium mb-6 hover:underline">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-eco-950">New Recycle Request</h1>
        <p className="text-gray-500 mt-2">Schedule a pickup for your electronic waste in just a few steps</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center relative">
          {/* Progress Bar Background */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
          
          {/* Steps */}
          {[
            { num: 1, label: 'Device Type' },
            { num: 2, label: 'Device Details' },
            { num: 3, label: 'Pickup Schedule' },
            { num: 4, label: 'Address' },
            { num: 5, label: 'Review' }
          ].map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            
            return (
              <div key={step.num} className="flex flex-col items-center bg-white px-2">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                  ${isActive 
                    ? 'bg-eco-500 border-eco-500 text-white scale-110 shadow-lg shadow-eco-500/30' 
                    : isCompleted 
                      ? 'bg-eco-100 border-eco-500 text-eco-700' 
                      : 'bg-white border-gray-200 text-gray-400'}
                `}>
                  {isCompleted ? <Check size={16} /> : step.num}
                </div>
                <span className={`
                  text-xs font-medium mt-2 transition-colors duration-300 hidden sm:block
                  ${isActive ? 'text-eco-900' : isCompleted ? 'text-eco-700' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 md:p-12 min-h-[400px]">
        {currentStep === 1 && <Step1_DeviceType />}
        {currentStep === 2 && <Step2_DeviceDetails />}
        {currentStep === 3 && <Step3_ServiceType />}
        {currentStep === 4 && <Step4_Address />}
        {currentStep === 5 && <Step5_Review />}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className={`
              px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2
              ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}
            `}
          >
            <ArrowLeft size={18} /> Previous
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !formData.deviceType) ||
                (currentStep === 2 && (!formData.brand || !formData.model || !formData.condition)) ||
                (currentStep === 3 && !formData.serviceType) ||
                (currentStep === 3 && formData.serviceType === 'Pickup' && (!formData.pickupDate || !formData.pickupTime)) ||
                (currentStep === 4 && !formData.address)
              }
              className="px-8 py-3 bg-eco-900 text-white rounded-xl font-bold hover:bg-eco-800 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-eco-500 text-white rounded-xl font-bold hover:bg-eco-600 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>Submit Request <Check size={18} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
