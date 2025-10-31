// DOM Elements
const locationInput = document.querySelector("#location-input");
const searchBtn = document.querySelector("#search-btn");
const loadingElement = document.querySelector("#loading");
const errorElement = document.querySelector("#error-message");
const weatherDisplay = document.querySelector("#weather-display");

// Current weather elements
const cityNameElement = document.querySelector("#city-name");
const dateTimeElement = document.querySelector("#date-time");
const currentTempElement = document.querySelector("#current-temp");
const weatherIconElement = document.querySelector("#weather-icon");
const feelLikeElement = document.querySelector("#feels-like");
const humidityElement = document.querySelector("#humidity");
const windSpeedElement = document.querySelector("#wind-speed");
const pressureElement = document.querySelector("#pressure");
const forecastContainer = document.querySelector("#forecast-container");

// API Configuration
const API_KEY = "KSU2WSY6N64GN8NDUNPNS6U5Q";
const BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

// Event listeners
searchBtn.addEventListener("click", handleSearch);
locationInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});
window.addEventListener("DOMContentLoaded", () => handleSearch());

// Main search function
async function handleSearch() {
    const location = locationInput.value.trim();
    if (!location) {
        alert("Please enter a location");
        return;
    }

    showLoading();
    try {
        const weatherData = await fetchWeatherData(location);
        const processedData = processWeatherData(weatherData);
        updateWeatherDisplay(processedData);
        hideLoading();
        showWeatherDisplay();
    } catch (error) {
        console.error("Error fetching weather data:", error);
        showError();
    }
}

async function fetchWeatherData(location) {
    const response = await fetch(`${BASE_URL}/${location}?unitGroup=metric&key=${API_KEY}&contentType=json`);
    if (!response.ok) {
        throw new Error(`Weather data not available for ${location}.`);
    }
    return await response.json();
}

function processWeatherData(data) {
    const currentConditions = data.currentConditions;
    const days = data.days;

    return {
        location: {
            city: data.resolvedAddress,
            timezone: data.timezone,
        },
        current: {
            temp: Math.round(currentConditions.temp),
            feel_like: Math.round(currentConditions.feelslike),
            humidity: currentConditions.humidity,
            pressure: currentConditions.pressure,
            wind_speed: Math.round(currentConditions.windspeed),
            icon: getWeatherIcon(currentConditions.icon),
        },
        forecast: days.slice(1, 7).map((day) => ({
            date: new Date(day.datetime).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
            temp: Math.round(day.temp),
            conditions: day.conditions,
            icon: getWeatherIcon(day.icon),
        })),
    };
}

function getWeatherIcon(icon) {
    const iconMap = {
        snow: "fa-snowflake",
        rain: "fa-cloud-rain",
        fog: "fa-smog",
        wind: "fa-wind",
        cloudy: "fa-cloud",
        "partly-cloudy-day": "fa-cloud-sun",
        "partly-cloudy-night": "fa-cloud-moon",
        "clear-day": "fa-sun",
        "clear-night": "fa-moon",
        "thunder-rain": "fa-bolt",
        "thunder-shower-day": "fa-bolt",
        "thunder-shower-night": "fa-bolt",
        "showers-day": "fa-cloud-rain",
        "showers-night": "fa-cloud-rain",
    };
    return iconMap[icon] || "fa-sun";
}

function updateWeatherDisplay(data) {
    const now = new Date();

    cityNameElement.textContent = data.location.city;
    dateTimeElement.textContent = now.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    currentTempElement.textContent = data.current.temp;
    feelLikeElement.textContent = `${data.current.feel_like}°C`;
    humidityElement.textContent = `${data.current.humidity}%`;
    windSpeedElement.textContent = `${data.current.wind_speed} km/h`;
    pressureElement.textContent = `${data.current.pressure} hPa`;

    weatherIconElement.className = `fas ${data.current.icon}`;
    updateForecastDisplay(data.forecast);
}

function updateForecastDisplay(forecastData) {
    forecastContainer.textContent = "";
    forecastData.forEach((day) => {
        const item = createForecastElement(day);
        forecastContainer.appendChild(item);
    });
}

function createForecastElement(day) {
    const item = document.createElement("div");
    item.className = "forecast-item";

    const dateElement = document.createElement("div");
    dateElement.className = "forecast-date";
    dateElement.textContent = day.date;

    const iconContainer = document.createElement("div");
    iconContainer.className = "forecast-icon";
    const iconElement = document.createElement("i");
    iconElement.className = `fas ${day.icon}`;
    iconContainer.appendChild(iconElement);

    const tempElement = document.createElement("div");
    tempElement.className = "forecast-temp";
    tempElement.textContent = `${day.temp}°C`;

    const descElement = document.createElement("div");
    descElement.className = "forecast-desc";
    descElement.textContent = day.conditions;

    item.appendChild(dateElement);
    item.appendChild(iconContainer);
    item.appendChild(tempElement);
    item.appendChild(descElement);

    return item;
}

// UI State Management
function showLoading() {
    loadingElement.style.display = "block";
    weatherDisplay.style.display = "none";
    errorElement.style.display = "none";
    searchBtn.disabled = true;
}
function hideLoading() {
    loadingElement.style.display = "none";
    searchBtn.disabled = false;
}
function showWeatherDisplay() {
    weatherDisplay.style.display = "block";
}
function showError() {
    errorElement.style.display = "block";
    weatherDisplay.style.display = "none";
    loadingElement.style.display = "none";
    searchBtn.disabled = false;
}
