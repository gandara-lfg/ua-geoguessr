let panorama
let map
let currentGuess = null
let guessMarker = null
let answerMarker = null
let answerPos = null
let answerLine = null
let pickedIndexes = []
let totalScore = []

const locations = { 
    "OldMain": { lat: 32.231879, lng: -110.954462},
    "FoodCourt": {lat: 32.232684, lng: -110.951267 },
    "SoftballStadium": {lat: 32.233179, lng: -110.946730 },
    "BearDownField": {lat: 32.230442, lng: -110.948311},
    "CochiseHall": {lat: 32.230684, lng: -110.955756 }
}

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

    const confirmButton = document.getElementById("confirmButton")
    confirmButton.addEventListener("click", () => {
        handleConfirmClick()
    })

    const recenterButton = document.getElementById("recenterButton")
    recenterButton.addEventListener("click", () => {
        map.setCenter({lat: 32.231859, lng: -110.951440})
    })

    const continueButton = document.getElementById("continueButton")
    continueButton.addEventListener("click", () => {
        if (pickedIndexes.length === 5) {
            endGame()
        } else {
            startRound()
        }
    })
}


function loadMaps(){

    const screenDiv = document.getElementById("screen")
    const panOptions = {
        position: answerPos,
        clickToGo: false,
        disableDefaultUI: true
    }

    const mapDiv = document.getElementById("map")
    const mapOptions = {
        center: {lat: 32.231859, lng: -110.951440},
        mapTypeId: "hybrid",
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

    startRound()
}

function startRound() {
    shrinkMapFullScreen()
    map.setCenter({lat: 32.231859, lng: -110.951440})
    map.setZoom(14)
    currentGuess = null

    if (guessMarker != null) {
        guessMarker.map = null
        guessMarker = null
    }

    if (answerMarker != null) {
        answerMarker.map = null
        answerMarker = null
    }

    if (answerLine != null) {
        answerLine.setMap(null)
        answerLine = null
    }

    document.getElementById("confirmButton").style.display = "none"
    document.getElementById("continueButton").style.display = "none"
    document.getElementById("scoreDisplay").style.display = "none"

    const locationNames = Object.keys(locations)
    let randomNum = Math.floor(Math.random() * locationNames.length)
    while (pickedIndexes.includes(randomNum)) {
        randomNum = Math.floor(Math.random() * locationNames.length)
    }
    pickedIndexes.push(randomNum)
    const pickedLoc = locationNames[randomNum]
    answerPos = locations[pickedLoc]
    panorama.setPosition(answerPos)

    updateFullScoreDisplay()
}

function updateFullScoreDisplay(){
    const fullScoreDisplay = document.getElementById("fullScoreDisplay")
    const roundNumber = pickedIndexes.length
    let totalPoints = 0
    for (const score of totalScore) {
        totalPoints += score
    }
    totalPoints = Math.round(totalPoints)
    fullScoreDisplay.innerHTML = `<span class="fullScoreValue">${totalPoints} pts</span><span class="fullScoreRound">Round ${roundNumber} / 5</span>`
    fullScoreDisplay.style.display = "flex"
}

function handleMapClicks(pos){
    if (guessMarker == null) {

        const pinImage = document.createElement("img")
        pinImage.src = "Arizona-Wildcats-logo.png"
        pinImage.style.width = "32px"
        pinImage.style.height = "auto"
        document.getElementById("confirmButton").style.display = "block"

        guessMarker = new google.maps.marker.AdvancedMarkerElement({
        map: map,
        position: pos,
        content: pinImage,
    })}
    else {
        guessMarker.position = pos
    }
}

function expandMapFullScreen(){
    document.getElementById("map").classList.add("map-fullscreen")
}

function shrinkMapFullScreen(){
    document.getElementById("map").classList.remove("map-fullscreen")
}

function showScore(score){
    const scoreDisplay = document.getElementById("scoreDisplay")
    scoreDisplay.innerHTML = `<span class="scoreValue">${score}</span><span class="scoreLabel">points</span>`
    scoreDisplay.style.display = "block"
}

function calculatePoints(){
    const maxScore = 1000
    const scale = 500
    const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
        currentGuess,
        answerPos
    )
    let score = maxScore * Math.exp(-distanceInMeters / scale)
    if (score >= 990) {score = 1000}

    totalScore.push(score)
    return Math.round(score)
}

function handleConfirmClick(){

    expandMapFullScreen()
    document.getElementById("fullScoreDisplay").style.display = "none"
    const score = calculatePoints()
    showScore(score)

    const ansImage = document.createElement("img")
        ansImage.src = "blacklogo.png"
        ansImage.style.width = "32px"
        ansImage.style.height = "auto"

    answerMarker = new google.maps.marker.AdvancedMarkerElement({
        map: map,
        position: answerPos,
        content: ansImage
    })

    const bounds = new google.maps.LatLngBounds()
    bounds.extend(currentGuess)
    bounds.extend(answerPos)
    map.fitBounds(bounds)

    answerLine = new google.maps.Polyline({
        path: [currentGuess, answerPos],
        geodesic: true,
        strokeColor: '#b40000',
        strokeWeight: 4,
        map: map,
    })

    document.getElementById("confirmButton").style.display = "none"
    document.getElementById("continueButton").style.display = "block"
}

function endGame(){
    document.getElementById("fullMapScreen").style.display = "none"

    let totalPoints = 0
    for (const score of totalScore) {
        totalPoints += score
    }
    totalPoints = Math.round(totalPoints)

    const endTotalScore = document.getElementById("endTotalScore")
    endTotalScore.innerHTML = `<span class="endTotalValue">${totalPoints}</span><span class="endTotalLabel">out of 5000</span>`

    const endRoundList = document.getElementById("endRoundList")
    endRoundList.innerHTML = ""
    totalScore.forEach((score, index) => {
        const roundRow = document.createElement("div")
        roundRow.className = "endRoundRow"
        roundRow.innerHTML = `<span class="endRoundLabel">Round ${index + 1}</span><span class="endRoundScore">${Math.round(score)} pts</span>`
        endRoundList.appendChild(roundRow)
    })

    document.getElementById("endScreen").style.display = "flex"
}
