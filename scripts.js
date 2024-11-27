document.addEventListener('DOMContentLoaded', () => {
  
    // 맵 초기화
  const map = new ol.Map({
    target: 'map', // HTML 요소 ID
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM() // OpenStreetMap 사용
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([126.9780, 37.5665]), // 초기 좌표 (서울)
      zoom: 12 // 줌 레벨
    })
  });

  function updateMapCenter(lat, lon) {
    const view = map.getView();
    const coordinates = ol.proj.fromLonLat([lon, lat]); // 경도(lon), 위도(lat)를 OpenLayers 좌표계로 변환
    view.setCenter(coordinates);
    view.setZoom(12); // 원하는 줌 레벨로 설정
  }

  function getCityName(latitude, longitude) {
    const ApiKey = '737bbe2e76644c178038fcaebc838642'; // OpenCage API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${ApiKey}&language=en`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const city = data.results[0].components.city;
          document.getElementById("UserLocation").innerHTML = "Air Quality Monitoring Dashboard in " + city;
        } else {
          console.log("City not found.");
        }
      })
      .catch(error => {
        console.error("Error fetching city data: ", error);
      });
  }

  const apiKey = '01f7efb81e543884be50db1d21e5aa65'; // OpenWeather API key
  const apiKey_2 = '372601c0124e464c85452539242511'; // WeatherAPI API key
  //initial location: Busan
  

  let pm25Data = [];
  let pm10Data = [];
  let noxData = [];
  let nh3Data = [];
  let co2Data = [];
  let so2Data = [];
  let vocData = [];
  let temperatureData = [];
  let humidityData = [];

  // Initialize Chart.js charts
  const ctxLine = document.getElementById('lineChart').getContext('2d');
  const lineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: [], // Placeholder for x-axis labels (time of day)
      datasets: [
        {
          label: 'Temperature (°C)',
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          data: [],
          fill: true,
          yAxisID: 'y-axis-1'
        },
        {
          label: 'Humidity (%)',
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          data: [],
          fill: true,
          yAxisID: 'y-axis-2'
        }
      ]
    },
    options: {
      scales: {
        x: {
          ticks: {
            font: {
              size: 16 // Increase font size for x-axis labels
            }
          }
        },
        'y-axis-1': {
          type: 'linear',
          position: 'left',
          ticks: {
            font: {
              size: 16 // Increase font size for left y-axis labels
            }
          }
        },
        'y-axis-2': {
          beginAtZero: true,
          type: 'linear',
          position: 'right',
          ticks: {
            font: {
              size: 16 // Increase font size for right y-axis labels
            }
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            font: {
              size: 18 // Increase font size for the legend
            }
          }
        }
      }
    }
  });

  const ctxBar = document.getElementById('barChart').getContext('2d');
  const barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['PM2.5(ug/m^3)', 'PM10(ug/m^3)', 'NOx(ppb)', 'NH3(ppb)', 'CO2(ppm)', 'SO2(ppb)', 'VOC(ppb)'],
      datasets: [{
        label: 'Pollutant Levels',
        data: [],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)', 'rgb(255, 99, 132)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 16 // Adjust the font size for y-axis labels
            }
          }
        },
        x: {
          ticks: {
            font: {
              size: 10 // Adjust the font size for x-axis labels
            }
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            font: {
              size: 18 // Adjust the font size for the legend
            }
          }
        }
      }
    }
  });

  const ctxDonut = document.getElementById('donutChart').getContext('2d');
  const donutChart = new Chart(ctxDonut, {
    type: 'doughnut',
    data: {
      labels: ['PM2.5(ug/m^3)', 'PM10(ug/m^3)', 'NOx(ppb)', 'NH3(ppb)', 'CO2(ppm)', 'SO2(ppb)', 'VOC(ppb)'],
      datasets: [{
        data: [],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            font: {
              size: 18 // Adjust the font size for the legend
            }
          }
        },
        tooltip: {
          bodyFont: {
            size: 16 // Adjust the font size for the tooltips
          }
        }
      }
    }
  });

  // Fetch weather and air quality data from OpenWeather API
  async function AQI(lat, lon) {
    try {

      

      // Fetch current weather data (temperature and humidity)
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
      const weatherData = await weatherResponse.json();

      const ForecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey_2}&q=${lat},${lon}&days=7&aqi=no&alerts=no`);
      const ForecastData = await ForecastResponse.json();

      const forecast = ForecastData.forecast.forecastday;

      if (Array.isArray(forecast)) {
        // Get the container where we will append the cards
        const container = document.getElementById('weather-cards-container');
        container.innerHTML = ''; // Clear existing cards

        // Prepare data for the line chart
        const chartLabels = []; // To store dates
        const temperatureData = []; // To store temperature data
        const humidityData = []; // To store humidity data 

        // Loop through the forecast data for the next 7 days and generate cards
        forecast.forEach((dayData) => {
            // Create a new card element
            const card = document.createElement('div');
            card.classList.add('card');

            // Format the date (e.g., "2024-11-25")
            const date = new Date(dayData.date); // Date is already in a readable format
            const options = { month: 'short', day: 'numeric' }; // Customize format
            const dateString = date.toLocaleDateString('en-US', options); // "November 25"

            const weatherIconUrl = `https:${dayData.day.condition.icon}`;

            // Create the card content for each day
            card.innerHTML = `
                <p class="date" style="font-size: 30px; font-weight: bold;">${dateString}</p>
                <img src="${weatherIconUrl}" alt="${dayData.day.condition.text}" style="display: block; margin: 0 auto; width: 100px; height: 100px;">
                <p><i class="fas fa-thermometer-half" style="font-size: 30px;"></i> <span class="temperature" style="font-size: 30px; font-weight: bold;">${dayData.day.avgtemp_c}</span> °C</p>
                <p><i class="fas fa-tint" style="font-size: 30px;"></i> <span class="humidity" style="font-size: 30px; font-weight: bold;">${dayData.day.avghumidity}</span> %</p>
            `;

            // Append the card to the container
            container.appendChild(card);

            // Add data to the chart
            chartLabels.push(dateString); // Add formatted date to labels
            temperatureData.push(dayData.day.avgtemp_c); // Add average temperature
            humidityData.push(dayData.day.avghumidity); // Add average humidity
        });

        // Update the line chart with the new data
        lineChart.data.labels = chartLabels; // Set x-axis labels
        lineChart.data.datasets[0].data = temperatureData; // Set temperature dataset
        lineChart.data.datasets[1].data = humidityData; // Set humidity dataset
        lineChart.update(); // Refresh the chart to reflect changes

    } else {
        console.error('Forecast data is not an array:', forecast);
    };

      // Fetch air quality data (pollutants)
      const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      const airQualityData = await airQualityResponse.json();
      
      // Check if the air quality response is successful
      if (airQualityResponse.ok) {
        const airComponents = airQualityData.list[0].components;

        // Update pollutant data
        document.getElementById('pm25').textContent = airComponents.pm2_5.toFixed(1);
        document.getElementById('pm10').textContent = airComponents.pm10.toFixed(1);
        document.getElementById('nox').textContent = airComponents.no2.toFixed(1);
        document.getElementById('nh3').textContent = airComponents.nh3.toFixed(1);
        document.getElementById('co2').textContent = airComponents.co.toFixed(1);
        document.getElementById('so2').textContent = airComponents.so2.toFixed(1);
        document.getElementById('voc').textContent = airComponents.o3.toFixed(1);

        // Update chart data
        pm25Data.push(airComponents.pm2_5.toFixed(1));
        pm10Data.push(airComponents.pm10.toFixed(1));
        noxData.push(airComponents.no2.toFixed(1));
        nh3Data.push(airComponents.nh3.toFixed(1));
        co2Data.push(airComponents.co.toFixed(1));
        so2Data.push(airComponents.so2.toFixed(1));
        vocData.push(airComponents.o3.toFixed(1));

        // Update bar chart and donut chart
        barChart.data.datasets[0].data = [
          airComponents.pm2_5.toFixed(1),
          airComponents.pm10.toFixed(1),
          airComponents.no2.toFixed(1),
          airComponents.nh3.toFixed(1),
          airComponents.co.toFixed(1),
          airComponents.so2.toFixed(1),
          airComponents.o3.toFixed(1)
        ];
        donutChart.data.datasets[0].data = [
          airComponents.pm2_5.toFixed(1),
          airComponents.pm10.toFixed(1),
          airComponents.no2.toFixed(1),
          airComponents.nh3.toFixed(1),
          airComponents.co.toFixed(1),
          airComponents.so2.toFixed(1),
          airComponents.o3.toFixed(1)
        ];

        barChart.update();
        donutChart.update();

        //The color changer depending on AQI (PM2.5)
        //광주 미세먼지모니터링센터 왈, PM2.5의 경우 15까진 좋음, 50까진 보통, 100까진 나쁨, 그 이후론 매우 나쁨

        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        if (airComponents.pm2_5.toFixed(1) <= 15) { 
          header.style.backgroundColor = '#007bff';
          footer.style.backgroundColor = '#007bff';
          document.getElementById("curr_AQ").innerHTML = "Current Air Quality is Very Good! 😀";
        } else if (airComponents.pm2_5.toFixed(1) <= 50) {
          header.style.backgroundColor = 'green';
          footer.style.backgroundColor = 'green';
          document.getElementById("curr_AQ").innerHTML = "Current Air Quality is Good. 🙂";
        } else if (airComponents.pm2_5.toFixed(1) <= 100) {
          header.style.backgroundColor = 'orange';
          footer.style.backgroundColor = 'orange';
          document.getElementById("curr_AQ").innerHTML = "Current Air Quality is Normal. 😐";
        } else {
          header.style.backgroundColor = 'red';
          footer.style.backgroundColor = 'red';
          document.getElementById("curr_AQ").innerHTML = "Current Air Quality is Bad! 😢";
        }


      } else {
        console.error('Error fetching air quality data:', airQualityData.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      getCityName(lat, lon);
      AQI(lat, lon);
      updateMapCenter(lat, lon); // 지도 위치 업데이트
    }, function(error) {
      console.error("Error occurred. Error code: " + error.code);
    });
  } else {
    console.log("Geolocation is not available in this browser.");
  }

  document.getElementById("changeLocationButton").addEventListener("click", function() {
    const userInput = document.getElementById("locationInput").value.trim();

    if (!userInput) {
      alert("Please enter a city or coordinates.");
      return;
    }

    // Check if the input is coordinates (lat, lon)
    const isCoordinates = userInput.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);

    if (isCoordinates) {
      // If input is coordinates (lat, lon), parse and call AQI directly
      const [lat, lon] = userInput.split(',').map(coord => parseFloat(coord.trim()));
      getCityName(lat, lon);  // Get city name based on new coordinates
      AQI(lat, lon);          // Update air quality and weather data with new coordinates
      updateMapCenter(lat, lon); // 지도 위치 업데이트
    } else {
      // If input is a city name, fetch coordinates using OpenCage Geocoding API
      const apiKey = '737bbe2e76644c178038fcaebc838642'; // OpenCage API key
      const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${userInput}&key=${apiKey}&language=en`;

      fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            const lat = data.results[0].geometry.lat;
            const lon = data.results[0].geometry.lng;
            getCityName(lat, lon);  // Get city name based on new coordinates
            AQI(lat, lon);          // Update air quality and weather data with new coordinates
            updateMapCenter(lat, lon); // 지도 위치 업데이트
          } else {
            alert("City not found.");
          }
        })
        .catch(error => {
          console.error("Error fetching city data: ", error);
        });
    }
  });

  let alertShown = false;  // 플래그 변수로 alert가 한 번만 뜨도록 설정

document.getElementById('locationInput').addEventListener('keydown', function(event) {
    // 엔터키가 눌렸을 때만 실행
    if (event.key === 'Enter') {
        const userInput = document.getElementById("locationInput").value.trim();

        if (!userInput) {
            alert("Please enter a city or coordinates.");
            return;
        }

        // Check if the input is coordinates (lat, lon)
        const isCoordinates = userInput.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);

        if (isCoordinates) {
            // If input is coordinates (lat, lon), parse and call AQI directly
            const [lat, lon] = userInput.split(',').map(coord => parseFloat(coord.trim()));
            getCityName(lat, lon);  // Get city name based on new coordinates
            AQI(lat, lon);          // Update air quality and weather data with new coordinates
            updateMapCenter(lat, lon); // 지도 위치 업데이트
        } else {
            // If input is a city name, fetch coordinates using OpenCage Geocoding API
            const apiKey = '737bbe2e76644c178038fcaebc838642'; // OpenCage API key
            const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${userInput}&key=${apiKey}&language=en`;

            fetch(geocodeUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        const lat = data.results[0].geometry.lat;
                        const lon = data.results[0].geometry.lng;
                        getCityName(lat, lon);  // Get city name based on new coordinates
                        AQI(lat, lon);          // Update air quality and weather data with new coordinates
                        updateMapCenter(lat, lon); // 지도 위치 업데이트

                        // 도시를 찾았으면 alert 플래그 초기화
                        alertShown = false;
                    } else {
                        if (!alertShown) {
                            alert("City not found.");
                            alertShown = true;  // 알림 표시 후 플래그를 true로 설정하여 다시 표시되지 않도록 함
                        }
                    }
                })
                .catch(error => {
                    console.error("Error fetching city data: ", error);
                });
        }
    }
  });

  // 클릭 이벤트 추가
  map.on('click', function (event) {
    // 클릭된 위치의 좌표 가져오기
    const coordinate = event.coordinate;
    
    // 좌표를 위도/경도로 변환
    const lonLat = ol.proj.toLonLat(coordinate);
    const lon = lonLat[0];
    const lat = lonLat[1];

    getCityName(lat, lon);  // Get city name based on new coordinates
    AQI(lat, lon);          // Update air quality and weather data with new coordinates
    updateMapCenter(lat, lon); // 지도 위치 업데이트
  });


});
