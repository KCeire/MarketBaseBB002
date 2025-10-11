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
  cryptoExperience: string;
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

const AVERAGE_ORDER_VALUES = [
  { value: '$0-$50', label: '$0 - $50' },
  { value: '$50-$200', label: '$50 - $200' },
  { value: '$200-$500', label: '$200 - $500' },
  { value: '$500-$1000', label: '$500 - $1,000' },
  { value: '$1000+', label: '$1,000+' }
];

const MONTHLY_VOLUMES = [
  { value: '0-100', label: '0 - 100 orders' },
  { value: '100-500', label: '100 - 500 orders' },
  { value: '500-1000', label: '500 - 1,000 orders' },
  { value: '1000-5000', label: '1,000 - 5,000 orders' },
  { value: '5000+', label: '5,000+ orders' }
];

const SELLING_EXPERIENCE_OPTIONS = [
  { value: 'none', label: 'No previous selling experience' },
  { value: 'less_than_1_year', label: 'Less than 1 year' },
  { value: '1-3_years', label: '1-3 years' },
  { value: '3-5_years', label: '3-5 years' },
  { value: '5+_years', label: '5+ years' }
];

const PRODUCT_CATEGORIES = [
  'Electronics', 'Clothing & Fashion', 'Home & Garden', 'Health & Beauty',
  'Sports & Outdoors', 'Food & Beverage', 'Books & Media', 'Toys & Games',
  'Art & Crafts', 'Automotive', 'Pet Supplies', 'Digital Products', 'Other'
];

const CRYPTO_EXPERIENCE_OPTIONS = [
  { value: 'none', label: 'No crypto experience' },
  { value: 'basic', label: 'Basic - Some crypto knowledge' },
  { value: 'intermediate', label: 'Intermediate - Regular crypto user' },
  { value: 'advanced', label: 'Advanced - Very comfortable with crypto' }
];

const MARKETPLACE_PLATFORMS = [
  'Amazon', 'eBay', 'Etsy', 'Shopify', 'WooCommerce', 'BigCommerce',
  'Magento', 'OpenSea', 'Foundation', 'SuperRare', 'Other'
];

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
    cryptoExperience: '',
    hasWallet: false,
    walletAddress: '',
    understands_basepay: false,
    agreeToTerms: false,
    willingToComply: false,
    additionalInfo: ''
  });

  const totalSteps = 5;

  const updateFormData = (field: keyof SellerApplicationData, value: any) => {
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

  const toggleMarketplace = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      marketplaceExperience: prev.marketplaceExperience.includes(platform)
        ? prev.marketplaceExperience.filter(p => p !== platform)
        : [...prev.marketplaceExperience, platform]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.applicantName && formData.applicantEmail && formData.businessName && formData.businessType);
      case 2:
        return !!(formData.businessDescription && formData.businessLocation && formData.productCategories.length > 0);
      case 3:
        return !!(formData.primaryProducts && formData.ecommerceExperience);
      case 4:
        return !!(formData.cryptoExperience && formData.baseNetworkFamiliarity);
      case 5:
        return formData.agreesToTerms && formData.agreesToKyc;
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
        toast.success('Application Submitted!', 'We\'ll review your application and get back to you within 2-3 business days');
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
          cryptoExperience: '',
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
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => updateFormData('applicantName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.applicantEmail}
                  onChange={(e) => updateFormData('applicantEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  <option value="">Select business type</option>
                  {BUSINESS_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Farcaster Username (Optional)
                </label>
                <input
                  type="text"
                  value={formData.farcasterUsername || ''}
                  onChange={(e) => updateFormData('farcasterUsername', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="@yourusername"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Describe your business, what you sell, and your target market"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Location *
                </label>
                <input
                  type="text"
                  value={formData.businessLocation}
                  onChange={(e) => updateFormData('businessLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Country/Region where your business operates"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.businessWebsite || ''}
                  onChange={(e) => updateFormData('businessWebsite', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
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
                  Primary Products *
                </label>
                <textarea
                  value={formData.primaryProducts}
                  onChange={(e) => updateFormData('primaryProducts', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Describe the main products you plan to sell"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-commerce Experience *
                </label>
                <textarea
                  value={formData.ecommerceExperience}
                  onChange={(e) => updateFormData('ecommerceExperience', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Describe your experience selling online, managing inventory, customer service, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estimated Monthly Sales Volume (Optional)
                </label>
                <input
                  type="number"
                  value={formData.estimatedMonthlyVolume || ''}
                  onChange={(e) => updateFormData('estimatedMonthlyVolume', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Expected monthly sales in USD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Previous Marketplace Experience (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MARKETPLACE_PLATFORMS.map(platform => (
                    <label key={platform} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.marketplaceExperience.includes(platform)}
                        onChange={() => toggleMarketplace(platform)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Technical Readiness */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Technical Readiness</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Crypto Experience *
                </label>
                <select
                  value={formData.cryptoExperience}
                  onChange={(e) => updateFormData('cryptoExperience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  <option value="">Select your crypto experience level</option>
                  {CRYPTO_EXPERIENCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Base Network Familiarity *
                </label>
                <textarea
                  value={formData.baseNetworkFamiliarity}
                  onChange={(e) => updateFormData('baseNetworkFamiliarity', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="Are you familiar with Base network? Have you used USDC? Tell us about your experience."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Inventory Management (Optional)
                </label>
                <input
                  type="text"
                  value={formData.inventoryManagementSystem || ''}
                  onChange={(e) => updateFormData('inventoryManagementSystem', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="How do you currently track inventory? (spreadsheet, software, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Contact Method
                </label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={(e) => updateFormData('preferredContactMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                >
                  <option value="email">Email</option>
                  <option value="farcaster">Farcaster</option>
                  <option value="phone">Phone</option>
                </select>
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
                    checked={formData.agreesToTerms}
                    onChange={(e) => updateFormData('agreesToTerms', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the <button className="text-blue-600 hover:underline">Terms of Service</button> and <button className="text-blue-600 hover:underline">Seller Agreement</button> *
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.agreesToKyc}
                    onChange={(e) => updateFormData('agreesToKyc', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I understand that I may need to complete KYC verification and agree to provide additional documentation if required *
                  </span>
                </label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• We'll review your application within 2-3 business days</li>
                  <li>• You'll receive an email with our decision</li>
                  <li>• If approved, we'll guide you through store setup</li>
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