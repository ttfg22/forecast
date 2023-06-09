/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 5);

// thematische Layer
let themaLayer = {
    forecast: L.featureGroup()
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery").addTo(map)
}, {
    "Wettervorhersage MET Norway": themaLayer.forecast.addTo(map)
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Wettervorhersage MET Norway
async function showForecast(url, latlng) {
    let response = await fetch(url);
    let jsondata = await response.json();
    //console.log(jsondata, latlng);

    let current = jsondata.properties.timeseries[0].data.instant.details;
    //console.log(current)
    let timestamp = new Date(jsondata.properties.meta.updated_at).toLocaleString()
    let timeseries = jsondata.properties.timeseries
    let markup = `
    <h4> Wetter für ${latlng.lat.toFixed(4)},${latlng.lng.toFixed(4)} (${timestamp})</h4>
    <table>
    <tr><td>Luftdruck auf Meeresniveau (hPa)<td/><td>${current.air_pressure_at_sea_level}<td/></tr>
    <tr><td>Lufttemperatur (°Celsius)<td/><td>${current.air_temperature}<td/></tr>
    <tr><td>Wolkenbedeckung (%)<td/><td>${current.cloud_area_fraction}<td/></tr>
    <tr><td>relative Luftfeuchtigkeit (%)<td/><td>${current.relative_humidity}<td/></tr>
    <tr><td>Windrichtung (°)<td/><td>${current.wind_from_direction}<td/></tr>
    <tr><td>Windgeschwindigkeit (m/s)<td/><td>${current.wind_speed}<td/></tr>
    <table/>`
    // auf Kartenklick reagieren
    for (let i = 0; i < 24; i += 3) {
        //console.log(timeseries[i])
        let icon = timeseries[i].data.next_1_hours.summary.symbol_code
        let image = `icons/${icon}.svg`;
        markup += `<img src="${image}" style="width:32px;" title="${timeseries[i].time.toLocaleString()}">`
        //console.log(icon)
    }
    L.popup().setLatLng(latlng).setContent(markup).openOn(map)


}



// auf Kartenklick reagieren 
map.on("click", function (evt) {
    //console.log(evt);
    let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${evt.latlng.lat}&lon=${evt.latlng.lng}`
    showForecast(url, evt.latlng)
});

// 'klick' auf IBK simulieren 
map.fireEvent("click",{
    latlng: L.latLng(ibk.lat,ibk.lng)
})