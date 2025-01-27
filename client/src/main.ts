import './styles/jass.css';

// All necessary DOM elements selected
const searchForm = document.getElementById('search-form') as HTMLFormElement | null;
const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
const todayContainer = document.querySelector('#today') as HTMLDivElement | null;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement | null;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement | null;
const heading = document.getElementById('search-title') as HTMLHeadingElement | null;
const weatherIcon = document.getElementById('weather-img') as HTMLImageElement | null;
const tempEl = document.getElementById('temp') as HTMLParagraphElement | null;
const windEl = document.getElementById('wind') as HTMLParagraphElement | null;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement | null;

// Ensure the elements are not null before using them
if (!searchForm || !searchInput || !todayContainer || !forecastContainer || !searchHistoryContainer || !heading || !weatherIcon || !tempEl || !windEl || !humidityEl) {
  console.error('One or more elements are not found in the DOM');
} else {
  const renderCurrentWeather = (currentWeather: any) => {
    const { cityName, date, icon, description, temperature, windSpeed, humidity } = currentWeather;

    heading.textContent = `${cityName} (${date})`;
    if (icon) {
      weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
      weatherIcon.setAttribute('alt', description);
      weatherIcon.setAttribute('class', 'weather-img');
      weatherIcon.style.display = 'inline'; // Show the icon if it exists
    } else {
      weatherIcon.style.display = 'none'; // Hide the icon if it does not exist
    }
    heading.append(weatherIcon);
    tempEl.textContent = `Temp: ${temperature}°C`;
    windEl.textContent = `Wind: ${windSpeed} m/s`;
    humidityEl.textContent = `Humidity: ${humidity} %`;

    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
  };

  const renderForecast = (forecast: any[]) => {
    const headingCol = document.createElement('div');
    const heading = document.createElement('h4');

    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);

    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);

    for (let i = 0; i < forecast.length; i++) {
      renderForecastCard(forecast[i]);
    }
  };

  const renderForecastCard = (forecast: any) => {
    const { date, icon, description, temperature, windSpeed, humidity } = forecast;

    const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

    // Format the date
    const formattedDate = new Date(date).toLocaleDateString();

    // Add content to elements
    cardTitle.textContent = formattedDate;
    if (icon) {
      weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
      weatherIcon.setAttribute('alt', description);
      weatherIcon.style.display = 'inline'; // Show the icon if it exists
    } else {
      weatherIcon.style.display = 'none'; // Hide the icon if it does not exist
    }
    tempEl.textContent = `Temp: ${temperature}°C`;
    windEl.textContent = `Wind: ${windSpeed} m/s`;
    humidityEl.textContent = `Humidity: ${humidity} %`;

    forecastContainer.append(col);
  };

  const createForecastCard = () => {
    const col = document.createElement('div');
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const cardTitle = document.createElement('h5');
    const weatherIcon = document.createElement('img');
    const tempEl = document.createElement('p');
    const windEl = document.createElement('p');
    const humidityEl = document.createElement('p');

    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

    col.classList.add('col-md-2', 'col-sm-4', 'col-6', 'mb-3'); // Adjust column size for different screen sizes
    card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');
    cardBody.classList.add('card-body', 'p-2');
    cardTitle.classList.add('card-title');
    tempEl.classList.add('card-text');
    windEl.classList.add('card-text');
    humidityEl.classList.add('card-text');

    return { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl };
  };

  const renderSearchHistory = async () => {
    try {
      const response = await fetch('/api/weather/history');
      const cities = await response.json();

      searchHistoryContainer.innerHTML = '';

      cities.forEach((city: any) => {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-2');

        const button = document.createElement('button');
        button.textContent = city.name;
        button.classList.add('btn', 'btn-secondary', 'btn-block', 'search-button', 'mr-2'); // Add 'search-button' class
        button.addEventListener('click', () => fetchWeather(city.name));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.addEventListener('click', async () => {
          await deleteCity(city.id);
          renderSearchHistory(); // Update search history after deletion
        });

        buttonContainer.append(button, deleteButton);
        searchHistoryContainer.append(buttonContainer);
      });
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  const deleteCity = async (id: number) => {
    try {
      await fetch(`/api/weather/history/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting city from search history:', error);
    }
  };

  // Example function to fetch weather data and render it
  const fetchWeather = async (cityName: string) => {
    try {
      const response = await fetch('/api/weather/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityName }),
      });

      const weatherData = await response.json();
      console.log('weatherData: ', weatherData);

      renderCurrentWeather(weatherData.current);
      renderForecast(weatherData.forecast);
      renderSearchHistory(); // Update search history after a successful search
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  // Example event listener for form submission
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (searchInput) {
      const cityName = searchInput.value.trim();
      if (cityName) {
        fetchWeather(cityName);
      }
    }
  });

  // Initial render of search history
  renderSearchHistory();
}