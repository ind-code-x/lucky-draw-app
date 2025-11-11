import React from 'react';
import { LucideIcon } from 'lucide-react'; // Renamed from DivideIcon for clarity, as it's a generic icon type

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon; // Changed from DivideIcon as it's a type, not a specific icon component
  fullWidth?: boolean;
}

// Corrected Input component using React.forwardRef
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    icon: Icon, // Destructure icon as Icon for component rendering
    fullWidth = false,
    className = '',
    ...props
  }, ref) => { // 'ref' is the second argument from forwardRef
    // Explicitly pick out common form props so they are forwarded correctly
    const { id, name, onChange, onBlur, value, defaultValue, ...rest } = props as any;
    const idAttr = id || name;
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={idAttr} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
          <input
            ref={ref} // THIS IS THE CRUCIAL FIX: Pass the ref to the native input element
            className={`
              block w-full rounded-lg border-gray-300 shadow-sm
              focus:border-primary-500 focus:ring-primary-500
              disabled:bg-gray-50 disabled:text-gray-500
              ${Icon ? 'pl-10' : 'px-3'}
              py-2.5
              ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
              ${className}
            `}
            id={idAttr} // Good practice for accessibility (linking label to input)
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            defaultValue={defaultValue}
            {...rest}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; // Useful for debugging in React DevTools

// Interface for TextareaProps
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

// Corrected Textarea component using React.forwardRef
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    error,
    fullWidth = false,
    className = '',
    ...props
  }, ref) => { // 'ref' is the second argument from forwardRef
    const { id, name, onChange, onBlur, value, defaultValue, ...rest } = props as any;
    const idAttr = id || name;
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={idAttr} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref} // THIS IS THE CRUCIAL FIX: Pass the ref to the native textarea element
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm
            focus:border-primary-500 focus:ring-primary-500
            disabled:bg-gray-50 disabled:text-gray-500
            px-3 py-2.5
            ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}
            ${className}
          `}
          id={idAttr} // Good practice for accessibility
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          defaultValue={defaultValue}
          {...rest}
        />
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea'; // Useful for debugging in React DevTools
