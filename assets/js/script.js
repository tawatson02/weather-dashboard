const APIkey = "37ca860953e1897085f35bece68f5a28";
const citiesArray = JSON.parse(localStorage.getItem('city')) || [];
const recentCities = document.querySelector('#recentSearches');

document.querySelector('#citySearch').addEventListener('submit', handleFormSubmit);

function handleFormSubmit(event) {
    event.preventDefault();
    const cityInput = document.querySelector('#cityInput').value.trim();

    if (cityInput === '') {
        alert('Input your city name')
    } else {
        const cityObject = { city: cityInput };
        citiesArray.push(cityObject);
        localStorage.setItem('city', JSON.stringify(citiesArray));
        fetchLocationData(cityInput);
        updateRecentSearches();
    }
}

function fetchLocationData(cityName) {
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${APIkey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                throw new Error('City not found')
            }
            const { lat, lon } = data[0];
            fetchWeatherData(lat, lon, cityName);
        })
        .catch(() => alert('City not found'));
}

function fetchWeatherData(lat, lon, cityName) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=imperial`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            generateCurrentWeather(data, cityName);
            generateFiveDayForecast(data);
        })
        .catch(err => console.error('Error fetching weather', err));
}

function updateRecentSearches() {
    recentCities.innerHTML = '';
    citiesArray.forEach(cityObj => {
        const button = createCityButton(cityObj.city);
        button.className = 'btn btn-secondary m-2';
        recentCities.appendChild(button);
    });
}

function createCityButton(cityName) {
    const button = document.createElement('button');
    button.textContent = cityName;
    button.addEventListener('click', () => fetchLocationData(cityName));
    return button;
}

function getCurrentDate() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    return `(${month}/${day}/${year})`;
}

function getFutureDate(daysAhead) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    return `(${month}/${day}/${year})`;
}
function generateCurrentWeather(weatherData, cityName) {
    const currentWeather = weatherData.list[0];
    const locationElement = document.querySelector("#location");
    locationElement.textContent = `${cityName} ${getCurrentDate()}`;

    const { temp } = currentWeather.main;
    const { speed: wind } = currentWeather.wind;
    const { humidity } = currentWeather.main;
    const description = currentWeather.weather[0].description;

    const currentConditions = document.querySelector('#currentConditions');
    currentConditions.innerHTML = `
    <li>Temperature: ${temp} \u00B0F</li>
    <li>Wind: ${wind} mph</li>
    <li>Humidity: ${humidity}</li>
    <li>Description: ${description}</li>`;
}

function createWeatherIcon(weatherId) {
    const img = document.createElement('img');
    const iconMap = {
        2: '11d',
        3: '09d',
        5: '10d',
        6: '13d',
        7: '50d',
        800: '01d',
        default: '02d'
    };
    let src;
    if (weatherId >= 200 && weatherId <= 232) {
        src = iconMap[2];
    } else if (weatherId >= 300 && weatherId <= 321) {
        src = iconMap[3];
    } else if (weatherId >= 500 && weatherId <= 531) {
        src = iconMap[5];
    } else if (weatherId >= 600 && weatherId <= 622) {
        src = iconMap[6];
    } else if (weatherId >= 700 && weatherId <= 782) {
        src = iconMap[7];
    } else if (weatherId === 800) {
        src = iconMap[800];
    } else {
        src = iconMap.default;
    }
    img.src = `http://openweathermap.org/img/wn/${src}@2x.png`;
    img.className = 'card-img-top';
    img.style.width = '75px';
    img.style.height = 'auto';
    return img;
}

function generateFiveDayForecast(weatherData) {
    const fiveDayElement = document.querySelector('#five-day');
    fiveDayElement.innerHTML = '<h2 class="text-decoration-underline mb-4">5 Day Forecast</h2>';

    const forecastCards = document.createElement('div');
    forecastCards.id = 'forecastCards';
    forecastCards.className = 'row background-color: white';

    for (let i = 0; i < 5; i++) {
        const dailyData = weatherData.list[i * 8];
        const date = getFutureDate(i);

        const dayDiv = document.createElement('div');
        dayDiv.className = 'card bg-info m-1 border border-dark';
        dayDiv.style.flex = '1 1 150px';

        const dateHeading = document.createElement('h3');
        dateHeading.className = 'card-header text-white';
        dateHeading.style.fontSize = '1rem';
        dateHeading.textContent = date;

        const weatherIcon = createWeatherIcon(dailyData.weather[0].id);

        const detailsList = document.createElement('ul');
        detailsList.className = 'list-unstyled text-white';
        detailsList.innerHTML = `
            <li>Temperature: ${dailyData.main.temp} \u00B0F</li>
            <li>Wind: ${dailyData.wind.speed} MPH</li>
            <li>Humidity: ${dailyData.main.humidity} %</li>`;

        dayDiv.appendChild(dateHeading);
        dayDiv.appendChild(weatherIcon);
        dayDiv.appendChild(detailsList);
        fiveDayElement.appendChild(dayDiv);

    }
}

function init() {
    updateRecentSearches();
    if (citiesArray.length > 0) {
        fetchLocationData(citiesArray[citiesArray.length - 1].city);
    }
}
init();