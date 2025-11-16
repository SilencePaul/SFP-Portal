import { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '@/contexts/authContext';
import { getAnimalById } from '@/data/mockAnimals';
import { toast } from 'sonner';
import { z } from 'zod';

// Define contract form validation schema
const contractFormSchema = z.object({
  firstName: z.string().min(2, "First name is required").max(100),
  lastName: z.string().min(2, "Last name is required").max(100),
  address: z.string().min(5, "Address is required").max(200),
  city: z.string().min(2, "City is required").max(100),
  province: z.string().min(2, "Province is required").max(100),
  postalCode: z.string().min(5, "Postal code is required").max(20),
  phone: z.string().min(10, "Phone number is required").max(20),
  email: z.string().email("Invalid email address"),
  confirmEmail: z.string().email("Invalid email address"),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  signature: z.string().min(1, "Please provide your signature"),
});

type ContractFormData = z.infer<typeof contractFormSchema>;

export default function SignContractPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const animal = getAnimalById(id || '');
  
  // Form state
  const [formData, setFormData] = useState<ContractFormData>({
    firstName: currentUser?.name.split(' ')[0] || '',
    lastName: currentUser?.name.split(' ')[1] || '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: '',
    email: currentUser?.email || '',
    confirmEmail: currentUser?.email || '',
    acceptTerms: false,
    signature: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ContractFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emrProof, setEmrProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [signatureMethod, setSignatureMethod] = useState<'typed' | 'canvas'>('typed');
  
  // Canvas related refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas style
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);
  
  if (!animal) {
    return (
     <div className="min-h-screen py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-search text-gray-400 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Animal Not Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                We couldn't find the animal you are looking for. It may have been adopted or removed from our system.
              </p>
              <a 
                href="/adoptables" 
                className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Browse Adoptable Animals
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // When user starts typing, clear error
    if (errors[name as keyof ContractFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // When user toggles checkbox, clear error
    if (errors[name as keyof ContractFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEmrProof(file);
      
      // Create file preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Canvas drawing handler
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.closePath();
        // Convert canvas content to data URL and store in signature field
        const dataUrl = canvas.toDataURL();
        setFormData(prev => ({ ...prev, signature: dataUrl }));
      }
    }
  };
  
  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setFormData(prev => ({ ...prev, signature: '' }));
    }
  };
  
  const validateForm = () => {
    try {
      // Check if emails match
      if (formData.email !== formData.confirmEmail) {
        setErrors(prev => ({ ...prev, confirmEmail: "Emails do not match" }));
        return false;
      }
      
      // Check if EMT proof is uploaded
      if (!emrProof) {
        toast.error('Please upload EMT payment screenshot');
        return false;
      }
      
      // Check if signature is provided
      if (!formData.signature) {
        toast.error('Please provide your signature');
        return false;
      }
      
      contractFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ContractFormData, string>> = {};
        error.errors.forEach(err => {
          newErrors[err.path[0] as keyof ContractFormData] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully submitted adoption contract for ${animal.name} (${animal.uniqueId})!`, {
        description: "Once our team approves, the animal's status will be updated to Adopted.",
        duration: 5000,
        onAutoClose: () => navigate(`/animal/${animal.id}`)
      });
    } catch (error) {
      toast.error('Failed to submit contract. Please try again later.');
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
          {/* Title */}
          <div className="bg-primary text-white p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Sign Adoption Contract</h1>
            <div className="flex items-center text-white/90">
              <span className="mr-2">Animal: {animal.name} ({animal.uniqueId})</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Adoption Fee: ¥{animal.adoptionFee}</span>
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
                <p className="text-gray-600 dark:text-gray-400">{animal.breed} • {animal.age} • {animal.sex}</p>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.firstName 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.lastName 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="mt-1 text-sm text-red-500">{errors.lastName}</p>
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
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.postalCode 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.postalCode}
                    aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
                  />
                  {errors.postalCode && (
                    <p id="postalCode-error" className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
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
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Province</label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.province 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.province}
                    aria-describedby={errors.province ? "province-error" : undefined}
                  />
                  {errors.province && (
                    <p id="province-error" className="mt-1 text-sm text-red-500">{errors.province}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
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
                  <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Email</label>
                  <input
                    type="email"
                    id="confirmEmail"
                    name="confirmEmail"
                    value={formData.confirmEmail}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.confirmEmail 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    aria-invalid={!!errors.confirmEmail}
                    aria-describedby={errors.confirmEmail ? "confirmEmail-error" : undefined}
                  />
                  {errors.confirmEmail && (
                    <p id="confirmEmail-error" className="mt-1 text-sm text-red-500">{errors.confirmEmail}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Adoption Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Adoption Details</h3>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Adopted Animal</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-800 dark:text-white">{animal.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                    <p className="font-medium text-gray-800 dark:text-white">{animal.uniqueId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adoption Fee</p>
                    <p className="font-medium text-gray-800 dark:text-white">¥{animal.adoptionFee}</p>
                  </div>
                </div>
              </div>
              
              {/* EMT Payment Proof */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload EMT payment screenshot (proof of payment to acct@savefurpets.com)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <i className="fa-solid fa-cloud-arrow-up text-gray-400 text-3xl"></i>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-[#4C51A4] hover:text-[#383C80]">
                        <span>Upload File</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
                {proofPreview && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {proofPreview.includes('image') ? (
                          <img 
                            src={proofPreview} 
                            alt="Payment proof" 
                            className="w-20 h-auto rounded" 
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <i className="fa-solid fa-file-pdf text-red-500 text-2xl"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{emrProof?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {Math.round((emrProof?.size || 0) / 1024)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEmrProof(null);
                          setProofPreview(null);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Signature Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Signature Method
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="signatureMethod"
                      value="typed"
                      checked={signatureMethod === 'typed'}
                      onChange={() => setSignatureMethod('typed')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Typed Signature</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="signatureMethod"
                      value="canvas"
                      checked={signatureMethod === 'canvas'}
                      onChange={() => setSignatureMethod('canvas')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Handwritten Signature</span>
                  </label>
                </div>
              </div>
              
              {/* Signature Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Signature
                </label>
                
                {signatureMethod === 'typed' ? (
                  <input
                    type="text"
                    id="signature"
                    name="signature"
                    value={formData.signature}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.signature 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                    } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                    placeholder="Please enter your full name as signature"
                    aria-invalid={!!errors.signature}
                    aria-describedby={errors.signature ? "signature-error" : undefined}
                  />
                ) : (
                  <div className="flex flex-col">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className={`border ${
                        errors.signature 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
                      } rounded-lg cursor-crosshair mx-auto`}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      aria-invalid={!!errors.signature}
                    />
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="mt-2 self-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm"
                    >
                      <i className="fa-solid fa-eraser mr-1"></i> Clear Signature
                    </button>
                  </div>
                )}
                {errors.signature && (
                  <p className="mt-1 text-sm text-red-500">{errors.signature}</p>
                )}
              </div>
              
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                    aria-invalid={!!errors.acceptTerms}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="font-medium text-gray-700 dark:text-gray-300">
                    I accept the adoption terms and conditions
                  </label>
                  {errors.acceptTerms && (
                    <p className="mt-1 text-sm text-red-500">{errors.acceptTerms}</p>
                  )}
                </div>
              </div>
              
              {/* Contract Content */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 max-h-60 overflow-y-auto">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Adoption Agreement</h4>
                <p className="mb-2">
                  By signing this adoption agreement, the adopter agrees to the following terms and conditions:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>I agree to provide proper care for the animal, including but not limited to: regular veterinary care, appropriate food and water, shelter, exercise, and companionship.</li>
                  <li>I agree to keep the animal as an indoor pet and provide a safe environment.</li>
                  <li>I agree to notify Save Fur Pets immediately if the animal is lost, becomes ill, or if there are any significant changes in the animal's health or behavior.</li>
                  <li>I understand the adoption fee is non-refundable.</li>
                  <li>I agree to return the animal to Save Fur Pets if I am unable to continue caring for it, rather than rehoming or surrendering it to a shelter.</li>
                  <li>I confirm that all information provided in this adoption application is true and accurate.</li>
                  <li>I understand that Save Fur Pets reserves the right to conduct follow-up visits to ensure the animal's welfare.</li>
                </ol>
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
                    Submitting contract...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-signature mr-2"></i>
                    Sign and Submit Contract
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