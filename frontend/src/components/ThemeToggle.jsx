import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const ThemeToggle = ({ showLabel = true, className = '' }) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const themes = [
    { id: 'light', label: 'Light', icon: Sun, color: 'text-yellow-500' },
    { id: 'dark', label: 'Dark', icon: Moon, color: 'text-indigo-400' },
    // { id: 'system', label: 'System', icon: Monitor, color: 'text-gray-500' },
  ];

  const currentTheme = themes.find(t => t.id === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
  };

  if (!showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-12 h-12 rounded-2xl border border-gray-300 dark:border-gray-600 transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white dark:bg-gray-800 flex items-center justify-center group ${className}`}
        aria-label="Toggle theme"
      >
        <Sun className="w-5 h-5 text-yellow-500 transition-all duration-300 absolute opacity-0 rotate-0 scale-50 group-hover:opacity-100 group-hover:rotate-90 group-hover:scale-100" />
        <Moon className="w-5 h-5 text-indigo-400 transition-all duration-300 absolute opacity-0 -rotate-90 scale-50 group-hover:opacity-100 group-hover:rotate-0 group-hover:scale-100" />
        <CurrentIcon className={`w-5 h-5 ${currentTheme?.color} transition-all duration-300 absolute opacity-100 rotate-0 scale-100 group-hover:opacity-0 group-hover:rotate-90 group-hover:scale-50`} />

        {}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          theme === 'dark' ? 'opacity-20' : 'opacity-0'
        }`} />
      </button>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <button
        type="button"
        onClick={toggleTheme}
        className="w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 transition-all duration-300 hover:shadow-lg bg-white dark:bg-gray-800"
        aria-label="Toggle theme"
      >
        <div className="flex items-center space-x-3">
          <div className="relative w-6 h-6">
            <Sun className="w-5 h-5 text-yellow-500 transition-all duration-300 absolute opacity-0 rotate-0 scale-50 group-hover:opacity-100 group-hover:rotate-90 group-hover:scale-100" />
            <Moon className="w-5 h-5 text-indigo-400 transition-all duration-300 absolute opacity-0 -rotate-90 scale-50 group-hover:opacity-100 group-hover:rotate-0 group-hover:scale-100" />
            <CurrentIcon className={`w-5 h-5 ${currentTheme?.color} transition-all duration-300 absolute opacity-100 rotate-0 scale-100 group-hover:opacity-0 group-hover:rotate-90 group-hover:scale-50`} />
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {currentTheme?.label} Mode
          </span>
        </div>

        {}
        <div className="flex items-center space-x-1">
          {themes.map((t) => (
            <div
              key={t.id}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                theme === t.id 
                  ? t.id === 'light' ? 'bg-yellow-500' : t.id === 'dark' ? 'bg-indigo-400' : 'bg-gray-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </button>

      {}
      <div className="absolute bottom-full left-0 right-0 mb-2 opacity-0 invisible transition-all duration-300 transform translate-y-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 space-y-1 backdrop-blur-xl">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <button
                key={themeOption.id}
                onClick={() => handleThemeSelect(themeOption.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                  theme === themeOption.id
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${themeOption.color}`} />
                <span className="text-sm font-medium">{themeOption.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;