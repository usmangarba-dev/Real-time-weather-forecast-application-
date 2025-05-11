// API configuration
const API_KEY = "152f79e25b908e0d81c78ea3ac98dc6b"; // Replace with your API key
const API_BASE = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchForm = document.getElementById('search-form');
const themeToggle = document.getElementById('theme-toggle');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const loadingContainer = document.getElementById('loading-container');
const weatherContainer = document.getElementById('weather-container');
const locationElement = document.getElementById('location');
const dateElement = document.getElementById('date');
const weatherCondition = document.getElementById('weather-condition');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const forecastContainer = document.getElementById('forecast-container');
const tabButtons = document.querySelectorAll('.tab-button');
const chartContainers = document.querySelectorAll('.chart-container');
const currentYear = document.getElementById('current-year');

// Chart instances
let temperatureChart = null;
let humidityChart = null;
let windChart = null;

// Initialize the app
function init() {
    // Set current year in footer
    currentYear.textContent = new Date().getFullYear();
    
    // Check for saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Event listeners
    searchForm.addEventListener('submit', handleSearch);
    themeToggle.addEventListener('click', toggleTheme);
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Get user's location on initial load
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            position => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            err => {
                showError("Unable to retrieve your location. Please search for a city.");
                hideLoading();
            }
        );
    } else {
        showError("Geolocation is not supported by your browser. Please search for a city.");
    }
}

// Handle search form submission
function handleSearch(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
    }
}

// Toggle theme
function toggleTheme() {
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    themeToggle.innerHTML = isDarkTheme ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    
    // Update charts if they exist
    updateChartsTheme();
}

// Switch between tabs
function switchTab(tab) {
    // Update active tab button
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tab);
    });
    
    // Show active chart container
    chartContainers.forEach(container => {
        container.classList.toggle('active', container.id === `${tab}-chart`);
    });
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorContainer.classList.add('hidden');
}

// Show loading indicator
function showLoading() {
    loadingContainer.classList.remove('hidden');
    weatherContainer.classList.add('hidden');
}

// Hide loading indicator
function hideLoading() {
    loadingContainer.classList.add('hidden');
}

// Format date
function formatDate(date) {
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time
function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading();
        hideError();
        
        // Fetch current weather
        const weatherResponse = await fetch(
            `${API_BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        
        if (!weatherResponse.ok) {
            throw new Error("Weather data not available");
        }
        
        const weatherData = await weatherResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `${API_BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        
        if (!forecastResponse.ok) {
            throw new Error("Forecast data not available");
        }
        
        const forecastData = await forecastResponse.json();
        
        // Display the data
        displayWeatherData(weatherData);
        displayForecastData(forecastData);
        createCharts(forecastData);
        
        weatherContainer.classList.remove('hidden');
    } catch (err) {
        showError("Failed to fetch weather data. Please try again.");
        console.error(err);
    } finally {
        hideLoading();
    }
}

// Fetch weather by city name
async function fetchWeatherByCity(city) {
    try {
        showLoading();
        hideError();
        
        // Fetch current weather
        const weatherResponse = await fetch(
            `${API_BASE}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );
        
        if (!weatherResponse.ok) {
            if (weatherResponse.status === 404) {
                throw new Error("City not found. Please check the spelling and try again.");
            }
            throw new Error("Weather data not available");
        }
        
        const weatherData = await weatherResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `${API_BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );
        
        if (!forecastResponse.ok) {
            throw new Error("Forecast data not available");
        }
        
        const forecastData = await forecastResponse.json();
        
        // Display the data
        displayWeatherData(weatherData);
        displayForecastData(forecastData);
        createCharts(forecastData);
        
        weatherContainer.classList.remove('hidden');
    } catch (err) {
        showError(err.message || "Failed to fetch weather data. Please try again.");
        console.error(err);
    } finally {
        hideLoading();
    }
}

// Display current weather data
function displayWeatherData(data) {
    const { main, weather, wind, sys, name } = data;
    
    // Set location and date
    locationElement.textContent = `${name}, ${sys.country}`;
    dateElement.textContent = formatDate(new Date());
    
    // Set weather condition badge
    weatherCondition.textContent = weather[0].main;
    
    // Set weather icon
    const iconCode = weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.alt = weather[0].description;
    
    // Set temperature and description
    temperature.textContent = `${Math.round(main.temp)}°C`;
    weatherDescription.textContent = weather[0].description;
    feelsLike.innerHTML = `<i class="fas fa-temperature-half"></i> Feels like: ${Math.round(main.feels_like)}°C`;
    
    // Set weather details
    humidity.textContent = `${main.humidity}%`;
    windSpeed.textContent = `${Math.round(wind.speed)} m/s`;
    sunrise.textContent = formatTime(sys.sunrise);
    sunset.textContent = formatTime(sys.sunset);
}

// Display forecast data
function displayForecastData(data) {
    if (!data || !data.list) return;
    
    // Clear previous forecast
    forecastContainer.innerHTML = '';
    
    // Group forecast data by day
    const groupedForecast = data.list.reduce((acc, item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {});
    
    // Get daily data (use noon forecast or the middle of the day)
    const dailyData = Object.keys(groupedForecast)
        .map(date => {
            const dayData = groupedForecast[date];
            // Try to get forecast for noon, or the middle of available forecasts
            const middleIndex = Math.floor(dayData.length / 2);
            return dayData[middleIndex];
        })
        .slice(0, 5); // Limit to 5 days
    
    // Create forecast items
    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
        const dayDate = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        const iconCode = day.weather[0].icon;
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <h4>${dayName}</h4>
            <p class="date">${dayDate}</p>
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${day.weather[0].description}">
            <p class="temp">${Math.round(day.main.temp)}°C</p>
            <p class="condition">${day.weather[0].description}</p>
            <div class="forecast-details">
                <div class="forecast-detail">
                    <p>Humidity</p>
                    <p>${day.main.humidity}%</p>
                </div>
                <div class="forecast-detail">
                    <p>Wind</p>
                    <p>${Math.round(day.wind.speed)} m/s</p>
                </div>
            </div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Create weather charts
function createCharts(forecastData) {
    if (!forecastData || !forecastData.list) return;
    
    // Destroy existing charts
    if (temperatureChart) temperatureChart.destroy();
    if (humidityChart) humidityChart.destroy();
    if (windChart) windChart.destroy();
    
    // Get next 24 hours of data (8 x 3 hours)
    const next24Hours = forecastData.list.slice(0, 8);
    
    // Prepare data
    const labels = next24Hours.map(item => {
        return new Date(item.dt * 1000).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    });
    
    const temperatureData = next24Hours.map(item => Math.round(item.main.temp));
    const humidityData = next24Hours.map(item => item.main.humidity);
    const windData = next24Hours.map(item => Math.round(item.wind.speed));
    
    // Get chart colors based on theme
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDarkTheme ? '#e5e7eb' : '#374151';
    
    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: textColor
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                ticks: {
                    color: textColor
                },
                grid: {
                    color: gridColor
                }
            },
            x: {
                ticks: {
                    color: textColor
                },
                grid: {
                    color: gridColor
                }
            }
        }
    };
    
    // Temperature chart
    const temperatureCanvas = document.getElementById('temperature-canvas');
    temperatureChart = new Chart(temperatureCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatureData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: textColor
                    }
                }
            }
        }
    });
    
    // Humidity chart
    const humidityCanvas = document.getElementById('humidity-canvas');
    humidityChart = new Chart(humidityCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity (%)',
                data: humidityData,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        display: true,
                        text: 'Humidity (%)',
                        color: textColor
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
    
    // Wind chart
    const windCanvas = document.getElementById('wind-canvas');
    windChart = new Chart(windCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Wind Speed (m/s)',
                data: windData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    ...commonOptions.scales.y,
                    title: {
                        display: true,
                        text: 'Wind Speed (m/s)',
                        color: textColor
                    }
                }
            }
        }
    });
}

// Update charts theme when theme changes
function updateChartsTheme() {
    if (temperatureChart && humidityChart && windChart) {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkTheme ? '#e5e7eb' : '#374151';
        
        // Update chart colors
        [temperatureChart, humidityChart, windChart].forEach(chart => {
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.y.grid.color = gridColor;
            chart.options.scales.x.ticks.color = textColor;
            chart.options.scales.y.ticks.color = textColor;
            chart.options.plugins.legend.labels.color = textColor;
            if (chart.options.scales.y.title) {
                chart.options.scales.y.title.color = textColor;
            }
            chart.update();
        });
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);