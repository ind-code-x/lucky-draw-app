import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (query: string) => void;
}

export const Search: React.FC<SearchProps> = ({
  onSearch,
  className = '',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (onSearch) {
      onSearch(value);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        className={`
          block w-full pl-10 pr-3 py-2.5 
          border border-gray-300 rounded-lg 
          focus:border-primary-500 focus:ring-primary-500 
          disabled:bg-gray-50 disabled:text-gray-500
          ${className}
        `}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
};