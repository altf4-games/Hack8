import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CountryCode {
  id: string;  // Unique identifier
  code: string;
  dial_code: string;
  name: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { id: 'IN', code: 'IN', dial_code: '+91', name: 'India', flag: '🇮🇳' },
  { id: 'US', code: 'US', dial_code: '+1', name: 'United States', flag: '🇺🇸' },
  { id: 'GB', code: 'GB', dial_code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'AU', code: 'AU', dial_code: '+61', name: 'Australia', flag: '🇦🇺' },
  { id: 'CA', code: 'CA', dial_code: '+1', name: 'Canada', flag: '🇨🇦' },
  { id: 'DE', code: 'DE', dial_code: '+49', name: 'Germany', flag: '🇩🇪' },
  { id: 'FR', code: 'FR', dial_code: '+33', name: 'France', flag: '🇫🇷' },
  { id: 'IT', code: 'IT', dial_code: '+39', name: 'Italy', flag: '🇮🇹' },
  { id: 'ES', code: 'ES', dial_code: '+34', name: 'Spain', flag: '🇪🇸' },
  { id: 'JP', code: 'JP', dial_code: '+81', name: 'Japan', flag: '🇯🇵' },
  { id: 'KR', code: 'KR', dial_code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { id: 'CN', code: 'CN', dial_code: '+86', name: 'China', flag: '🇨🇳' },
  { id: 'BR', code: 'BR', dial_code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { id: 'RU', code: 'RU', dial_code: '+7', name: 'Russia', flag: '🇷🇺' },
  { id: 'ZA', code: 'ZA', dial_code: '+27', name: 'South Africa', flag: '🇿🇦' },
];

interface CountryCodeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountryCodeSelector({ value, onChange }: CountryCodeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Find the country by dial code
  const selectedCountry = countryCodes.find(country => country.dial_code === value) || countryCodes[0];
  
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dial_code.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleValueChange = (countryId: string) => {
    const country = countryCodes.find(c => c.id === countryId);
    if (country) {
      onChange(country.dial_code);
    }
  };

  return (
    <Select value={selectedCountry.id} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[120px] rounded-r-none border-r-0">
        <SelectValue placeholder="Select code">
          <div className="flex items-center gap-2">
            <span>{selectedCountry.flag}</span>
            <span>{selectedCountry.dial_code}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder="Search country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
        </div>
        {filteredCountries.map((country) => (
          <SelectItem key={country.id} value={country.id}>
            <div className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.dial_code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 