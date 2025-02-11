import React from 'react';
import { Search } from 'lucide-react';

type SearchBarProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-200"
      />
      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5 dark:text-gray-200" />
    </div>
  );
};

export default SearchBar;