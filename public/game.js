let panorama
let map
let currentGuess = null
let guessMarker = null

function initMaps() {

    window.addEventListener(
        'keydown',
        (event) => {
            const key = event.key.toLowerCase();
            if (
            (
                key === 'arrowup' || // Move forward
                key === 'arrowdown' || // Move backward
                key === 'w' || // Move forward
                key === 's' // Move backward
            ) &&
            !event.metaKey &&
            !event.altKey &&
            !event.ctrlKey
            ) {
            event.stopPropagation();
            }
        },
        { capture: true },
        )

    const startButton = document.getElementById("startButton")
    startButton.addEventListener("click", () => {
        document.getElementById("startScreen").style.display = "none"
        document.getElementById("fullMapScreen").style.display = "block"
        loadMaps()
    })
}

function loadMaps(){

    const screenDiv = document.getElementById("screen")
    const panOptions = {
    position: { lat: 32.231868, lng: -110.954454 },
    clickToGo: false,
    disableDefaultUI: true
    }

    const mapDiv = document.getElementById("map")
    const mapOptions = {
        center: {lat: 32.231859, lng: -110.951440},
        mapTypeId: "roadmap",
        zoom: 14,
        minZoom: 12,
        mapId: "7e3ea53fed9dd6313e302224",
        disableDefaultUI: true,
        clickableIcons: false
    }

    panorama = new google.maps.StreetViewPanorama(screenDiv, panOptions)
    map = new google.maps.Map(mapDiv, mapOptions)

    mapDiv.addEventListener("transitionend", (event) => {
        if (event.propertyName === "width" || event.propertyName === "height") {
            const center = map.getCenter()
            google.maps.event.trigger(map, "resize")
            map.setCenter(center)
        }
    })

    map.addListener("click", (mapsMouseEvent) => {
        const clickedLocation = mapsMouseEvent.latLng
        currentGuess = { lat: clickedLocation.lat(), lng: clickedLocation.lng() }
        console.log("clicked at: " + clickedLocation.toString())
        handleMapClicks(currentGuess)
    })

}

function handleMapClicks(pos){
    if (guessMarker == null) {
        const pinImage = document.createElement("img")
        pinImage.src = "Arizona-Wildcats-logo.png"
        pinImage.style.width = "32px"
        pinImage.style.height = "auto"

        guessMarker = new google.maps.marker.AdvancedMarkerElement({
        map: map,
        position: pos,
        content: pinImage,
    })}
    else {
        guessMarker.position = pos
    }
}
