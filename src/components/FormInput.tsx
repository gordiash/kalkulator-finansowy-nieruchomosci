import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select';
  value: string | number;
  onChange: (value: any) => void;
  tooltip?: string;
  options?: { value: string | number; label: string }[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  tooltip,
  options,
  required = false,
  min,
  max,
  step = 1
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(val);
  };

  return (
    <div className="mb-2 h-full flex flex-col">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 flex items-start h-6">
        <span className="truncate">{label}</span>
        {tooltip && (
          <span 
            className="ml-1 flex-shrink-0 relative group cursor-help text-indigo-600"
            title={tooltip}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 inline" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-900 text-white text-xs rounded py-1 px-2 absolute left-0 top-full mt-1 -ml-1 w-48 z-10">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      
      <div className="flex-grow">
        {type === 'select' && options ? (
          <select
            id={id}
            value={value}
            onChange={handleChange}
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            required={required}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={handleChange}
            className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required={required}
            min={min}
            max={max}
            step={step}
          />
        )}
      </div>
    </div>
  );
};

export default FormInput; 