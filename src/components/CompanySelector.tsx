"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { CompanyData } from '@/utils/companyUtils';

interface CompanySelectorProps {
  className?: string;
}

export default function CompanySelector({ className = '' }: CompanySelectorProps) {
  const { userRole, userCompanies, currentCompany, setCurrentCompany } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Solo mostramos el selector para superadmins que tienen acceso a múltiples compañías
  if (userRole !== 'superadmin' || !userCompanies || userCompanies.length <= 1) {
    return null;
  }
  
  const handleSelectCompany = async (company: CompanyData) => {
    await setCurrentCompany(company.id);
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white border border-gray-300 shadow-sm hover:bg-gray-50"
      >
        <span className="mr-2 flex-1 text-left">
          {currentCompany?.name || 'Seleccionar compañía'}
        </span>
        <svg 
          className="h-5 w-5 text-gray-400" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div 
            className="py-1" 
            role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="options-menu"
          >
            {userCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentCompany?.id === company.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                }`}
                role="menuitem"
              >
                {company.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
