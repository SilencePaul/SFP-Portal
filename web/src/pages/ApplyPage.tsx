import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { z } from 'zod';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the form schema using Zod
const adoptionFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required").max(20),
  address: z.string().min(5, "Address is required").max(200),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  zipCode: z.string().min(5, "ZIP code is required").max(20),
  householdType: z.string().min(1, "Please select a household type"),
  hasChildren: z.boolean(),
  childrenAges: z.string().optional(),
  hasOtherPets: z.boolean(),
  otherPetsDetails: z.string().optional(),
  experienceWithPets: z.string().min(1, "Please select your experience level"),
  hoursAway: z.string().min(1, "Please select how many hours you're away"),
  reasonForAdoption: z.string().min(10, "Please provide a reason for adoption").max(500),
  emergencyContactName: z.string().min(2, "Emergency contact name is required").max(100),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required").max(20),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
});

type AdoptionFormData = z.infer<typeof adoptionFormSchema>;

const toSnakeCase = (obj: any) => {
  const map: Record<string, string> = {
    fullName: 'full_name',
    email: 'email',
    phone: 'phone',
    address: 'address',
    city: 'city',
    state: 'state',
    zipCode: 'zip_code',
    householdType: 'household_type',
    hasChildren: 'has_children',
    childrenAges: 'children_ages',
    hasOtherPets: 'has_other_pets',
    otherPetsDetails: 'other_pets_details',
    experienceWithPets: 'experience_with_pets',
    hoursAway: 'hours_away',
    reasonForAdoption: 'reason_for_adoption',
    emergencyContactName: 'emergency_contact_name',
    emergencyContactPhone: 'emergency_contact_phone',
    agreeToTerms: 'agreed_to_terms',
  };
  const out: any = {};
  Object.keys(obj).forEach((key) => {
    out[map[key] || key] = obj[key];
  });
  return out;
};

export default function ApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<AdoptionFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    householdType: '',
    hasChildren: false,
    childrenAges: '',
    hasOtherPets: false,
    otherPetsDetails: '',
    experienceWithPets: '',
    hoursAway: '',
    reasonForAdoption: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    agreeToTerms: false,
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof AdoptionFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError('');
      fetch(`${API_BASE_URL}/api/animals/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch animal');
          return res.json();
        })
        .then(data => {
          setAnimal({
            id: data.id,
            uniqueId: data.unique_id || data.uniqueId,
            name: data.name,
            species: data.species,
            breed: data.breed,
            age: data.age,
            sex: data.sex,
            size: data.size,
            color: data.color,
            description: data.description,
            personality: Array.isArray(data.personality) ? data.personality : [],
            imageUrls: data.image_urls || data.imageUrls || [],
            adoptionFee: data.adoption_fee || data.adoptionFee,
            intakeDate: data.intake_date || data.intakeDate,
            postedDate: data.posted_date || data.postedDate,
            status: data.status,
            adoptionDate: data.adoption_date || data.adoptionDate,
            adoptionStory: data.adoption_story || data.adoptionStory,
            goodWith: {
              children: data.good_with_children ?? false,
              dogs: data.good_with_dogs ?? false,
              cats: data.good_with_cats ?? false,
            },
            location: data.location,
            vaccinated: data.vaccinated ?? false,
            neutered: data.neutered ?? false,
          });
        })
        .catch(() => setError('Could not load animal details.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen py-12 bg-white dark:bg-gray-900 text-center text-lg text-gray-500">Loading animal details...</div>;
  }
  
  if (error || !animal) {
    return (
      <div className="min-h-screen py-12 bg-[#FFDF4] dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-search text-gray-400 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Animal Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                We couldn't find the animal you're looking for. It might have been adopted or removed from our system.
              </p>
              <a 
                href="/adoptables" 
                className="bg-[#4C51A4] hover:bg-[#383C80] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Browse Available Animals
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof AdoptionFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // Clear error when user toggles checkbox
    if (errors[name as keyof AdoptionFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    try {
      adoptionFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof AdoptionFormData, string>> = {};
        error.errors.forEach(err => {
          newErrors[err.path[0] as keyof AdoptionFormData] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    // Prepare payload: set empty optional fields to null
    const rawPayload = toSnakeCase(formData);
    const payload = {
      animal_id: animal.uniqueId,
      ...rawPayload,
      children_ages: formData.hasChildren && (formData.childrenAges ?? '').trim() ? formData.childrenAges : null,
      other_pets_details: formData.hasOtherPets && (formData.otherPetsDetails ?? '').trim() ? formData.otherPetsDetails : null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log(response);
      if (!response.ok) throw new Error('Failed to submit application');
      await response.json();
      toast.success(`Your application to adopt ${animal.name} (${animal.uniqueId}) has been submitted successfully!`);
      setTimeout(() => {
        navigate(`/animal/${animal.uniqueId}`);
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="bg-primary text-white p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Apply to Adopt {animal.name}</h1>
            <div className="flex items-center text-white/90">
              <span className="mr-2">Animal ID: {animal.uniqueId}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{animal.species} • {animal.age} • {animal.sex}</span>
            </div>
          </div>
          
          {/* Pet Info Card */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={animal.imageUrls[0]} 
                  alt={animal.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{animal.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">{animal.breed}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{animal.description.substring(0, 100)}...</p>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.fullName 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  />
                  {errors.fullName && (
                    <p id="fullName-error" className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.email 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.phone 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.zipCode 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.zipCode}
                    aria-describedby={errors.zipCode ? "zipCode-error" : undefined}
                  />
                  {errors.zipCode && (
                    <p id="zipCode-error" className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.address 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                  } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                  aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? "address-error" : undefined}
                />
                {errors.address && (
                  <p id="address-error" className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.city 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? "city-error" : undefined}
                  />
                  {errors.city && (
                    <p id="city-error" className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State/Province</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.state 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.state}
                    aria-describedby={errors.state ? "state-error" : undefined}
                  />
                  {errors.state && (
                    <p id="state-error" className="mt-1 text-sm text-red-500">{errors.state}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Home Environment */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Home Environment</h3>
              
              <div>
                <label htmlFor="householdType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Household Type</label>
                <select
                  id="householdType"
                  name="householdType"
                  value={formData.householdType}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.householdType 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                  } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none`}
                  aria-invalid={!!errors.householdType}
                  aria-describedby={errors.householdType ? "householdType-error" : undefined}
                >
                  <option value="">Select your household type</option>
                  <option value="apartment">Apartment/Condo</option>
                  <option value="house">House with Yard</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="other">Other</option>
                </select>
                {errors.householdType && (
                  <p id="householdType-error" className="mt-1 text-sm text-red-500">{errors.householdType}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasChildren"
                  name="hasChildren"
                  checked={formData.hasChildren}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                />
                <label htmlFor="hasChildren" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Do you have children in your home?
                </label>
              </div>
              
              {formData.hasChildren && (
                <div className="pl-6">
                  <label htmlFor="childrenAges" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ages of children (e.g., "5, 8, 12")
                  </label>
                  <input
                    type="text"
                    id="childrenAges"
                    name="childrenAges"
                    value={formData.childrenAges}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasOtherPets"
                  name="hasOtherPets"
                  checked={formData.hasOtherPets}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                />
                <label htmlFor="hasOtherPets" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Do you have other pets?
                </label>
              </div>
              
              {formData.hasOtherPets && (
                <div className="pl-6">
                  <label htmlFor="otherPetsDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Please describe your other pets (type, breed, age, temperament)
                  </label>
                  <textarea
                    id="otherPetsDetails"
                    name="otherPetsDetails"
                    value={formData.otherPetsDetails}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  ></textarea>
                </div>
              )}
            </div>
            
            {/* Pet Experience */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Pet Experience</h3>
              
              <div>
                <label htmlFor="experienceWithPets" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previous Experience with Pets</label>
                <select
                  id="experienceWithPets"
                  name="experienceWithPets"
                  value={formData.experienceWithPets}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.experienceWithPets 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                  } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none`}
                  aria-invalid={!!errors.experienceWithPets}
                  aria-describedby={errors.experienceWithPets ? "experienceWithPets-error" : undefined}
                >
                  <option value="">Select your experience level</option>
                  <option value="none">No experience</option>
                  <option value="limited">Limited experience</option>
                  <option value="some">Some experience</option>
                  <option value="experienced">Experienced</option>
                  <option value="very">Very experienced</option>
                </select>
                {errors.experienceWithPets && (
                  <p id="experienceWithPets-error" className="mt-1 text-sm text-red-500">{errors.experienceWithPets}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="hoursAway" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">How many hours per day are you typically away from home?</label>
                <select
                  id="hoursAway"
                  name="hoursAway"
                  value={formData.hoursAway}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.hoursAway 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                  } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none`}
                  aria-invalid={!!errors.hoursAway}
                  aria-describedby={errors.hoursAway ? "hoursAway-error" : undefined}
                >
                  <option value="">Select hours</option>
                  <option value="0-2">0-2 hours</option>
                  <option value="3-5">3-5 hours</option>
                  <option value="6-8">6-8 hours</option>
                  <option value="9-12">9-12 hours</option>
                  <option value="13+">13+ hours</option>
                </select>
                {errors.hoursAway && (
                  <p id="hoursAway-error" className="mt-1 text-sm text-red-500">{errors.hoursAway}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="reasonForAdoption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Why do you want to adopt {animal.name}?</label>
                <textarea
                  id="reasonForAdoption"
                  name="reasonForAdoption"
                  value={formData.reasonForAdoption}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.reasonForAdoption 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                  } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                  aria-invalid={!!errors.reasonForAdoption}
                  aria-describedby={errors.reasonForAdoption ? "reasonForAdoption-error" : undefined}
                ></textarea>
                {errors.reasonForAdoption && (
                  <p id="reasonForAdoption-error" className="mt-1 text-sm text-red-500">{errors.reasonForAdoption}</p>
                )}
              </div>
            </div>
            
            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.emergencyContactName 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.emergencyContactName}
                    aria-describedby={errors.emergencyContactName ? "emergencyContactName-error" : undefined}
                  />
                  {errors.emergencyContactName && (
                    <p id="emergencyContactName-error" className="mt-1 text-sm text-red-500">{errors.emergencyContactName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.emergencyContactPhone 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.emergencyContactPhone}
                    aria-describedby={errors.emergencyContactPhone ? "emergencyContactPhone-error" : undefined}
                  />
                  {errors.emergencyContactPhone && (
                    <p id="emergencyContactPhone-error" className="mt-1 text-sm text-red-500">{errors.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                    aria-invalid={!!errors.agreeToTerms}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-gray-700 dark:text-gray-300">
                    I agree to the terms and conditions of adoption
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>
                  )}<p className="text-gray-500 dark:text-gray-400">
                    By submitting this application, I confirm that all information provided is true and accurate. I understand that an interview and home check may be required.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
               <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#4C51A4] hover:bg-[#383C80] text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane mr-2"></i>
                    Submit Adoption Application
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}