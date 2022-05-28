$(function () {
    var history = JSON.parse(localStorage.getItem("search")) || [];

    // APIKey
    var APIKey = "e1de4dde4a3848391fcce5cdaca68968";

    // get weather from open weather api
    function getWeather(cityName) {
        var URL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=" + APIKey;
        axios.get(URL).then(function (response) {

            // display current weather
            $("#weather").removeClass("d-none");
            $("#city-name").html(response.data.name + ' (' + new Date(response.data.dt * 1000).toLocaleDateString('en-US') + ')');
            $("#weather-img").attr({ "src": "https://openweathermap.org/img/wn/" + response.data.weather[0].icon + "@2x.png", "alt": response.data.weather[0].description });
            $("#temperature").html("Temp: " + Math.floor(response.data.main.temp) + " °F");
            $("#wind").html("Wind: " + response.data.wind.speed + " MPH");
            $("#humidity").html("Humidity: " + response.data.main.humidity + "%");

            // Get UV Index from open weather UVapi
            var lat = response.data.coord.lat;
            var lon = response.data.coord.lon;
            var UVURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
            axios.get(UVURL).then(function (response) {
                // Show UV index in different colors
                if (response.data[0].value < 4) {
                    $('#UVIndex').attr("class", "rounded-3 bg-success p-2 fw-bold");
                }
                else if (response.data[0].value < 8) {
                    $('#UVIndex').attr("class", "rounded-3 bg-warning p-2 fw-bold");
                }
                else {
                    $('#UVIndex').attr("class", "rounded-3 bg-danger p-2 fw-bold");
                }
                $('#UV').html("UV Index:");
                $('#UVIndex').html(response.data[0].value);
            });

            // Get 5 day forecast for this city
            var cityID = response.data.id;
            var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=imperial&appid=" + APIKey;
            axios.get(forecastURL).then(function (response) {

                //  Display forecast for next 5 days
                $('#5day-header').removeClass("d-none");
                for (i = 0; i < $(".forecast").length; i++) {
                    $(".forecast")[i].innerHTML = "";
                    var forecastDate = document.createElement("p");
                    var forecastImg = document.createElement("img");
                    var forecastTemp = document.createElement("p");
                    var forecastHumidity = document.createElement("p");
                    var forecastWind = document.createElement("p");

                    $(forecastDate).html(new Date(response.data.list[i * 8 + 6].dt * 1000).toLocaleDateString('en-US')).attr("class", "mt-3 mb-0 forecast-date");
                    $(".forecast")[i].append(forecastDate);
                    $(forecastImg).attr({ "src": "https://openweathermap.org/img/wn/" + response.data.list[i * 8 + 6].weather[0].icon + "@2x.png", "alt": response.data.list[i * 8 + 5].weather[0].description });
                    $(".forecast")[i].append(forecastImg);
                    $(forecastTemp).html("Temp: " + Math.floor(response.data.list[i * 8 + 6].main.temp) + " °F");
                    $(".forecast")[i].append(forecastTemp);
                    $(forecastHumidity).html("Humidity: " + response.data.list[i * 8 + 6].main.humidity + "%");
                    $(".forecast")[i].append(forecastHumidity);
                    $(forecastWind).html("Wind: " + response.data.list[i * 8 + 6].wind.speed + " MPH");
                    $(".forecast")[i].append(forecastWind);
                }
            });
        }).catch(function (err) {
            console.log(err);
        });
    }

    // Input city and get history from local storage
    $('#search').on("click", function () {
        var enter = $("#enter").val();
        if ($("#enter").val() === '') {
            alert("Please enter a city name");
            return;
        }
        else if (history.includes(enter)) {
            alert("You have already searched for this city");
            return;
        }
        else {
            getWeather(enter);
            history.push(enter);
            localStorage.setItem("search", JSON.stringify(history));
            renderhistory();
        }
    })

    // Clear History button
    $('#clear').on("click", function () {
        localStorage.clear();
        history = [];
        renderhistory();
    })

    function renderhistory() {
        $('#history').html('');
        for (let i = 0; i < history.length; i++) {
            const historyList = document.createElement("input");
            $(historyList).attr({ "type": "text", "class": "form-control d-block bg-white", "value": history[i], "readonly": "true" }).appendTo('#history');
            historyList.addEventListener("click", function () {
                getWeather(historyList.value);
            })
        }
    }

    if (history.length > 0) {
        getWeather(history[history.length - 1]);
    }
    renderhistory();

});
