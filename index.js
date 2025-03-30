    const key = 'G0JZwncNqSiKk8EXb3UP';
        const map = L.map('mapid', {
        zoomControl: false,
        minZoom: 2,
        maxBounds: [[-84, -180], [84, 180]], // Restrict map boundaries
        maxBoundsViscosity: 1.0 // Ensure the map view stops at the boundaries
        }).setView([38.0, -100.4], 4);

        const lightModeLayer = L.maptilerLayer({
            apiKey: key,
            style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=G0JZwncNqSiKk8EXb3UP' // Light mode
        });

        const darkModeLayer = L.maptilerLayer({
            apiKey: key,
            style: 'https://api.maptiler.com/maps/streets-v2-dark/style.json?key=G0JZwncNqSiKk8EXb3UP' // Dark mode
        });

        const satelliteLayer = L.maptilerLayer({
            apiKey: key,
            style: 'https://api.maptiler.com/maps/satellite/style.json?key=G0JZwncNqSiKk8EXb3UP' // Satellite mode
        });

        let currentMapLayer;

        function watermarkRemoval() {
            document.getElementById('mapid').removeChild(document.getElementById('mapid').lastChild)
        };

        function setMapType(type) {
            if (currentMapLayer) {
                map.removeLayer(currentMapLayer);
            }
            if (type === 'light') {
                currentMapLayer = lightModeLayer;
            } else if (type === 'dark') {
                currentMapLayer = darkModeLayer;
            } else if (type === 'satellite') {
                currentMapLayer = satelliteLayer;
            }
            map.addLayer(currentMapLayer);
            watermarkRemoval();
        };

        function dsEasterEgg() {
            document.getElementById("ds_menusound_1").play();
            
            function shutDown() {
                
            };
            setTimeout(shutDown(), 2000)
            close();
        };

// Dark Mode Detection
function detectDarkMode() {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMapType(isDarkMode ? 'dark' : 'light');
    document.querySelector(`input[name="map-type"][value="${isDarkMode ? 'dark' : 'light'}"]`).checked = true;
}
detectDarkMode();

loadReports();

trackingLocation = false;

// custom icon setup
var locationPin = L.icon ({
    iconUrl: 'pin.svg',

    iconSize:     [16, 16], // size of the icon
    iconAnchor:   [8, 8], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0]    // point from which the popup should open relative to the iconAnchor
})

var tornadoReport = L.icon ({
    iconUrl: 'reports/tornado.svg',

    iconSize:     [16, 24], // size of the icon
    iconAnchor:   [8, 24], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0]    // point from which the popup should open relative to the iconAnchor
})

var hailReport = L.icon ({
    iconUrl: 'reports/hail.svg',

    iconSize:     [16, 24], // size of the icon
    iconAnchor:   [8, 24], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0]    // point from which the popup should open relative to the iconAnchor
})

var windReport = L.icon ({
    iconUrl: 'reports/wind.svg',

    iconSize:     [16, 24], // size of the icon
    iconAnchor:   [8, 24], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0]    // point from which the popup should open relative to the iconAnchor
})

function locationGrab() {
    trackingLocation = true;
    const locgive = position => {
        mapMarker = L.marker([position.coords.latitude,position.coords.longitude], {icon: locationPin}).addTo(map);
    }
    const locerror = position => {
        console.error("Could not start location tracking.") 
    }
    const locationSucess = (position) => {
        // console.log(position); //giving away the location in the console IS a bad idea, uncomment for debug
        map.setView([position.coords.latitude,position.coords.longitude], 13);
        mapMarker.setLatLng([position.coords.latitude,position.coords.longitude], {icon: locationPin})
        console.log("Updated Location!")
        };
    const locationError = (position) => {
        console.error("Watch Position Failed !")
    };
    const locstart = navigator.geolocation.getCurrentPosition(locgive, locerror)
    const location = navigator.geolocation.watchPosition(locationSucess, locationError); // oh scary, oh oh shiver me timbers
}

function locate() {
    if (trackingLocation != true) {
        document.getElementById("lcbtn").classList.toggle("lcbtn-active");
        document.getElementById("lcicn").classList.toggle("lcicn-active");
        locationGrab();
        console.log("Tracking Location, Press again to stop.");
    } else {
        document.getElementById("lcbtn").classList.toggle("lcbtn-active");
        document.getElementById("lcicn").classList.toggle("lcicn-active");
        mapMarker.removeFrom(map)
        navigator.geolocation.clearWatch(location);
        trackingLocation = false;
        console.log("Stopped Traking Location.");
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addListener(detectDarkMode);

var apiData = {};
var mapFrames = [];
var lastPastFramePosition = -1;
var radarLayers = [];
var polygons = [];

var doFuture = true;

var optionKind = 'radar';

var optionTileSize = 256;
var optionColorScheme = 6; // Default color scheme for radar
var optionSmoothData = 1;
var optionSnowColors = 1;

var radarOpacity = 0.75;
var alertOpacity = 0.4;
var watchOpacity = 0.6;

var animationPosition = 0;
var animationTimer = false;

var loadingTilesCount = 0;
var loadedTilesCount = 0;

var radarON = true;
var satelliteON = false;
var alertON = true;
var watchesON = true;

var alertData = [];
var allalerts = [];

var displayFloodWarnings = true;
var displayFFloodWarnings = true;
var displayOtherWarnings = true;
var displaySpecWarnings = true;
var displayTorWarnings = true;
var displaySvrWarnings = true;
var displayTorWatches = true;
var displaySvrWatches = true;

var watchPolygons = {};

var watchesLoaded = false;
var alertsLoaded = false;

// Function to save settings to local storage
function saveSettings() {
    const settings = {
        radarOpacity,
        alertOpacity,
        watchOpacity,
        optionKind,
        optionTileSize,
        optionColorScheme,
        optionSmoothData,
        optionSnowColors,
        radarON,
        satelliteON,
        alertON,
        watchesON,
    };
    localStorage.setItem('weatherAppSettings', JSON.stringify(settings));
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('weatherAppSettings'));
    if (settings) {
        radarOpacity = settings.radarOpacity;
        alertOpacity = settings.alertOpacity;
        watchOpacity = settings.watchOpacity;
        optionKind = settings.optionKind;
        optionTileSize = settings.optionTileSize;
        optionColorScheme = settings.optionColorScheme;
        optionSmoothData = settings.optionSmoothData;
        optionSnowColors = settings.optionSnowColors;
        radarON = settings.radarON;
        satelliteON = settings.satelliteON;
        alertON = settings.alertON;
        watchesON = settings.watchesON;

        // Update UI labels
        document.getElementById('smoothing-button').innerHTML = optionSmoothData == 0 ? '<i class="fa-solid fa-wave-square"></i> Smoothing Off' : '<i class="fa-solid fa-wave-square"></i> Smoothing On';
        document.getElementById('highres-button').innerHTML = optionTileSize == 256 ? '<i class="fa-solid fa-highlighter"></i> Low Res Radar' : '<i class="fa-solid fa-highlighter"></i> High Res Radar';
        document.getElementById('colors').value = optionColorScheme;

        // Update sliders and their values
        document.getElementById('alert-opacity-slider').value = alertOpacity;
        document.getElementById('alert-opacity-value').textContent = alertOpacity;
        document.getElementById('radar-opacity-slider').value = radarOpacity;
        document.getElementById('radar-opacity-value').textContent = radarOpacity;

        // Update button styles based on state
        const alertButton = document.getElementById("refreshalerts");
        const watchButton = document.getElementById("togglewatches");

        alertButton.style.backgroundColor = alertON ? "#ffffff20" : "#5D9AFC";
        alertButton.style.color = alertON ? "white" : "white";
        alertButton.style.borderBottom = alertON ? "2px solid #636381;" : "2px solid #636381;"

        watchButton.style.backgroundColor = watchesON ? "#ffffff20" : "#5D9AFC";
        watchButton.style.color = watchesON ? "white" : "white";
        watchButton.style.borderBottom = watchesON ? "2px solid #636381;" : "2px solid white";

    }
}
loadSettings(); // Load settings when the page loads

function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
}

function reverseSubarrays(arr) {
    return arr.map(subArr => subArr.slice().reverse());
}

function findPair(list, target) {
    for (let i = 0; i < list.length; i++) {
        if (list[i][0] === target) {
            return list[i][1];
        }
    }
    return null;
}

function findPairInDictionary(dicts, target) {
    for (const dict of dicts) {
        console.log(dict + " with target " + target);
        console.log(alertData);
        if (target in dict) {
            return dict[target];
        }
    }
    console.log("Couldn't find obj.");
}

function convertDictsToArrayOfArrays(arr) {
    return arr.map(obj => Object.values(obj));
}

function getAlert(alertInfo) {
    var alertTitle = document.getElementById('alert_title');
    var alertTitlecolor = 'black';
    var alertTitlebackgroundColor = "white";
    var alertBorderColor = "#1A1A1A";
    var alertBorderWidth = "0px";
    if (alertInfo.properties.event.includes("Severe Thunderstorm")) {
        alertTitlebackgroundColor = "yellow";
        if (alertInfo.properties.description.toLowerCase().includes("80 mph") || alertInfo.properties.description.toLowerCase().includes("destructive")) {
            alertBorderColor = "yellow";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Tornado")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "red";
        if (alertInfo.properties.description.toLowerCase().includes("tornado emergency")) {
            alertBorderColor = "magenta";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Flash Flood Warning")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "lime";
        if (alertInfo.properties.description.toLowerCase().includes("flash flood emergency")) {
            alertBorderColor = "darkgreen";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Special Weather")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "white";
    }
    var construct = '<div class="alert-header" style="background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div><div style="overflow-y: auto; border: ' + alertBorderWidth + ' solid ' + alertBorderColor + ';">';
    construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>';

    try {
        var hazards = alertInfo.properties.description.split("HAZARD...")[1].split("\n\n")[0].replace(/\n/g, " ");
    } catch {
        var hazards = "No hazards identified.";
    }

    construct = construct + '<p style="margin: 0px;"><b>Hazards: </b>' + hazards + '</p>';

    try {
        var impacts = alertInfo.properties.description.split("IMPACTS...")[1].split("\n\n")[0].replace(/\n/g, " ");
    } catch {
        try {
            var impacts = alertInfo.properties.description.split("IMPACT...")[1].split("\n\n")[0].replace(/\n/g, " ");
        } catch {
            var impacts = "No impacts identified.";
        }
    }
    construct = construct + '<p style="margin: 0px;"><b>Impacts: </b>' + impacts + '</p><br>';

    var description = alertInfo.properties.description.replace(/(?:SVR|FFW|TOR)\d{4}/g, "").replace(/\n/g, "<br>");
    construct = construct + '<button class="more-info-button" onclick="showAlertPopup(' + JSON.stringify(alertInfo).replace(/"/g, '&quot;') + ')"><i class="fa-solid fa-info-circle"></i> More Info</button>';
    construct = construct + '</div>';

    return construct;
}

function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }).format(date);
}

function formatWatchDate(timestamp) {
    const year = parseInt(timestamp.slice(0, 4));
    const month = parseInt(timestamp.slice(4, 6)) - 1; // JavaScript months are 0-based
    const day = parseInt(timestamp.slice(6, 8));
    const hour = parseInt(timestamp.slice(8, 10));
    const minute = parseInt(timestamp.slice(10, 12));

    return new Date(Date.UTC(year, month, day, hour, minute));
}



function formatDate(inputDateString) {
    const inputDate = new Date(inputDateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }).format(inputDate);
}

function getAlert(alertInfo) {
    var alertTitlecolor = 'black';
    var alertTitlebackgroundColor = "white";
    var alertBorderColor = "#1A1A1A";
    var alertBorderWidth = "0px";

    if (alertInfo.properties.event.includes("Severe Thunderstorm")) {
        alertTitlebackgroundColor = "yellow";
        if (alertInfo.properties.description.toLowerCase().includes("80 mph wind gusts") || alertInfo.properties.description.toLowerCase().includes("destructive storm")) {
            alertBorderColor = "yellow";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Tornado")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "red";
        if (alertInfo.properties.description.toLowerCase().includes("tornado emergency")) {
            alertBorderColor = "magenta";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Flash Flood Warning")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "lime";
        if (alertInfo.properties.description.toLowerCase().includes("flash flood emergency")) {
            alertBorderColor = "darkgreen";
            alertBorderWidth = "0px";
        }
    } else if (alertInfo.properties.event.includes("Special Weather")) {
        alertTitlecolor = 'white';
        alertTitlebackgroundColor = "white";
    }

    var construct = '<div class="alert-header" style="background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div>';

    var customMessages = '';
    if (alertInfo.properties.description.includes("FLASH FLOOD EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div>';
    }
    if (alertInfo.properties.description.includes("TORNADO EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div>';
    } else if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div>';
    }
    if (alertInfo.properties.description.includes("confirmed tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div>';
    } else if (alertInfo.properties.description.includes("reported tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div>';
    }
    if (alertInfo.properties.description.includes("DESTRUCTIVE")) {
        customMessages += '<div style="background-color: red; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p></div>';
    } else if (alertInfo.properties.description.includes("considerable")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin-bottom: 3px; display: flex; justify-content: center; text-align: center;"><p style="margin: 3px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div>';
    }

    // Extract source from the description
    let source = "Unknown";
    try {
        source = alertInfo.properties.description.match(/SOURCE\.\.\.(.*?)(?=\n[A-Z]|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting source:", e);
    }

    construct += customMessages;
    construct += '<div style="overflow-y: auto; border: ' + alertBorderWidth + ' solid ' + alertBorderColor + ';">';
    construct += '<p style="margin: 0;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct += '<p style="margin: 0;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct += '<p style="margin: 0;"><b>Source:</b> ' + source + '</p><br>';

    // Extracting hazards
    var hazards = "No hazards identified.";
    try {
        hazards = alertInfo.properties.description.match(/HAZARD\.\.\.(.*?)(?=\n[A-Z]|\*|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting hazards:", e);
    }
    construct += '<p style="margin: 0;"><b>Hazards: </b>' + hazards + '</p>';

    // Extracting impacts
    var impacts = "No impacts identified.";
    try {
        impacts = alertInfo.properties.description.match(/IMPACTS\.\.\.(.*?)(?=\n[A-Z]|\*|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        try {
            impacts = alertInfo.properties.description.match(/IMPACT\.\.\.(.*?)(?=\n[A-Z]|\*|$)/s)[1].replace(/\n/g, " ");
        } catch (e) {
            console.log("Error extracting impacts:", e);
        }
    }
    construct += '<p style="margin: 0;"><b>Impacts: </b>' + impacts + '</p><br>';

    // Extracting description
    var description = alertInfo.properties.description.replace(/(?:SVR|FFW|TOR)\d{4}/g, "").replace(/\n/g, "<br>");
    construct += '<button class="more-info-button" onclick="showAlertPopup(' + JSON.stringify(alertInfo).replace(/"/g, '&quot;') + ')"><i class="fa-solid fa-info-circle"></i> More Info</button>';
    construct += '</div>';

    return construct;
}

function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }).format(date);
}


function changeRadarPosition(position, preloadOnly, force) {
    while (position >= mapFrames.length) {
        position -= mapFrames.length;
    }
    while (position < 0) {
        position += mapFrames.length;
    }

    var currentFrame = mapFrames[animationPosition];
    var nextFrame = mapFrames[position];

    addLayer(nextFrame);

    if (preloadOnly || (isTilesLoading() && !force)) {
        return;
    }

    animationPosition = position;

    if (radarLayers[currentFrame.path]) {
        radarLayers[currentFrame.path].setOpacity(0);
    }
    radarLayers[nextFrame.path].setOpacity(radarOpacity);

    var pastOrForecast = nextFrame.time > Date.now() / 1000 ? 'Forecast' : (nextFrame.time === mapFrames[lastPastFramePosition].time ? 'Current' : 'Past');

    //document.getElementById("timestamp").innerHTML = pastOrForecast + " • " + formatDate(new Date(nextFrame.time * 1000).toISOString());
    document.getElementById("timestamp").innerHTML = formatDate(new Date(nextFrame.time * 1000).toISOString());
};

document.getElementById("timeline-slider").oninput = function() {
    changeRadarPosition(this.value);
};



function logAlert(alertInfo) {
    var alertLog = document.getElementById('alert-log');
    var alertClass = '';
    if (alertInfo.properties.event.includes("Severe Thunderstorm")) {
        alertClass = 'alert-severe-thunderstorm';
    } else if (alertInfo.properties.event.includes("Tornado")) {
        alertClass = 'alert-tornado';
    } else if (alertInfo.properties.event.includes("Flash Flood Warning")) {
        alertClass = 'alert-flash-flood';
    } else if (alertInfo.properties.event.includes("Special Weather")) {
        alertClass = 'alert-special-weather';
    }

    if (alertClass) {
        var listItem = document.createElement('li');
        listItem.innerHTML =
            `<div class="alert-header ${alertClass}" style="padding: 5px; font-size: 18px; font-weight: bolder;">${alertInfo.properties.event}</div>
    <div>
        <b>Issued:</b> ${formatTimestamp(alertInfo.properties.sent)}<br>
        <b>Expires:</b> ${formatTimestamp(alertInfo.properties.expires)}<br>
        <b>Areas:</b> ${alertInfo.properties.areaDesc}
    </div>
    <button class="more-info-button" onclick="showAlertPopup(${JSON.stringify(alertInfo).replace(/"/g, '&quot;')})"><i class="fa-solid fa-info-circle"></i>More Info</button>`;
        alertLog.appendChild(listItem); // Append items to the end of the list
    }
}


function showAlertPopup(alertInfo) {
    document.getElementById('popup-title').innerText = alertInfo.properties.event;
    document.getElementById('popup-title').style.backgroundColor = getAlertHeaderColor(alertInfo.properties.event);

    // Custom messages
    let customMessages = '';
    if (alertInfo.properties.description.includes("FLASH FLOOD EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div><br>';
    }
    if (alertInfo.properties.description.includes("TORNADO EMERGENCY")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0;"><b>THIS IS AN EMERGENCY SITUATION</b></p></div><br>';
    }
    if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")) {
        customMessages += '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div><br>';
    }
    if (alertInfo.properties.description.includes("confirmed tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("reported tornado")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    }
    if (alertInfo.properties.description.includes("DESTRUCTIVE")) {
        customMessages += '<div style="background-color: red; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("considerable")) {
        customMessages += '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px 0; color: white;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
    }

    // Extract source from the description
    let source = "Unknown";
    try {
        source = alertInfo.properties.description.match(/SOURCE\.\.\.(.*?)(?=\n[A-Z]|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting source:", e);
    }

    document.getElementById('popup-details').innerHTML = `${customMessages}<b>Issued:</b> ${formatTimestamp(alertInfo.properties.sent)}<br><b>Expires:</b> ${formatTimestamp(alertInfo.properties.expires)}<br><b>Source:</b> ${source}`;

    // Extract hazards and impacts
    let hazards = "Unknown";
    try {
        hazards = alertInfo.properties.description.match(/HAZARD\.\.\.(.*?)(?=\n[A-Z]|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        console.log("Error extracting hazards:", e);
    }

    let impacts = "Unknown";
    try {
        impacts = alertInfo.properties.description.match(/IMPACTS\.\.\.(.*?)(?=\n[A-Z]|\*|$)/s)[1].replace(/\n/g, " ");
    } catch (e) {
        try {
            impacts = alertInfo.properties.description.match(/IMPACT\.\.\.(.*?)(?=\n[A-Z]|\*|$)/s)[1].replace(/\n/g, " ");
        } catch (e) {
            console.log("Error extracting impacts:", e);
        }
    }

    document.getElementById('popup-hazards-impacts').innerHTML = `<b>Hazards:</b> ${hazards}<br><b>Impacts:</b> ${impacts}`;
    document.getElementById('popup-description').innerHTML = `<b>Description:</b><br><p style="margin: 0px; padding-left: 13px; border-left: 5px solid ${getAlertHeaderColor(alertInfo.properties.event)}; border-radius: 5px;">${alertInfo.properties.description.replace(/(?:SVR|FFW|TOR)\d{4}/g, "").replace(/\*/g, "").replace(/\n/g, "<br>")}</p>`;
    document.getElementById('popup-action').innerHTML = `<b>Action Recommended:</b> ${alertInfo.properties.instruction || 'No specific actions recommended.'}`;
    var popup = document.getElementById('alert-popup');
    popup.classList.add('show');
}

function getAlertHeaderColor(event) {
    if (event.includes("Severe Thunderstorm")) return "yellow";
    if (event.includes("Tornado")) return "red";
    if (event.includes("Flash Flood Warning")) return "lime";
    if (event.includes("Special Weather")) return "white";
    return "white";
}

function closeAlertPopup() {
    var popup = document.getElementById('alert-popup');
    popup.classList.add('fade-out');
    setTimeout(() => {
        popup.classList.remove('show', 'fade-out');
    }, 300);
}


function zoomToAlert(coordinates) {
    var bounds = L.latLngBounds(reverseSubarrays(coordinates[0]));
    map.fitBounds(bounds);
}

// Load and display alerts
function loadAlerts() {
    if (!alertON) return; // Don't load alerts if alertON is false

    console.log("Loading alerts");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.weather.gov/alerts/active', true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');
    console.log("A");
    xhr.onreadystatechange = function() {
        console.log("running");
        if (xhr.readyState === 4 && xhr.status === 200) {
            var alerts = JSON.parse(xhr.responseText).features;
            alerts.sort((a, b) => new Date(a.properties.sent) - new Date(b.properties.sent)); // Sort oldest to newest
            document.getElementById('alert-log').innerHTML = ''; // Clear existing alert log
            alerts.reverse().forEach(function(alert) { // Reverse to display newest first
                try {
                    var thisItem = alert.geometry.coordinates[0];
                    console.log(thisItem);
                    var polygonOptions = {};
                    if (alert.properties.event.includes("Severe Thunderstorm")) {
                        polygonOptions.color = 'yellow';
                        if (alert.properties.description.toLowerCase().includes("80 mph") || alert.properties.description.toLowerCase().includes("destructive")) {
                            polygonOptions.color = 'yellow';
                            polygonOptions.weight = 5;
                        }
                    } else if (alert.properties.event.includes("Tornado")) {
                        polygonOptions.color = 'red';
                        if (alert.properties.description.toLowerCase().includes("tornado emergency")) {
                            polygonOptions.color = 'magenta';
                            polygonOptions.weight = 5;
                        }
                    } else if (alert.properties.event.includes("Flash Flood Warning")) {
                        polygonOptions.color = 'lime';
                        if (alert.properties.description.toLowerCase().includes("flash flood emergency")) {
                            polygonOptions.color = 'darkgreen';
                            polygonOptions.weight = 5;
                        }
                    } else if (alert.properties.event.includes("Special Weather")) {
                        polygonOptions.color = 'white';
                    }
                    if (polygonOptions.color) {
                        var polygon = L.polygon(reverseSubarrays(thisItem), polygonOptions).addTo(map);
                        polygon.setStyle({
                            fillOpacity: alertOpacity
                        });
                        var thisAlert = [];
                        thisAlert.push(polygon.getLatLngs().join());
                        thisAlert.push(alert.properties.id);
                        allalerts.push(thisAlert);
                        polygon.bindPopup(getAlert(alert), {
                            "autoPan": true,
                            'maxheight': '500',
                            'maxWidth': '400',
                            'className': 'alertpopup'
                        });
                        polygon.on('mouseover', function(e) {
                            polygon.setStyle({
                                color: polygonOptions.color,
                                fillOpacity: 0.7
                            });
                        });
                        polygon.on('mouseout', function(e) {
                            polygon.setStyle({
                                color: polygonOptions.color,
                                fillOpacity: alertOpacity
                            });
                        });
                        polygon.on('click', function(e) {
                            e.originalEvent.stopPropagation();
                        });
                        polygons.push(polygon);
                    }
                    logAlert(alert);
                } catch {
                    console.log("No coords for obj.");
                }
            });
        } else {
            console.log("API Error");
        }
    };
    xhr.send();
}


// Ensure the alert list is refreshed dynamically
setInterval(() => {
    document.getElementById('alert-log').innerHTML = ''; // Clear existing alert log
    polygons.forEach(polygon => {
        const alertId = allalerts.find(alert => alert[0] === polygon.getLatLngs().join())[1];
        const alertInfo = findPairInDictionary(alertData, alertId);
        if (alertInfo) {
            logAlert(alertInfo);
        }
    });
}, 60000); // Refresh every minute

function getWatchRisk(percentage, type) {
    let category = 'Very Low';
    let style = 'background-color: beige; color: black;';

    if (type === 'EF2-EF5 tornadoes') {
        if (percentage < 2) {
            category = 'Very Low';
            style = 'background-color: beige; color: black;';
        } else if (percentage >= 2 && percentage < 20) {
            category = 'Low';
            style = 'background-color: orange; color: white;';
        } else if (percentage >= 20 && percentage < 30) {
            category = 'Moderate';
            style = 'background-color: red; color: white;';
        } else if (percentage >= 30) {
            category = 'High';
            style = 'background-color: pink; color: magenta; font-weight: bold;';
        }
    } else {
        if (percentage < 5) {
            category = 'Very Low';
            style = 'background-color: beige; color: black;';
        } else if (percentage >= 5 && percentage < 20) {
            category = 'Low';
            style = 'background-color: orange; color: white;';
        } else if (percentage >= 20 && percentage < 30) {
            category = 'Moderate';
            style = 'background-color: red; color: white;';
        } else if (percentage >= 30) {
            category = 'High';
            style = 'background-color: magenta; color: white; font-weight: bold;';
        }
    }

    return `<span class="risk-level" style="${style}">${category}</span>`;
}


function getWatch(watch) {
    const alertTitlecolor = 'white';
    const alertTitlebackgroundColor = watch.properties.TYPE == "SVR" ? "#516BFF" : "#FE5859";
    const alertTitle = `${watch.properties.TYPE == "TOR" ? "Tornado Watch #" : "Severe T-Storm Watch #"}${watch.properties.NUM}`;

    const issuedDate = formatWatchDate(watch.properties.ISSUE);
    const expiresDate = formatWatchDate(watch.properties.EXPIRE);

    const issuedFormatted = issuedDate.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZoneName: 'short'
    });

    const expiresFormatted = expiresDate.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZoneName: 'short'
    });

    let construct = `
<div style="overflow-y: auto; color: white;">
    <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: 20px; font-weight: bolder; background-color: ${alertTitlebackgroundColor}; color: ${alertTitlecolor};">
        ${alertTitle}
    </div>`;

    if (watch.properties.IS_PDS) {
        construct += `
    <div style="background-color: magenta; border-radius: 5px; margin: 10px 0; display: flex; justify-content: center; text-align: center;">
        <p style="margin: 5px 0;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p>
    </div>`;
    }

    construct += `
    <br>
    <p style="margin: 0px;"><b>Issued:</b> ${issuedFormatted}</p>
    <p style="margin: 0px; margin-bottom: 5px;"><b>Expires:</b> ${expiresFormatted}</p>
    <p style="margin: 0px;"><b>Max Hail Size:</b> ${watch.properties.MAX_HAIL}"</p>
    <p style="margin: 0px;"><b>Max Wind Gusts:</b> ${Math.ceil(watch.properties.MAX_GUST * 1.15077945)} mph</p><br>
    <button class="more-info-button" onclick="showWatchPopup(${JSON.stringify(watch).replace(/"/g, '&quot;')})"><i class="fa-solid fa-info-circle"></i> More Info</button>
</div>`;

    return construct;
}

function showWatchPopup(alertInfo) {
    var popup = document.getElementById('watch-popup');
    document.getElementById('watch-popup-title').innerText = alertInfo.properties.TYPE === "TOR" ? "Tornado Watch #" + alertInfo.properties.NUM : "Severe T-Storm Watch #" + alertInfo.properties.NUM;
    document.getElementById('watch-popup-title').style.backgroundColor = alertInfo.properties.TYPE === "TOR" ? "#FE5859" : "#516BFF";

    var issuedDate = new Date(formatWatchDate(alertInfo.properties.ISSUE).getTime());
    var expiresDate = new Date(formatWatchDate(alertInfo.properties.EXPIRE).getTime());

    var issuedFormatted = issuedDate.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZoneName: 'short'
    });

    var expiresFormatted = expiresDate.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZoneName: 'short'
    });

    var details = `<p style="margin: 0px;"><b>Issued:</b> ${issuedFormatted}</p>`;
    details += `<p style="margin: 0px; margin-bottom: 5px;"><b>Expires:</b> ${expiresFormatted}</p>`;
    details += `<p style="margin: 0px;"><b>Max Hail Size:</b> ${alertInfo.properties.MAX_HAIL}"</p>`;
    details += `<p style="margin: 0px;"><b>Max Wind Gusts:</b> ${Math.ceil(alertInfo.properties.MAX_GUST * 1.15077945)} mph</p><br>`;

    if (alertInfo.properties.IS_PDS) {
        details += `
    <div style="background-color: magenta; border-radius: 5px; margin: 10px 0; display: flex; justify-content: center; text-align: center;">
        <p style="margin: 5px 0;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p>
    </div>`;
    }

    var probabilities = '<h3>Probabilities</h3>';
    probabilities += '<p style="margin: 5px 0;"><b>Tornado threat: </b>' + getWatchRisk(alertInfo.properties.P_TORTWO) + '</p>';
    probabilities += '<p style="margin: 5px 0 15px 0;"><b>Strong tornado threat: </b>' + getWatchRisk(alertInfo.properties.P_TOREF2) + '</p>';
    probabilities += '<p style="margin: 5px 0;"><b>Wind threat: </b>' + getWatchRisk(alertInfo.properties.P_WIND10) + '</p>';
    probabilities += '<p style="margin: 5px 0 15px 0;"><b>Strong wind threat: </b>' + getWatchRisk(alertInfo.properties.P_WIND65) + '</p>';
    probabilities += '<p style="margin: 5px 0;"><b>Hail threat: </b>' + getWatchRisk(alertInfo.properties.P_HAIL10) + '</p>';
    probabilities += '<p style="margin: 5px 0 15px 0;"><b>Severe hail threat: </b>' + getWatchRisk(alertInfo.properties.P_HAIL2I) + '</p>';

    document.getElementById('watch-popup-details').innerHTML = details;
    document.getElementById('watch-popup-probabilities').innerHTML = probabilities;
    popup.classList.add('show');
}

function closeWatchPopup() {
    var popup = document.getElementById('watch-popup');
    popup.classList.add('fade-out');
    setTimeout(() => {
        popup.classList.remove('show', 'fade-out');
    }, 300);
}

// Add this function to convert date strings to Date objects
function formatWatchDate(timestamp) {
    const year = parseInt(timestamp.slice(0, 4));
    const month = parseInt(timestamp.slice(4, 6)) - 1; // JavaScript months are 0-based
    const day = parseInt(timestamp.slice(6, 8));
    const hour = parseInt(timestamp.slice(8, 10));
    const minute = parseInt(timestamp.slice(10, 12));

    return new Date(Date.UTC(year, month, day, hour, minute));
}


function loadWatches() {
    if (!watchesON) return;

    console.log("Getting watches");
    const xhr = new XMLHttpRequest();
    const currentDate = new Date();
    xhr.open('GET', `https://www.mesonet.agron.iastate.edu/cgi-bin/request/gis/spc_watch.py?year1=${currentDate.getFullYear()}&month1=${currentDate.getMonth() + 1}&day1=${currentDate.getDate()}&hour1=0&minute1=0&year2=${currentDate.getFullYear()}&month2=${currentDate.getMonth() + 1}&day2=${currentDate.getDate()}&hour2=23&minute2=0&format=geojson`, true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const watches = JSON.parse(xhr.responseText).features;
            watches.forEach(function(watch) {
                const thisItem = reverseSubarrays(watch.geometry.coordinates[0][0]);
                if ((watch.properties.TYPE == "SVR" && displaySvrWatches) || (watch.properties.TYPE == "TOR" && displayTorWatches)) {
                    const polygon = L.polygon(thisItem, {
                        color: watch.properties.TYPE == "SVR" ? '#516BFF' : '#FE5859',
                        fillOpacity: 0 // Set fillOpacity to 0 to remove alert fill
                    }).addTo(map);
                    polygon.bindPopup(getWatch(watch), {
                        autoPan: true,
                        maxHeight: '600',
                        maxWidth: '500',
                        className: 'alertpopup'
                    });

                    // Comment out or remove these lines to disable hover effect
                    /*
                    polygon.on('mouseover', function (e) {
                        polygon.setStyle({ color: polygon.options.color, fillOpacity: 0.5 });
                    });
                    polygon.on('mouseout', function (e) {
                        polygon.setStyle({ color: polygon.options.color, fillOpacity: 0 });
                    });
                    */

                    polygon.on('click', function(e) {
                        e.originalEvent.stopPropagation();
                    });
                    polygons.push(polygon);

                    // Store the polygon with its expiration time
                    const expirationTime = formatWatchDate(watch.properties.EXPIRE).getTime();
                    watchPolygons[expirationTime] = polygon;

                    console.log(`Added watch: ${JSON.stringify(watch.properties)}`);
                    console.log(`Watch expiration time: ${new Date(expirationTime).toISOString()} (${expirationTime})`);
                }
            });
            watchesLoaded = true;
            checkIfLoadingComplete();

            // Perform an initial check for expired watches
            removeExpiredWatches();
        }
    };
    xhr.send();
}


function removeExpiredWatches() {
    const currentTime = new Date().getTime();
    console.log(`Checking for expired watches at: ${new Date(currentTime).toISOString()} (${currentTime})`);

    for (const expirationTime in watchPolygons) {
        const parsedExpirationTime = parseInt(expirationTime);
        const expirationDate = new Date(parsedExpirationTime);
        console.log(`Current time (GMT): ${new Date(currentTime).toISOString()}, Watch expiration time (GMT): ${expirationDate.toISOString()}`);

        if (currentTime > parsedExpirationTime) {
            const polygon = watchPolygons[parsedExpirationTime];
            map.removeLayer(polygon);
            delete watchPolygons[parsedExpirationTime];
            console.log(`Removed expired watch with expiration time: ${expirationDate.toISOString()} (${parsedExpirationTime})`);
        } else {
            console.log(`Watch not expired: ${expirationDate.toISOString()} (${parsedExpirationTime})`);
        }
    }
}


// Helper function to log all current watches for debugging
function logCurrentWatches() {
    console.log("Current watches in watchPolygons:");
    for (const expirationTime in watchPolygons) {
        const parsedExpirationTime = parseInt(expirationTime);
        const expirationDate = new Date(parsedExpirationTime);
        console.log(`Watch expiration time: ${expirationDate.toISOString()} (${parsedExpirationTime})`);
    }
}

// Call logCurrentWatches to see the current watches
logCurrentWatches();

var loadingScreen = document.getElementById('loading-screen');

function loadAlerts() {
    if (!alertON) return; // Don't load alerts if alertON is false

    console.log("Loading alerts");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.weather.gov/alerts/active', true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');
    console.log("A");
    xhr.onreadystatechange = function() {
        console.log("running");
        if (xhr.readyState === 4 && xhr.status === 200) {
            var alerts = JSON.parse(xhr.responseText).features;
            alerts.sort((a, b) => new Date(a.properties.sent) - new Date(b.properties.sent)); // Sort oldest to newest
            document.getElementById('alert-log').innerHTML = ''; // Clear existing alert log
            alerts.reverse().forEach(function(alert) { // Reverse to display newest first
                try {
                    var thisItem = alert.geometry.coordinates[0];
                    console.log(thisItem);
                    var polygonOptions = {};
                    if (alert.properties.event.includes("Severe Thunderstorm")) {
                        polygonOptions.color = 'yellow';
                        if (alert.properties.description.toLowerCase().includes("80 mph") || alert.properties.description.toLowerCase().includes("destructive")) {
                            polygonOptions.color = 'yellow';
                            polygonOptions.weight = 5;
                        }
                    } else if (alert.properties.event.includes("Tornado")) {
                        polygonOptions.color = 'red';
                        if (alert.properties.description.toLowerCase().includes("tornado emergency")) {
                            polygonOptions.color = 'magenta';
                            polygonOptions.weight = 5;
                        }
                    } else if (alert.properties.event.includes("Flash Flood Warning")) {
                        polygonOptions.color = 'green';
                        if (alert.properties.description.toLowerCase().includes("flash flood emergency")) {
                            polygonOptions.color = 'darkgreen';
                            polygonOptions.weight = 5;
                        }
                    } else if (alert.properties.event.includes("Special Weather")) {
                        polygonOptions.color = 'white';
                    }
                    if (polygonOptions.color) {
                        var polygon = L.polygon(reverseSubarrays(thisItem), polygonOptions).addTo(map);
                        polygon.setStyle({
                            fillOpacity: alertOpacity
                        });
                        var thisAlert = [];
                        thisAlert.push(polygon.getLatLngs().join());
                        thisAlert.push(alert.properties.id);
                        allalerts.push(thisAlert);
                        polygon.bindPopup(getAlert(alert), {
                            "autoPan": true,
                            'maxheight': '500',
                            'maxWidth': '400',
                            'className': 'alertpopup'
                        });
                        polygon.on('mouseover', function(e) {
                            polygon.setStyle({
                                color: polygonOptions.color,
                                fillOpacity: 0.7
                            });
                        });
                        polygon.on('mouseout', function(e) {
                            polygon.setStyle({
                                color: polygonOptions.color,
                                fillOpacity: alertOpacity
                            });
                        });
                        polygon.on('click', function(e) {
                            e.originalEvent.stopPropagation();
                        });
                        polygons.push(polygon);
                    }
                    logAlert(alert);
                } catch {
                    console.log("No coords for obj.");
                }
            });

            alertsLoaded = true; // Set alertsLoaded flag to true
            checkIfLoadingComplete(); // Check if both watches and alerts are loaded
        } else {
            console.log("API Error");
        }
    };
    xhr.send();
}


function checkIfLoadingComplete() {
    if (watchesLoaded && alertsLoaded) {
        // Fade out the loading screen
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            isLoadingScreenVisible = false; // Set flag to false after hiding the loading screen
            checkConnection(); // Check connection after hiding the loading screen
        }, 300); // Remove loading screen after fade out
    }
}


function removeExpiredWatchesBasedOnDate() {
    const currentDate = new Date();
    console.log(`Checking for expired watches based on date at: ${currentDate}`);
    for (const expirationTime in watchPolygons) {
        const expirationDate = new Date(parseInt(expirationTime));
        if (currentDate > expirationDate) {
            const polygon = watchPolygons[expirationTime];
            map.removeLayer(polygon);
            delete watchPolygons[expirationTime];
            console.log(`Removed expired watch based on date with expiration time: ${expirationDate}`);
        }
    }
}


function updateAlertOpacity(value) {
    alertOpacity = parseFloat(value);
    document.getElementById('alert-opacity-value').textContent = value;
    polygons.forEach(polygon => {
        if (polygon.options.color !== "#516BFF" && polygon.options.color !== "#FE5859") { // Ensure this condition matches your watch polygon colors
            polygon.setStyle({
                fillOpacity: alertOpacity
            });
        }
    });
    saveSettings(); // Save settings after changing alert opacity
}

function updateRadarOpacity(value) {
    radarOpacity = parseFloat(value);
    document.getElementById('radar-opacity-value').textContent = value;
    Object.values(radarLayers).forEach(layer => {
        if (layer && map.hasLayer(layer)) {
            layer.setOpacity(radarOpacity);
        }
    });
    saveSettings(); // Save settings after changing radar opacity
}


function formatDate(inputDateString) {
    const inputDate = new Date(inputDateString);

    const timeString = inputDate.toTimeString();

    const hours = inputDate.getHours();
    const minutes = inputDate.getMinutes();

    const formattedHours = (hours % 12) || 12;

    const amOrPm = hours >= 12 ? 'PM' : 'AM';

    const formattedTimeString = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${amOrPm}`;

    return formattedTimeString;
}

function startLoadingTile() {
    loadingTilesCount++;
}

function finishLoadingTile() {
    setTimeout(function() {
        loadedTilesCount++;
    }, 250);
}

function isTilesLoading() {
    return loadingTilesCount > loadedTilesCount;
}

var apiRequest = new XMLHttpRequest();
apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
apiRequest.onload = function(e) {
    apiData = JSON.parse(apiRequest.response);
    console.log("API Data Loaded:", apiData);
    initialize(apiData, optionKind);
};
apiRequest.onerror = function(e) {
    console.error("API request error:", e);
};
apiRequest.send();

function initialize(api, kind) {
    console.log("Initializing map with kind:", kind);
    for (var i in radarLayers) {
        map.removeLayer(radarLayers[i]);
    }
    for (var j in polygons) {
        map.removeLayer(polygons[j]);
    }
    mapFrames = [];
    radarLayers = [];
    polygons = [];
    animationPosition = 0;

    if (!api) {
        console.error("API data is not available.");
        return;
    }
    if (kind == 'radar' && api.radar && api.radar.past) {
        mapFrames = api.radar.past;
        if (api.radar.nowcast) {
            if (doFuture) {
                mapFrames = mapFrames.concat(api.radar.nowcast);
            }
        }

        lastPastFramePosition = api.radar.past.length - 1;
        showFrame(lastPastFramePosition, true);
    } else if (kind == 'satellite' && api.satellite && api.satellite.infrared) {
        mapFrames = api.satellite.infrared;
        lastPastFramePosition = api.satellite.infrared.length - 1;
        showFrame(lastPastFramePosition, true);
    }

    loadWatches();
    setTimeout(() => {
        loadAlerts();
        // Fade out the loading screen after the delay
        loadingScreen.classList.add('fade-out');
        setTimeout(() => loadingScreen.style.display = 'none', 300); // Remove loading screen after fade out
    }, 600); // Adjust the delay as needed

    // Perform an initial check for expired watches
    setTimeout(removeExpiredWatches, 1000); // Add a slight delay to ensure watches are loaded

    // Set up periodic check for expired watches
    setInterval(removeExpiredWatches, 60000); // Check every minute
}


function cleanupExpiredWatches() {
    const currentTime = Date.now();
    console.log(`Performing cleanup for expired watches at: ${new Date(currentTime)} (${currentTime})`);
    for (const expirationTime in watchPolygons) {
        const parsedExpirationTime = parseInt(expirationTime);
        const expirationDate = new Date(parsedExpirationTime);
        const currentDate = new Date(currentTime);
        console.log(`Current time: ${currentDate}, Watch expiration time: ${expirationDate}`);

        if (currentTime > parsedExpirationTime) {
            const polygon = watchPolygons[parsedExpirationTime];
            map.removeLayer(polygon);
            delete watchPolygons[parsedExpirationTime];
            console.log(`Cleaned up expired watch with expiration time: ${expirationDate} (${parsedExpirationTime})`);
        }
    }
}

// Schedule cleanup
setInterval(cleanupExpiredWatches, 60000); // Check every minute


function addLayer(frame) {
    if (!radarLayers[frame.path]) {
        var colorScheme = optionKind == 'satellite' ? 0 : optionColorScheme;
        var smooth = optionSmoothData;
        var snow = optionSnowColors;

        var source = new L.TileLayer(apiData.host + frame.path + '/' + optionTileSize + '/{z}/{x}/{y}/' + colorScheme + '/' + smooth + '_' + snow + '.png', {
            tileSize: 256,
            opacity: 0, // Set initial opacity to 0
            zIndex: frame.time
        });

        source.on('loading', startLoadingTile);
        source.on('load', finishLoadingTile);
        source.on('remove', finishLoadingTile);

        radarLayers[frame.path] = source;
    }
    if (!map.hasLayer(radarLayers[frame.path])) {
        map.addLayer(radarLayers[frame.path]);
    }
}

var loadingScreen = document.getElementById('loading-screen');

apiRequest.onload = function(e) {
    apiData = JSON.parse(apiRequest.response);
    console.log("API Data Loaded:", apiData);
    initialize(apiData, optionKind);
    // Remove the loading screen after initializing
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => loadingScreen.style.display = 'none', 300); // Remove loading screen after fade out
    }, 1000); // Adjust the delay as needed
};



function updateRadarOpacity(value) {
    radarOpacity = parseFloat(value);
    document.getElementById('radar-opacity-value').textContent = value;

    // Update the opacity of the current frame only
    var currentFrame = mapFrames[animationPosition];
    if (currentFrame && radarLayers[currentFrame.path]) {
        radarLayers[currentFrame.path].setOpacity(radarOpacity);
    }

    saveSettings(); // Save settings after changing radar opacity
}


function showFrame(nextPosition, force) {
    var preloadingDirection = nextPosition - animationPosition > 0 ? 1 : -1;

    changeRadarPosition(nextPosition, false, force);

    changeRadarPosition(nextPosition + preloadingDirection, true);

}

function stop() {
    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = false;
        return true;
    }
    return false;
}

function play() {
    showFrame(animationPosition + 1);

    if (animationPosition == 12) {
        animationTimer = setTimeout(play, 1500);
    } else {
        animationTimer = setTimeout(play, 400);
    }
}

function playStop() {
    if (!stop()) {
        document.getElementById("playback-playpause").innerHTML = '<i class="fa-solid fa-pause"></i>';
        play();
    } else {
        document.getElementById("playback-playpause").innerHTML = '<i class="fa-solid fa-play"></i>';
        stop();
    }
};

function stepForward() {
    stop();
    showFrame(animationPosition + 1);
};

function stepBackward() {
    stop();
    showFrame(animationPosition - 1);
};

function setRadarType(kind) {
    if (kind == 'radar' || kind == 'satellite') {
        optionKind = kind;
        initialize(apiData, optionKind);
    } else if (kind == 'future') {
        doFuture = true;
        initialize(apiData, optionKind);
    } else if (kind == 'past') {
        doFuture = false;
        initialize(apiData, optionKind);
    }
    saveSettings(); // Save settings after changing radar type
}

function setColors() {
    var e = document.getElementById('colors');
    optionColorScheme = e.options[e.selectedIndex].value;
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after changing color scheme
}

function toggleHighRes() {
    optionTileSize = optionTileSize == 256 ? 512 : 256;
    document.getElementById('highres-button').innerHTML = optionTileSize == 256 ? '<i class="fa-solid fa-highlighter"></i> Low Res Radar' : '<i class="fa-solid fa-highlighter"></i> High Res Radar';
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after toggling resolution
}

function toggleSmoothing() {
    optionSmoothData = optionSmoothData == 0 ? 1 : 0;
    document.getElementById('smoothing-button').innerHTML = optionSmoothData == 0 ? '<i class="fa-solid fa-wave-square"></i> Smoothing Off' : '<i class="fa-solid fa-wave-square"></i> Smoothing On';
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after toggling smoothing
}

document.onkeydown = function(e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
        case 37: // left
            stop();
            showFrame(animationPosition - 1, true);
            break;

        case 39: // right
            stop();
            showFrame(animationPosition + 1, true);
            break;

        default:
            return; // exit this handler for other keys
    }
    e.preventDefault();
    return false;
};

function loadReports() {
    if (true){
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_torn.csv').then(json => {
            var torreps = JSON.parse(json);
            for (let i = 0; i < torreps.length; i++) {
                try {
                    report = torreps[i];
                    const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon)], {icon: tornadoReport}).addTo(map);
                }
                catch{}
            }
        });;
    }
    if (true) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_hail.csv').then(json => {
            var reps = JSON.parse(json);
            for (let i = 0; i < reps.length; i++) {
                try {
                    report = reps[i];
                    const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon)], {icon: hailReport}).addTo(map);
                }
                catch{}
            }
        });;
    }
    if (true) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_wind.csv').then(json => {
            var reps = JSON.parse(json);
            for (let i = 0; i < reps.length; i++) {
                try {
                    report = reps[i];
                    const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon)], {icon: windReport}).addTo(map);
                }
                catch{}
            }
        });;
    }
    return new Promise((resolve) => setTimeout(resolve, 1000));
};

function refreshRadar() {
    console.log("Refreshing radar in the background");
    var apiRequest = new XMLHttpRequest();
    apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
    apiRequest.onload = function(e) {
        // store the API response for re-use purposes in memory
        apiData = JSON.parse(apiRequest.response);
        initialize(apiData, optionKind);
    };
    apiRequest.send();
    loadReports()
};

// Function to initialize button states
function initializeButtonStates() {
    var alertButton = document.getElementById("refreshalerts");
    var alertsMenuButton = document.getElementById("alerts-menu-button");
    var watchButton = document.getElementById("togglewatches");

    if (alertON) {
        alertButton.InnerHTML = 'Alerts On';
        alertButton.style.backgroundColor = "#ffffff20";
        alertButton.style.borderBottom = "#ffffff 2px solid !important;";
    } else {
        alertButton.InnerHTML = 'Alerts Off';
        alertButton.style.backgroundColor = "#ffffff20";
        alertButton.style.borderBottom = "#636381 2px solid;";
    }

    if (watchesON) {
        watchButton.InnerHTML = 'Watches On';
        watchButton.style.backgroundColor = "#ffffff20";
        watchButton.style.borderBottom = "#ffffff 2px solid !important;";
    } else {
        watchButton.InnerHTML = 'Watches Off';
        watchButton.style.backgroundColor = "#ffffff20";
        watchButton.style.borderBottom = "#636381 2px solid;";
    }
}

// Toggle alerts function
function toggleAlerts() {
    alertON = !alertON;
    var alertButton = document.getElementById("refreshalerts");
    var alertsMenuButton = document.getElementById("alerts-menu-button");

    if (alertON) {
        alertButton.InnerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Alerts On';
        alertButton.style.backgroundColor = "#ffffff20";
        alertButton.style.borderBottom = "#ffffff 2px solid;";
        loadAlerts();
    } else {
        alertButton.InnerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Alerts Off';
        alertButton.style.backgroundColor = "#ffffff20";
        alertButton.style.borderBottom = "#636381 2px solid;";
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polygon && layer.options.color !== "#516BFF" && layer.options.color !== "#FE5859") {
                map.removeLayer(layer);
            }
        });
    }
    saveSettings(); // Save settings after toggling alerts
}

// Toggle watches function
function toggleWatches() {
    watchesON = !watchesON;
    var watchButton = document.getElementById("togglewatches");

    if (watchesON) {
        watchButton.InnerHTML = 'Watches On';
        watchButton.style.backgroundColor = "#ffffff20";
        watchButton.style.borderBottom = "#ffffff 2px solid;";

        // Load watches and then re-add alerts with a delay
        loadWatches();
        setTimeout(() => {
            if (alertON) {
                loadAlerts();
            }
        }, 600); // Adjust the delay as needed
    } else {
        watchButton.InnerHTML = 'Watches Off';
        watchButton.style.backgroundColor = "#ffffff20";
        watchButton.style.borderBottom = "#636381 2px solid;";

        // Remove watches
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polygon && (layer.options.color === "#516BFF" || layer.options.color === "#FE5859")) {
                map.removeLayer(layer);
            }
        });
    }
    saveSettings(); // Save settings after toggling watches
}

// Call the initialize function on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeButtonStates();
});

function toggleSmoothing() {
    optionSmoothData = optionSmoothData == 0 ? 1 : 0;
    var smoothingButton = document.getElementById('smoothing-button');
    smoothingButton.innerHTML = optionSmoothData == 0 ? '<i class="fa-solid fa-wave-square"></i> Smoothing Off' : '<i class="fa-solid fa-wave-square"></i> Smoothing On';
    smoothingButton.classList.toggle('toggle-off', optionSmoothData == 0);
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after toggling smoothing
}

function toggleHighRes() {
    optionTileSize = optionTileSize == 256 ? 512 : 256;
    var highResButton = document.getElementById('highres-button');
    highResButton.innerHTML = optionTileSize == 256 ? '<i class="fa-solid fa-highlighter"></i> Low Res Radar' : '<i class="fa-solid fa-highlighter"></i> High Res Radar';
    highResButton.classList.toggle('toggle-off', optionTileSize == 256);
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after toggling resolution
}

document.onkeydown = function(e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
        case 37: // left
            stop();
            showFrame(animationPosition - 1, true);
            break;

        case 39: // right
            stop();
            showFrame(animationPosition + 1, true);
            break;

        default:
            return; // exit this handler for other keys
    }
    e.preventDefault();
    return false;
};

function refreshRadar() {
    console.log("Refreshing radar in the background");
    var apiRequest = new XMLHttpRequest();
    apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
    apiRequest.onload = function(e) {
        // store the API response for re-use purposes in memory
        apiData = JSON.parse(apiRequest.response);
        initialize(apiData, optionKind);
    };
    apiRequest.send();
}

function toggleLayer(layerType) {
    if (layerType === 'radar') {
        radarON = !radarON;

        var radarButton = document.getElementById("refreshradar");
        var radarMenuButton = document.getElementById("radar-menu-button");

        radarButton.style.backgroundColor = radarON ? "white" : "#636381";
        radarButton.style.color = radarON ? "#5D9AFC" : "white";
        radarButton.style.border = radarON ? "none" : "2px solid white";

        radarMenuButton.style.backgroundColor = radarON ? "white" : "#636381";
        radarMenuButton.style.color = radarON ? "#5D9AFC" : "white";
        radarMenuButton.style.border = radarON ? "none" : "2px solid white";

        document.getElementById('smoothing-button').disabled = !radarON;
        document.getElementById('highres-button').disabled = !radarON;
        document.getElementById('colors').disabled = !radarON;

        document.getElementById('smoothing-button').style.backgroundColor = radarON ? "white" : "#636381";
        document.getElementById('highres-button').style.backgroundColor = radarON ? "white" : "#636381";
        document.getElementById('colors').style.backgroundColor = radarON ? "white" : "#636381";

        document.getElementById('smoothing-button').style.color = radarON ? "#5D9AFC" : "white";
        document.getElementById('highres-button').style.color = radarON ? "#5D9AFC" : "white";
        document.getElementById('colors').style.color = radarON ? "#5D9AFC" : "white";

        optionColorScheme = radarON ? 6 : 0; // Default color scheme for radar when turned on
        optionKind = 'radar';

        if (!radarON && satelliteON) {
            toggleLayer('satellite'); // Ensure satellite is turned on if radar is turned off
        }
    } else if (layerType === 'satellite') {
        satelliteON = !satelliteON;

        var satelliteButton = document.getElementById("refreshsatellite");
        var satelliteMenuButton = document.getElementById("satellite-menu-button");

        satelliteButton.style.backgroundColor = satelliteON ? "white" : "#636381";
        satelliteButton.style.color = satelliteON ? "#5D9AFC" : "white";
        satelliteButton.style.border = satelliteON ? "none" : "2px solid white";

        satelliteMenuButton.style.backgroundColor = satelliteON ? "white" : "#636381";
        satelliteMenuButton.style.color = satelliteON ? "#5D9AFC" : "white";
        satelliteMenuButton.style.border = satelliteON ? "none" : "2px solid white";

        document.getElementById('smoothing-button').disabled = satelliteON;
        document.getElementById('highres-button').disabled = satelliteON;
        document.getElementById('colors').disabled = satelliteON;

        document.getElementById('smoothing-button').style.backgroundColor = satelliteON ? "#636381" : "white";
        document.getElementById('highres-button').style.backgroundColor = satelliteON ? "#636381" : "white";
        document.getElementById('colors').style.backgroundColor = satelliteON ? "#636381" : "white";

        document.getElementById('smoothing-button').style.color = satelliteON ? "white" : "#5D9AFC";
        document.getElementById('highres-button').style.color = satelliteON ? "white" : "#5D9AFC";
        document.getElementById('colors').style.color = satelliteON ? "white" : "#5D9AFC";

        optionKind = satelliteON ? 'satellite' : 'radar';
        optionColorScheme = satelliteON ? 0 : 6; // Default color scheme for satellite when turned on

        if (!satelliteON && radarON) {
            toggleLayer('radar'); // Ensure radar is turned on if satellite is turned off
        }
    }
    initialize(apiData, optionKind);
    saveSettings(); // Save settings after toggling radar or satellite layers
}

function toggleMainMenu(menuId) {
    const menus = ['layers-menu', 'info-menu', 'radar-settings', 'alerts-settings', 'map-settings', 'alert-list-submenu', 'general-info', 'attributions'];
    menus.forEach(id => {
        const menu = document.getElementById(id);
        if (menuId === id) {
            if (menu.style.display === 'block') {
                menu.style.animation = 'fadeOutDown 0.3s forwards';
                setTimeout(() => {
                    menu.style.display = 'none';
                    menu.style.opacity = 0;
                }, 300); // wait for animation to complete
            } else {
                menu.style.display = 'block';
                menu.style.animation = 'fadeInUp 0.3s forwards';
                setTimeout(() => {
                    menu.style.opacity = 1;
                }, 300); // ensure the opacity change matches the duration of fadeInUp
            }
        } else {
            menu.style.animation = 'fadeOutDown 0.3s forwards';
            setTimeout(() => {
                menu.style.display = 'none';
                menu.style.opacity = 0;
            }, 300); // wait for animation to complete
        }
    });
}

function toggleSubMenu(menuId) {
    const subMenus = ['layers-menu', 'info-menu', 'radar-settings', 'alerts-settings', 'map-settings', 'alert-list-submenu', 'general-info', 'attributions'];
    subMenus.forEach(id => {
        const menu = document.getElementById(id);
        if (menuId === id) {
            if (menu.style.display === 'block') {
                menu.style.animation = 'fadeOutDown 0.3s forwards';
                setTimeout(() => {
                    menu.style.display = 'none';
                    menu.style.opacity = 0;
                }, 300); // wait for animation to complete
            } else {
                menu.style.display = 'block';
                menu.style.animation = 'fadeInUp 0.3s forwards';
                setTimeout(() => {
                    menu.style.opacity = 1;
                }, 300); // ensure the opacity change matches the duration of fadeInUp
            }
        } else {
            menu.style.animation = 'fadeOutDown 0.3s forwards';
            setTimeout(() => {
                menu.style.display = 'none';
                menu.style.opacity = 0;
            }, 300); // wait for animation to complete
        }
    });
}

// Event listeners for the menu buttons
document.getElementById('layers-button').addEventListener('click', () => toggleMainMenu('layers-menu'));
document.getElementById('info-button').addEventListener('click', () => toggleMainMenu('info-menu'));

// Ensure map is displayed correctly after the changes
map.invalidateSize();

setInterval(removeExpiredWatches, 60000); // Check for expired watches every 5 minutes

// Radar refresh interval
setInterval(refreshRadar, 60000); // Refresh radar every 1 minute in the background

async function getCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    const lines = data.split('\n');
    const headers = lines[0].split(',');

    jsonData = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
    return JSON.stringify(jsonData, null, 2);
}
