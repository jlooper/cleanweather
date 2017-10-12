const Vue = require('nativescript-vue/dist/index')
const Geolocation = require("nativescript-geolocation");
const Accuracy = require("ui/enums");
const http = require("http");

let app = new Vue({
    data: () => {
        return {
            city: 'My Location',
            summary: 'My Current Weather',
            currentTemperature: '',
            apparentTemperature: '',
            humidity: '',
            windSpeed: '',
            visibility: '',
            day: '',
            time: ''
        }
    },
    
    template: `
        <page>
        <grid-layout rows="auto,auto">
            <stack-layout row="0">
                <label class="bold" :text="city"></label>
                <label :text="summary"></label>
                <image class="weather-image" src='~/images/cloudy.png'></image>
                    
                <grid-layout class="weather-box" columns="1*,1*" rows="auto">
                        <label col="0" row="0" class="large" :text="currentTemperature"></label>
                        <stack-layout col="1" row="0">
                            <label class="small bold" text="details"></label>
                            <stack-layout class="hr-light tight"></stack-layout>
                            <label class="small" :text="apparentTemperature"></label>
                            <label class="small" :text="humidity"></label>
                            <label class="small" :text="windSpeed"></label>
                            <label class="small" :text="visibility"></label>
                        </stack-layout>                    
                <grid-layout>
            </stack-layout>

            <stack-layout row="1">

            <stack-layout class="hr-light"></stack-layout>
                
            <label :text="day"></label>
                
            <stack-layout class="hr-light"></stack-layout>                
                
            <label :text="time"></label>
            
            </stack-layout>
        
        </page>
    `,

    created() {
        this.getMyWeather()
        
        //date manipulations
        var currentDate = new Date()
        var day = currentDate.getDay()
        var weekdays = new Array(7);
        weekdays[0] = "Sunday";
        weekdays[1] = "Monday";
        weekdays[2] = "Tuesday";
        weekdays[3] = "Wednesday";
        weekdays[4] = "Thursday";
        weekdays[5] = "Friday";
        weekdays[6] = "Saturday";
        var dayName = weekdays[day];
        var currentHours = currentDate.getHours()
        var timeOfDay = (currentHours < 12 ) ? "Morning" : "Afternoon"
        this.day = dayName
        this.time = timeOfDay    
    },
    
    methods: { 
        getMyCity(lat,long){
            //sample call 
            http.request({
                url: "https://nominatim.openstreetmap.org/reverse?format=json&lat="+lat+"&lon="+long+"&zoom=18&addressdetails=1",
                method: "GET"
            }).then(response => {
                var obj = response.content.toJSON()
                console.log(obj.address.city) 
                this.city = obj.address.city      
            }) 
        },    
        getMyWeather() {
            Geolocation.enableLocationRequest();
            //handle, accept 'ok' push
            Geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high, updateDistance: 0.1, timeout: 20000 })
            .then(loc => {
                if (loc) {
                    this.getMyCity(loc.latitude,loc.longitude)
                    console.log(loc.latitude + ' and ' + loc.longitude);
                    http.request({
                        url: "https://api.forecast.io/forecast/c9002942b156fa5d0583934e2b1eced8/"+loc.latitude+","+loc.longitude,
                        method: "GET"
                    }).then( response => {
                        var obj = response.content.toJSON();
                        this.summary = obj.currently.summary;
                        console.log(JSON.stringify(obj.currently))
                        this.humidity = 'humidity: '+obj.currently.humidity.toString()+'%';
                        this.windSpeed = 'wind: '+obj.currently.windSpeed.toString()+' mph';
                        this.apparentTemperature = 'feels like: '+Math.round(obj.currently.apparentTemperature).toString() + '°';
                        this.visibility = 'visibility: '+obj.currently.visibility.toString()+' m';
                        this.currentTemperature = Math.round(obj.currently.temperature).toString() + '°';
                    })                    
                }
            }, function(e) {
                console.log("Error: " + e.message);
            });
        }
    }
})

app.$start()