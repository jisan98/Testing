How to run the application:
This application automatically updates Air Quality every 30 minutes.

1) The color of header and footer changes depending on real-time PM 2.5 concentration
	Under 15 (ug/m^3), blue. In between 15-50, green. In between 50-100, yellow. Above 100, red.
	This standard came from: https://www.airgwangsan.kr/page/?site=airmap&mn=854

2) The page is divided in three sections: Home, Data, About. An user can move to each section with navigation bar.
	
	Home section displays real-time Temperature, Humidity, PM 2.5, PM 10, NOx, NH3, CO2, SO2, VOC in numerical values.
	Data section displays Historical Data and Analysis. Historical Data contains temperature and humidity trends over the past 7 days with a form of the line chart. Analysis includes Real-time pollutant level, which shows the amount of each pollutant in a bar chart, and Real-time pollutant distribution, which shows the distribution of all the pollutant in a donut chart.
	About section includes information about this project: Name, Email, Used API.

The simulation process:
Firstly, this application transfer latitude, longitude value of Busan to Openweather API. From the API, the application updates the value of three charts. Ps) This application is utilizing free API key that doesn't contain paid features, specifically providing Air Quality history. As a result, temperature and humidity trends over the past 7 days had been implemented with randomly-generated 7 values, created by adding and substracting a random value between 0 and 2 to today's temperature and humidity. All the procedures are repeated every 30 minutes by setting interval.

Used libraries:
Chart.js
Openweather API: https://openweathermap.org/