// ==========================================
    // TODO: YOUR JAVASCRIPT IMPLEMENTATION
    // ==========================================

    // 1. WEATHER ICON MAPPING
    //    - Create an object mapping weather codes to image paths
    //    - Example: {0: './assets/images/icon-sunny.webp', 1: './assets/images/icon-partly-cloudy.webp', ... }
    //    - Use paths: ./assets/images/icon-*.webp
    //    - Available icons from assets:
    //      * icon-sunny.webp
    //      * icon-partly-cloudy.webp
    //      * icon-rain.webp
    //      * icon-fog.webp
    //      * icon-snow.webp
    //      * icon-overcast.webp
    //      * icon-storm.webp
    //      * icon-drizzle.webp

    // 2. RENDER DAILY FORECAST CARDS
    //    - Loop through 7 days of forecast data
    //    - Create card DOM elements with: day name, weather icon (img tag), high temp, low temp
    //    - Append to #dailyForecastContainer
    //    - Add click event listener to select day for hourly forecast

    // 3. RENDER HOURLY FORECAST
    //    - Get hourly data for selected day
    //    - Create list items with: time (12-hour format), temperature
    //    - Append to #hourlyForecastContainer
    //    - Update when day changes

    // 4. POPULATE DAY SELECTION DROPDOWN
    //    - Create 7 day buttons (Monday - Sunday)
    //    - Append to #daySelectionDropdown
    //    - Add click handlers to update #hourlyDaySelector text
    //    - Add click handlers to re-render hourly forecast

    // 5. SEARCH FUNCTIONALITY
    //    - Listen to #searchInput for user typing
    //    - Make API call to geocode location names
    //    - Show results in #searchResults dropdown
    //    - Create clickable location items
    //    - On selection: fetch weather for that location, update all sections

    // 6. LOCAL STORAGE FOR UNITS
    //    - Save selected units to localStorage when changed
    //    - Load units on page load
    //    - Apply unit conversions to all displayed values
    //    - Update all temperature, wind, and precipitation displays

    // 7. UNIT CONVERSIONS
    //    - Celsius to Fahrenheit: (C × 9/5) + 32
    //    - km/h to mph: km/h × 0.621371
    //    - mm to inches: mm × 0.0393701
    //    - Call conversion functions when units change
    //    - Re-render affected DOM elements

    // 8. UNITS DROPDOWN TOGGLE
    const unitsBtn = document.getElementById('unitsBtn');
    const unitsDropdown = document.getElementById('unitsDropdown');

    unitsBtn.addEventListener('click', () => {
        unitsDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!unitsDropdown.contains(e.target) && !unitsBtn.contains(e.target)) {
        unitsDropdown.classList.add('hidden');
      }
    });

    // 9. HOURLY DAY SELECTOR TOGGLE
    const hourlyDaySelector = document.getElementById('hourlyDaySelector');
    const daySelectionDropdown = document.getElementById('daySelectionDropdown');

    hourlyDaySelector.addEventListener('click', (e) => {
        e.stopPropagation();
    daySelectionDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!daySelectionDropdown.contains(e.target) && !hourlyDaySelector.contains(e.target)) {
        daySelectionDropdown.classList.add('hidden');
      }
    });

    // 10. SEARCH RESULTS TOGGLE
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.length > 0) {
        searchResults.classList.remove('hidden');
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });
