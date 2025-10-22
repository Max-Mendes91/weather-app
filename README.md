# Weather Now

A modern, responsive weather application built with vanilla JavaScript, Tailwind CSS, and the Open-Meteo API. Get real-time weather data, hourly forecasts, and 7-day predictions for any location worldwide.

**Live Demo:** [Weather App](https://max-mendes91.github.io/weather-app/)

## Features

- **Current Weather Display**: Real-time temperature, humidity, wind speed, and precipitation with weather icons
- **Daily Forecast**: 7-day weather outlook with high/low temperatures and interactive day cards
- **Hourly Forecast**: Detailed hourly weather with selectable day view and dropdown navigation
- **Location Search**: Geocoding-powered search with debounced API calls, keyboard navigation, and auto-complete
- **Unit Conversion**: Switch between metric and imperial units (°C/°F, km/h/mph, mm/in) with persistent preferences
- **Responsive Design**: Mobile-first approach with optimized layouts for all devices and screen sizes
- **Persistent Preferences**: Units and settings saved to localStorage across browser sessions
- **Error Handling**: Graceful API error states with retry functionality and user-friendly messages
- **Loading States**: Visual feedback during data fetching with custom loading animations
- **Modular Architecture**: Clean separation of concerns with ES6 modules for maintainability
- **Custom Fonts**: Beautiful typography with Bricolage Grotesque and DM Sans fonts
- **Weather Icons**: Comprehensive set of weather condition icons for accurate visual representation

## Tech Stack

| Layer                | Technology                              |
| -------------------- | --------------------------------------- |
| **Frontend**         | HTML5, Vanilla JavaScript (ES6+)        |
| **Styling**          | Tailwind CSS 3                          |
| **Weather Data**     | Open-Meteo API (free, no key required)  |
| **Geocoding**        | Open-Meteo Geocoding API                |
| **State Management** | Browser localStorage                    |
| **Icons**            | Custom SVG assets                       |
| **Architecture**     | ES6 Modules with separation of concerns |

## Project Structure

```
weather-app/
├── index.html              # Main HTML structure
├── js/
│   ├── main.js            # Application entry point and coordination
│   ├── data.js            # API calls and data fetching
│   ├── ui.js              # DOM manipulation and rendering
│   ├── search.js          # Location search functionality
│   ├── units.js           # Unit conversion and persistence
│   └── utils.js           # Utility functions and weather icons
├── assets/
│   ├── images/            # Weather icons & UI assets
│   └── fonts/             # Custom fonts (Bricolage Grotesque, DM Sans)
├── design/                # Design mockups and reference images
└── README.md              # This file
```

## Code Architecture

The application follows a modular ES6 architecture with clear separation of concerns:

### 1. **main.js** - Application Coordinator
- **Entry Point**: Initializes the application and coordinates between modules
- **State Management**: Manages global state (currentWeatherData, selectedDayIndex)
- **Event Coordination**: Sets up event listeners and handles custom events
- **Initialization**: Loads default location (Częstochowa, Poland) on startup
- **Module Integration**: Imports and coordinates all other modules

### 2. **data.js** - API Layer
- **Weather API**: `fetchWeather(lat, lon)` - Fetches comprehensive weather data from Open-Meteo
- **Geocoding API**: `fetchLocationResults(query)` - Searches for locations worldwide
- **Error Handling**: HTTP status checking and error propagation
- **Data Formatting**: Raw API responses ready for consumption

### 3. **ui.js** - Presentation Layer
- **Rendering Engine**: Modular functions for each UI component
- **Current Weather**: `updateCurrentWeather()` - Displays current conditions
- **Daily Forecast**: `renderDailyForecast()` - 7-day cards with click interactions
- **Hourly Forecast**: `renderHourlyForecast()` - Day-filtered hourly data
- **Loading States**: `showLoading()`, `hideLoading()` - Visual feedback
- **Error States**: `showApiError()`, `hideApiError()` - Error handling UI

### 4. **search.js** - Search Functionality
- **Debounced Search**: 300ms delay reduces API calls during typing
- **Keyboard Navigation**: Arrow keys, Enter key support
- **Result Highlighting**: Visual feedback for selected results
- **Location Selection**: Triggers weather updates via custom events
- **Auto-complete**: Real-time search suggestions

### 5. **units.js** - Unit Management
- **Unit Conversion**: Temperature (°C/°F), Wind (km/h/mph), Precipitation (mm/in)
- **Persistence**: localStorage integration for user preferences
- **Dynamic Updates**: Real-time unit conversion across all elements
- **UI Synchronization**: Updates dropdown states and checkmarks

### 6. **utils.js** - Utility Functions
- **Weather Icons**: Maps WMO weather codes to icon files
- **Conversion Functions**: Mathematical conversions between unit systems
- **Icon Resolution**: `getWeatherIcon(code)` - Returns appropriate weather icon

### Event-Driven Communication
The modules communicate through custom DOM events:
- `locationSelected` - Triggers weather data fetch
- `daySelected` - Updates hourly forecast view
- `apiRetry` - Handles API error recovery

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/max-mendes91/weather-app.git
   cd weather-app
   ```

2. **No build process required** - The app uses ES6 modules and can run directly in modern browsers
   - Open `index.html` in a web browser
   - Ensure you have an internet connection for API calls
   - Modern browser required (Chrome 61+, Firefox 60+, Safari 10.1+)

3. **Development Setup** (Optional)
   - For local development, use a local server to avoid CORS issues:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
   - Then visit `http://localhost:8000`

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

The application follows a clean data flow pattern with modular separation:

```
User Input (Search/Location Click)
    ↓
search.js → fetchLocationResults()
    ↓
Custom Event: 'locationSelected'
    ↓
main.js → loadAndRender(lat, lon)
    ↓
data.js → fetchWeather(lat, lon)
    ↓
Open-Meteo API Response
    ↓
ui.js → renderAllWeather(data)
    ├─ updateCurrentWeather()
    ├─ renderDailyForecast()
    ├─ renderHourlyForecast()
    └─ populateDayDropdown()
    ↓
units.js → applyUnits()
    ↓
Display + Store in localStorage
```

### Module Interaction Flow
1. **User searches** → `search.js` handles input and API calls
2. **Location selected** → Custom event dispatched to `main.js`
3. **Weather fetch** → `data.js` calls Open-Meteo API
4. **Data rendering** → `ui.js` updates all UI components
5. **Unit conversion** → `units.js` applies user preferences
6. **State persistence** → Preferences saved to localStorage

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Mobile browsers: Responsive design optimized

## Performance Considerations

- **Modular Architecture**: ES6 modules enable tree-shaking and better caching
- **Debounced Search**: 300ms delay reduces API calls during typing
- **Lazy Rendering**: Only visible elements update on day/unit changes
- **localStorage Caching**: Units persist without server calls
- **Minimal Dependencies**: Vanilla JS reduces bundle size
- **Event-Driven Updates**: Custom events prevent unnecessary re-renders
- **Efficient DOM Updates**: Targeted element updates instead of full page refreshes

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