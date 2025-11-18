import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '@/contexts/authContext';
import { apiGet } from '@/lib/api';
import { toast } from 'sonner';
import { z } from 'zod';

// Define the contract form schema using Zod
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
});

type ContractFormData = z.infer<typeof contractFormSchema>;

export default function ContractPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Redirect to new sign contract page
  useEffect(() => {
    navigate(`/sign-contract/${id}`);
  }, [id, navigate]);
  
  return (
    <div className="min-h-screen py-12 bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-spinner fa-spin text-gray-400 text-3xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">正在重定向...</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            我们正在将您重定向到新的合同签署页面。
          </p>
        </div>
      </div>
    </div>
  );
}