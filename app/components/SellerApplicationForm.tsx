"use client";

import { useState } from 'react';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { toast } from './ui/Toast';

interface SellerApplicationData {
  // Basic Information
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;

  // Business Details
  businessType: string;
  businessDescription: string;
  registrationNumber?: string;
  taxId?: string;
  businessAddress: string;

  // Products & Experience
  productCategories: string[];
  averageOrderValue: string;
  monthlyVolume: string;
  hasOnlineStore: boolean;
  onlineStoreUrl?: string;
  sellingExperience: string;

  // Technical Readiness
  hasWallet: boolean;
  walletAddress?: string;
  understands_basepay: boolean;

  // Terms & Compliance
  agreeToTerms: boolean;
  willingToComply: boolean;
  additionalInfo?: string;
}

interface SellerApplicationFormProps {
  onBack?: () => void;
}

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual/Sole Proprietor' },
  { value: 'small_business', label: 'Small Business' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'nonprofit', label: 'Non-profit Organization' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' }
];

// Removed unused constants - will be added when form steps are implemented

const PRODUCT_CATEGORIES = [
  'Electronics', 'Clothing & Fashion', 'Home & Garden', 'Health & Beauty',
  'Sports & Outdoors', 'Food & Beverage', 'Books & Media', 'Toys & Games',
  'Art & Crafts', 'Automotive', 'Pet Supplies', 'Digital Products', 'Other'
];

// Removed CRYPTO_EXPERIENCE_OPTIONS - no longer needed

// Removed unused MARKETPLACE_PLATFORMS constant

export function SellerApplicationForm({ onBack }: SellerApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SellerApplicationData>({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    businessType: '',
    businessDescription: '',
    registrationNumber: '',
    taxId: '',
    businessAddress: '',
    productCategories: [],
    averageOrderValue: '',
    monthlyVolume: '',
    hasOnlineStore: false,
    onlineStoreUrl: '',
    sellingExperience: '',
    hasWallet: false,
    walletAddress: '',
    understands_basepay: false,
    agreeToTerms: false,
    willingToComply: false,
    additionalInfo: ''
  });

  const totalSteps = 5;

  const updateFormData = (field: keyof SellerApplicationData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }));
  };

  // Removed unused toggleMarketplace function

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.contactName && formData.email && formData.phone && formData.businessName && formData.businessType);
      case 2:
        return !!(formData.businessDescription && formData.businessAddress && formData.productCategories.length > 0);
      case 3:
        return !!(formData.averageOrderValue && formData.monthlyVolume && formData.sellingExperience);
      case 4:
        return !!formData.understands_basepay;
      case 5:
        return formData.agreeToTerms && formData.willingToComply;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fill in all required fields', 'Complete the current section before proceeding');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error('Please complete all required fields', 'Review your application before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/seller-applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Application Submitted!', 'We&apos;ll review your application and get back to you within 2-3 business days');
        if (onBack) onBack();
        // Reset form
        setCurrentStep(1);
        setFormData({
          businessName: '',
          contactName: '',
          email: '',
          phone: '',
          website: '',
          businessType: '',
          businessDescription: '',
          registrationNumber: '',
          taxId: '',
          businessAddress: '',
          productCategories: [],
          averageOrderValue: '',
          monthlyVolume: '',
          hasOnlineStore: false,
          onlineStoreUrl: '',
          sellingExperience: '',
          hasWallet: false,
          walletAddress: '',
          understands_basepay: false,
          agreeToTerms: false,
          willingToComply: false,
          additionalInfo: ''
        });
      } else {
        toast.error('Application Failed', result.error || 'Please try again or contact support');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Network Error', 'Please check your connection and try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Icon name="arrow-left" size="sm" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Seller Application
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => updateFormData('contactName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Your business or brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Type *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => updateFormData('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select business type</option>
                  {BUSINESS_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Business Details</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Description *
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => updateFormData('businessDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Describe your business, what you sell, and your target market"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Address *
                </label>
                <input
                  type="text"
                  value={formData.businessAddress}
                  onChange={(e) => updateFormData('businessAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Full business address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="https://yourbusiness.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Categories * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRODUCT_CATEGORIES.map(category => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.productCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Products & Experience */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Products & Experience</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Average Order Value *
                </label>
                <select
                  value={formData.averageOrderValue}
                  onChange={(e) => updateFormData('averageOrderValue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select average order value</option>
                  <option value="$0-$50">$0 - $50</option>
                  <option value="$50-$200">$50 - $200</option>
                  <option value="$200-$500">$200 - $500</option>
                  <option value="$500-$1000">$500 - $1,000</option>
                  <option value="$1000+">$1,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Volume *
                </label>
                <select
                  value={formData.monthlyVolume}
                  onChange={(e) => updateFormData('monthlyVolume', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select monthly volume</option>
                  <option value="0-100">0 - 100 orders</option>
                  <option value="100-500">100 - 500 orders</option>
                  <option value="500-1000">500 - 1,000 orders</option>
                  <option value="1000-5000">1,000 - 5,000 orders</option>
                  <option value="5000+">5,000+ orders</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Selling Experience *
                </label>
                <select
                  value={formData.sellingExperience}
                  onChange={(e) => updateFormData('sellingExperience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select your selling experience</option>
                  <option value="none">No previous selling experience</option>
                  <option value="less_than_1_year">Less than 1 year</option>
                  <option value="1-3_years">1-3 years</option>
                  <option value="3-5_years">3-5 years</option>
                  <option value="5+_years">5+ years</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.hasOnlineStore}
                    onChange={(e) => updateFormData('hasOnlineStore', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">I have an existing online store</span>
                </label>

                {formData.hasOnlineStore && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Online Store URL
                    </label>
                    <input
                      type="url"
                      value={formData.onlineStoreUrl || ''}
                      onChange={(e) => updateFormData('onlineStoreUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="https://youronlinestore.com"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Technical Readiness */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Technical Readiness</h3>

<div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.hasWallet}
                    onChange={(e) => updateFormData('hasWallet', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">I have a crypto wallet</span>
                </label>

                {formData.hasWallet && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Wallet Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.walletAddress || ''}
                      onChange={(e) => updateFormData('walletAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="0x..."
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.understands_basepay}
                    onChange={(e) => updateFormData('understands_basepay', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">I understand Base network and USDC payments *</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Terms & Compliance */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Terms & Compliance</h3>

              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the <button className="text-blue-600 hover:underline">Terms of Service</button> and <button className="text-blue-600 hover:underline">Seller Agreement</button> *
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.willingToComply}
                    onChange={(e) => updateFormData('willingToComply', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I understand that I may need to complete KYC verification and agree to provide additional documentation if required *
                  </span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    value={formData.additionalInfo || ''}
                    onChange={(e) => updateFormData('additionalInfo', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Any additional information you&apos;d like to share..."
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• We&apos;ll review your application within 2-3 business days</li>
                  <li>• You&apos;ll receive an email with our decision</li>
                  <li>• If approved, we&apos;ll guide you through store setup</li>
                  <li>• We may request additional information or documentation</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <Button
            variant="ghost"
            onClick={currentStep === 1 ? (onBack || (() => {})) : prevStep}
            disabled={isSubmitting}
          >
            {currentStep === 1 ? 'Back' : 'Previous'}
          </Button>

          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={nextStep}
              disabled={!validateStep(currentStep) || isSubmitting}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!validateStep(5) || isSubmitting}
              loading={isSubmitting}
            >
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}