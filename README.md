# Weather Now

A modern, responsive weather application built with vanilla JavaScript, Tailwind CSS, and the Open-Meteo API. Get real-time weather data, hourly forecasts, and 7-day predictions for any location worldwide.

## Features

- **Current Weather Display**: Real-time temperature, humidity, wind speed, and precipitation
- **Daily Forecast**: 7-day weather outlook with high/low temperatures and weather icons
- **Hourly Forecast**: Detailed hourly weather with selectable day view
- **Location Search**: Geocoding-powered search to find any location worldwide
- **Unit Conversion**: Switch between metric and imperial units (°C/°F, km/h/mph, mm/in)
- **Responsive Design**: Mobile-first approach with optimized layouts for all devices
- **Persistent Preferences**: Units and settings saved to localStorage
- **Error Handling**: Graceful API error states with retry functionality
- **Loading States**: Visual feedback during data fetching

## Tech Stack

| Layer                | Technology                             |
| -------------------- | -------------------------------------- |
| **Frontend**         | HTML5, Vanilla JavaScript (ES6+)       |
| **Styling**          | Tailwind CSS 3                         |
| **Weather Data**     | Open-Meteo API (free, no key required) |
| **Geocoding**        | Open-Meteo Geocoding API               |
| **State Management** | Browser localStorage                   |
| **Icons**            | Custom SVG assets                      |

## Project Structure

```
weather-app/
├── index.html          # Main HTML structure
├── script.js           # All JavaScript logic
├── assets/
│   └── images/         # Weather icons & UI assets
└── README.md           # This file
```

## Code Architecture

### 1. State & Initialization (Lines 1-15)
Central state management with current weather data and unit preferences. Initialization triggers on DOM load with default location (Częstochowa, Poland).

### 2. Weather Icon Mapping (Lines 18-46)
Maps WMO weather codes to corresponding icon files for accurate visual representation.

### 3. API Calls (Lines 49-73)
Async function `getWeather(lat, long)` fetches data from Open-Meteo with comprehensive daily and hourly parameters. Includes error handling and loading state management.

### 4. Rendering Engine (Lines 76-231)
Modular rendering functions for each UI component:
- `updateCurrentWeather()` - Current conditions display
- `renderDailyForecast()` - 7-day cards with click interactions
- `renderHourlyForecast()` - Day-filtered hourly data
- `populateDayDropdown()` - Day selection menu

### 5. Search Functionality (Lines 234-320)
Advanced search with:
- Debounced API calls (300ms delay)
- Keyboard navigation (arrow keys, Enter)
- Location highlighting
- Auto-highlight first result

### 6. Units & Conversions (Lines 323-395)
Unit system with localStorage persistence:
- Temperature: Celsius ↔ Fahrenheit
- Wind: km/h ↔ mph
- Precipitation: mm ↔ inches

Conversion functions apply dynamically across all elements using data attributes.

### 7. Event Listeners (Lines 398-450)
Modular event handling for:
- Units dropdown toggle and selection
- Hourly day selector dropdown
- Search input and results
- Outside-click dismissal

## Installation & Setup

1. Clone the repository
2. No build process required - open `index.html` in a browser
3. Ensure internet connection for API calls

## Usage

### Search for a Location
- Click the search bar and type a place name
- Use arrow keys to navigate results
- Press Enter or click to select
- Weather updates automatically

### Switch Units
- Click the "Units" button in the header
- Select preferred units for temperature, wind, and precipitation
- Preferences auto-save and persist across sessions

### View Hourly Forecast
- Click a day card to update hourly view
- Use the day dropdown in the hourly section to switch days
- Scroll to view all hours

## API Reference

### Weather Data Endpoint
```
https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&...
```

**Parameters:**
- `current_weather=true` - Current conditions
- `daily=weather_code,temperature_2m_max,temperature_2m_min,...` - Daily data
- `hourly=temperature_2m,weathercode` - Hourly data
- `timezone=auto` - Auto-detect user timezone

### Geocoding Endpoint
```
https://geocoding-api.open-meteo.com/v1/search?name={query}&count=5
```

Returns up to 5 matching locations with coordinates.

## Data Flow

```
User Input (Search/Location Click)
    ↓
getWeather(lat, lon)
    ↓
Fetch Open-Meteo API
    ↓
renderAllWeather()
    ├─ updateCurrentWeather()
    ├─ renderDailyForecast()
    ├─ renderHourlyForecast()
    └─ populateDayDropdown()
    ↓
Display + Store in localStorage
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Mobile browsers: Responsive design optimized

## Performance Considerations

- **Debounced search**: 300ms delay reduces API calls during typing
- **Lazy rendering**: Only visible elements update on day/unit changes
- **localStorage caching**: Units persist without server calls
- **Minimal dependencies**: Vanilla JS reduces bundle size

## Future Enhancements

- Multiple location bookmarks
- Weather alerts/warnings
- Air quality index (AQI)
- UV index display
- Sunrise/sunset times
- Weather radar integration
- Dark/light theme toggle

## Known Limitations

- Open-Meteo API has rate limits (calls/minute)
- Apparent temperature uses daily max (current not provided by API)
- No authentication required (public API)
- Historical weather data limited to recent past

## License

Open source - modify and distribute freely.

## Contributing

Improvements welcome. Consider:
- Additional weather parameters
- Enhanced mobile UX
- Accessibility improvements
- Localization support