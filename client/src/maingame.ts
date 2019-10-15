import {
    Planet, Cargo, Position,
    Starship, Statistics, Flight, Score
} from './types';

let data;

let scores: Score[];
let nickname: string;

let starships: Starship[] = [];
let planets: Planet[] = [];
let flights: Map<number, Flight> = new Map();

let currentPlanet: number;
let currentStarship: number;
let currentCargo: number;
let currentDestination: number;
let currentLookup: number;

let elapsedTime: number;
let money: number;

let updateGUI = false;

let planetSkins: string[] = ['assets/planets/alderaan.png', 'assets/planets/arrakis.png',
    'assets/planets/correlia.png', 'assets/planets/earth.png',
    'assets/planets/gaia.png', 'assets/planets/nowwhat.png', 'assets/planets/surkesh.png',
    'assets/planets/tairia.png', 'assets/planets/tatooine.png', 'assets/planets/tuchanka.png'];

let shipSkins: string[] = ['assets/starships/hermes.png', 'assets/starships/axiom.png',
    'assets/starships/enterprise.png', 'assets/starships/goliath.png'];

let exampleName: string[] = ['Jenot', 'Kurczak', 'Konura Słoneczna', 'Lew', 'Aksolotl', 'Wydra', 'Humbak'];

getDataFromStorage();

initPlanets();
initStarships();
initVariables();

render();

tickTime();
update();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//*                                                 Logic functions                                                 *//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getDataFromStorage() {
    scores = JSON.parse(localStorage.getItem('scores'));

    if (scores == null) {
        scores = [];
    }

    nickname = localStorage.getItem('nickname');

    if (nickname.length <= 1) {
        nickname = exampleName[random(0, exampleName.length - 1)];
    }

    data = JSON.parse(localStorage.getItem('file'));
}

function updateStorage() {
    let playerScore = new Score(nickname, money);
    scores.push(playerScore);

    scores.sort((a, b) => {
        return b.score - a.score;
    });

    let scoresString = JSON.stringify(scores);
    localStorage.setItem('scores', scoresString);
}

function initPlanets() {
    for (let key in data.planets) {
        let value = data.planets[key];
        let pos: Position = new Position(value.x, value.y);
        let skin = planetSkins[random(0, planetSkins.length - 1)];
        let planet: Planet = new Planet(key, skin, pos, value.type, value.atmo, value.temp, value.smax, value.star);

        for (let cargo in value.available_items) {
            let cargoData = value.available_items[cargo];
            let supply: Cargo = new Cargo(cargo, cargoData.available,
                cargoData.buy_price, cargoData.sell_price, true);
            planet.addSupplies(supply);
        }

        planets.push(planet);
    }
}

function initStarships() {
    for (let key in data.starships) {
        let value = data.starships[key];
        let statistics: Statistics = new Statistics(1000, 1000, 1000, 1000, 1000, value.cargo_hold_size);
        let skin = shipSkins[random(0, shipSkins.length - 1)];
        let starship: Starship = new Starship(key, 'Corvette', statistics, value.position, false, skin);

        starships.push(starship);
    }
}

function getCargoWeight() {
    let mass = 0;
    for (let i = 0; i < starships[currentStarship].cargoBay.length; i++) {
        mass += starships[currentStarship].cargoBay[i].amount;
    }

    console.log(mass);

    return mass;
}

function getPlanetNumber(name: string) {
    for (let i = 0; i < planets.length; i++) {
        if (planets[i].name == name) return i;
    }
    return -1;
}

function getCargoNumber(name: string) {
    for (let i = 0; i < planets.length; i++) {
        if (planets[currentPlanet].goods[i].name == name) return i;
    }
    return -1;
}

function getCargoNumberInBay(name: string) {
    for (let i = 0; i < starships[currentStarship].cargoBay.length; i++) {
        if (starships[currentStarship].cargoBay[i].name == name) return i;
    }
    return -1;
}

function initVariables() {
    currentStarship = 0;
    currentDestination = 0;
    currentPlanet = getPlanetNumber(starships[currentStarship].dockedAt);
    currentCargo = 0;
    currentLookup = 0;
    elapsedTime = 0;
    money = 1000;
}

function sellCargo(name: string) {
    if (getCargoNumberInBay(name) != -1 && getCargoNumber(name) != -1 && !starships[currentStarship].enRoute) {
        let index = getCargoNumber(name);
        starships[currentStarship].unloadCargo(name);
        money += planets[currentPlanet].goods[index].sellValue;
    }
}

function buyCargo(name: string) {
    if (getCargoNumber(name) != -1) {
        let index = getCargoNumber(name);
        if (planets[currentPlanet].goods[index].buyValue <= money &&
            planets[currentPlanet].goods[index].amount > 0 &&
            getCargoWeight() < starships[currentStarship].stats.capacity &&
            !starships[currentStarship].enRoute) {
            planets[currentPlanet].goods[index].amount -= 1;
            money -= planets[currentPlanet].goods[index].buyValue;
            starships[currentStarship].loadCargo(new Cargo(name, 1, 0, 0, true));
        }
    }
}

function selectCargo(cargoNumber: number) {
    currentCargo = cargoNumber;
}

function moveShips() {
    for (let i = 0; i < starships.length; i++) {
        if (starships[i].enRoute) {
            flights.get(i).elapsed -= 1;

            if (flights.get(i).elapsed <= 0) {
                starships[i].enRoute = false;
                flights.delete(i);

                if (i == currentStarship) {
                    updateGUI = true;
                }
            }
        }
    }
}

function tickTime() {
    moveShips();
    elapsedTime++;
    setTimeout(tickTime, 1000);
}

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function selectStarship(shipNumber: number) {
    currentStarship = shipNumber;
    currentPlanet = getPlanetNumber(starships[shipNumber].dockedAt);
    currentCargo = 0;
}

function takeOff() {
    if (!starships[currentStarship].enRoute && currentDestination != currentPlanet) {

        starships[currentStarship].dockedAt = planets[currentDestination].name;
        starships[currentStarship].enRoute = true;

        let xdiff = planets[currentDestination].position.x - planets[currentPlanet].position.x;
        let ydiff = planets[currentDestination].position.y - planets[currentPlanet].position.y;

        let distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);

        let flight = new Flight(currentPlanet, currentDestination, Math.round(distance));

        currentPlanet = currentDestination;

        flights.set(currentStarship, flight);

    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//*                                                 View functions                                                  *//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function resetPlanets() {
    let table = document.getElementById('planets_list');

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    for (let i = 0; i < planets.length; i++) {
        let tableRow = document.createElement('tr');

        table.appendChild(tableRow);

        let nameElement = document.createElement('td');
        let nameText = document.createTextNode(planets[i].name);

        nameElement.addEventListener('click', () => {
            currentDestination = i;
            selectDestination();
        }, false);

        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);

        let posElement = document.createElement('td');
        let posText = document.createTextNode('X: ' + planets[i].position.x.toString() + ' Y: ' + planets[i].position.y.toString());

        tableRow.appendChild(posElement);
        posElement.appendChild(posText);

        let xdiff = planets[i].position.x - planets[currentPlanet].position.x;
        let ydiff = planets[i].position.y - planets[currentPlanet].position.y;

        let distance = 0;

        if (i != currentPlanet) distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);

        let distElement = document.createElement('td');
        distElement.innerHTML = Math.round(distance) + 'pc';

        tableRow.appendChild(distElement);

        let imgElement = document.createElement('td');
        let imgContent = document.createElement('img');
        imgContent.setAttribute('src', planets[i].skin);
        imgContent.setAttribute('class', 'avatar');
        imgContent.setAttribute('style', 'height: 60px');

        tableRow.appendChild(imgElement);
        imgElement.appendChild(imgContent);
    }
}

function setLogOut() {
    let button = document.getElementById('log_out');

    button.addEventListener('click', () => {
        console.log("exiting");
        updateStorage();
        let score = document.getElementById('score');
        score.innerHTML = money.toString();
        location.hash = '#endgame_popup';
    }, false);
}

function resetStarships() {
    console.log(starships.length);

    let table = document.getElementById('starship_list');

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    for (let i = 0; i < starships.length; i++) {
        let tableRow = document.createElement('tr');

        table.appendChild(tableRow);

        let nameElement = document.createElement('td');
        let nameText = document.createTextNode(starships[i].name);

        nameElement.addEventListener('click', () => {
            selectStarship(i);
            initMap();
            resetMap();
            resetStarships();
            resetPlanets();
            resetStarshipInfo();
            resetPlanetInfo();
            resetBuyMenu();
            resetLoadingBay();
            resetCargoButton();
            resetBayCargoAmount();
        }, false);

        let statusElement = document.createElement('td');
        statusElement.setAttribute('id', starships[i].name + 'Status');

        if (starships[i].enRoute) {
            statusElement.innerHTML = flights.get(i).elapsed + 's do ' + starships[i].dockedAt.toString();
        } else {
            statusElement.innerHTML = 'jest na ' + starships[i].dockedAt.toString();
        }

        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);

        tableRow.appendChild(statusElement);

        let imgElement = document.createElement('td');
        let imgContent = document.createElement('img');
        imgContent.setAttribute('src', starships[i].skin);
        imgContent.setAttribute('class', 'avatar');
        imgContent.setAttribute('style', 'height: 60px');

        tableRow.appendChild(imgElement);
        imgElement.appendChild(imgContent);
    }
}

function resetStarshipStatus() {
    for (let i = 0; i < starships.length; i++) {
        let statusElement = document.getElementById(starships[i].name + 'Status');

        if (starships[i].enRoute) {
            statusElement.innerHTML = flights.get(i).elapsed + 's do ' + starships[i].dockedAt.toString();
        } else {
            statusElement.innerHTML = 'na ' + starships[i].dockedAt.toString();
        }
    }
}

function resetPlanetInfo() {
    let box = document.getElementById('current_planet');

    while (box.firstChild) {
        box.removeChild(box.firstChild);
    }

    let imgContent = document.createElement('img');
    imgContent.setAttribute('src', planets[currentPlanet].skin);
    imgContent.setAttribute('style', 'width: 100%');

    box.appendChild(imgContent);

    let nameElement = document.createElement('h2');
    let nameText = document.createTextNode(planets[currentPlanet].name);

    box.appendChild(nameElement);
    nameElement.appendChild(nameText);

    let buttonElement = document.createElement('a');
    buttonElement.innerHTML = 'Informacje dodatkowe';
    buttonElement.setAttribute('class', 'button');
    buttonElement.setAttribute('href', '#planetdetails');
    buttonElement.setAttribute('style', 'width: 70%');

    buttonElement.addEventListener('click', () => {
        currentLookup = currentPlanet;
        resetLookup();
    }, false);

    let info = document.createElement('div');
    info.setAttribute('class', 'info1');

    info.innerHTML = '<b>Typ:</b> ' + planets[currentPlanet].type + ' <br>' +
        '<b>Atmosfera:</b>' + planets[currentPlanet].atmo + ' <br>' +
        '<b>Temperatura:</b> ' + planets[currentPlanet].temp + ' <br>' +
        '<b>Półoś wielka:</b> ' + planets[currentPlanet].smax + ' <br>' +
        '<b>System:</b> ' + planets[currentPlanet].star + ' <br>';

    box.appendChild(info);

    box.appendChild(buttonElement);
}

function resetStarshipInfo() {
    let box = document.getElementById('current_starship');

    while (box.firstChild) {
        box.removeChild(box.firstChild);
    }

    let imgContent = document.createElement('img');
    imgContent.setAttribute('src', starships[currentStarship].skin);
    imgContent.setAttribute('style', 'width: 100%');

    box.appendChild(imgContent);

    let nameElement = document.createElement('h2');
    let nameText = document.createTextNode(starships[currentStarship].name);

    box.appendChild(nameElement);
    nameElement.appendChild(nameText);

    let button1Element = document.createElement('a');
    button1Element.innerHTML = 'Szykuj do startu';
    button1Element.setAttribute('class', 'button');
    button1Element.setAttribute('href', '#takeoff');
    button1Element.setAttribute('style', 'width: 70%');
    button1Element.setAttribute('id', 'takeoff_popup');

    let info = document.createElement('div');
    info.setAttribute('class', 'info1');
    info.setAttribute('id', 'cargo_weight');

    box.appendChild(info);

    resetWeightInfo();

    box.appendChild(button1Element);

    let button2Element = document.createElement('a');
    button2Element.innerHTML = 'Ładownia';
    button2Element.setAttribute('class', 'button');
    button2Element.setAttribute('href', '#cargo_bay');
    button2Element.setAttribute('style', 'width: 70%');

    box.appendChild(button2Element);

    let button3Element = document.createElement('a');
    button3Element.innerHTML = 'Zmień statek';
    button3Element.setAttribute('class', 'button');
    button3Element.setAttribute('href', '#navigation');
    button3Element.setAttribute('style', 'width: 70%');

    box.appendChild(button3Element);
}

function resetWeightInfo() {
    let info = document.getElementById('cargo_weight');

    info.innerHTML = '<b>Ładunek:</b> ' + getCargoWeight() + '/' +
        starships[currentStarship].stats.capacity + 't <br>';
}

function resetBuyMenu() {
    let menu = document.getElementById('buy_menu');

    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }

    if (!starships[currentStarship].enRoute) {
        for (let i = 0; i < planets[currentPlanet].goods.length; i++) {
            let tableRow = document.createElement('tr');

            menu.appendChild(tableRow);

            let nameElement = document.createElement('td');
            let nameText = document.createTextNode(planets[currentPlanet].goods[i].name);

            tableRow.appendChild(nameElement);
            nameElement.appendChild(nameText);

            nameElement.addEventListener('click', () => {
                selectCargo(i);
                resetCargoButton();
                resetBayCargoAmount();
            }, false);

            let amountElement = document.createElement('td');
            let amountText = document.createTextNode(planets[currentPlanet].goods[i].amount.toString());

            tableRow.appendChild(amountElement);
            amountElement.appendChild(amountText);

            let buyElement = document.createElement('td');
            let buyText = document.createTextNode(planets[currentPlanet].goods[i].buyValue.toString());

            tableRow.appendChild(buyElement);
            buyElement.appendChild(buyText);

            let sellElement = document.createElement('td');
            let sellText = document.createTextNode(planets[currentPlanet].goods[i].sellValue.toString());

            buyElement.setAttribute('style', 'color: #77ff79');
            sellElement.setAttribute('style', 'color: #aa4449');

            tableRow.appendChild(sellElement);
            sellElement.appendChild(sellText);

            if (planets[currentPlanet].goods[i].buyValue > money) {
                nameElement.setAttribute('style', 'color: #dd6f6f');
                amountElement.setAttribute('style', 'color: #dd6f6f');
                buyElement.setAttribute('style', 'color: #dd6f6f');
                sellElement.setAttribute('style', 'color: #dd6f6f');
            }

            if (planets[currentPlanet].goods[i].amount == 0) {
                nameElement.setAttribute('style', 'color: #6f6f6f');
                amountElement.setAttribute('style', 'color: #6f6f6f');
                buyElement.setAttribute('style', 'color: #6f6f6f');
                sellElement.setAttribute('style', 'color: #6f6f6f');
            }
        }
    } else {
        let tableRow = document.createElement('tr');

        let timeLeft = document.createElement('td');
        timeLeft.setAttribute('style', 'font-size: 30px; padding-bottom: 100px');
        timeLeft.innerHTML = '<br>Przylot: ' + flights.get(currentStarship).elapsed + 's';

        menu.appendChild(tableRow);
        tableRow.appendChild(timeLeft);
    }

    resetCargoButton();
    resetBayCargoAmount();
}

function resetCargoButton() {
    let currentCargoButton = document.getElementById('current_product');
    currentCargoButton.innerHTML = planets[currentPlanet].goods[currentCargo].name;
}

function resetLoadingBay() {
    let image = document.getElementById('cargo_starship');

    image.setAttribute('src', starships[currentStarship].skin);

    let table = document.getElementById('cargo_list');

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    let bay = starships[currentStarship].cargoBay;

    for (let i = 0; i < bay.length; i++) {
        let tableRow = document.createElement('tr');

        table.appendChild(tableRow);

        let cargoElement = document.createElement('td');
        let cargoText = document.createTextNode(bay[i].name + ': ' + bay[i].amount.toString() + 't');
        cargoElement.setAttribute('style', 'width: 100%; font-size: 20px;');

        tableRow.appendChild(cargoElement);
        cargoElement.appendChild(cargoText);
    }

    resetWeightInfo();
}

function resetBayCargoAmount() {
    let info = document.getElementById('in_bay');
    info.innerHTML = 'W ładowni: ' + starships[currentStarship].getCargoAmount(planets[currentPlanet].goods[currentCargo].name) + 't';
}

function setDestinationListeners() {
    let next = document.getElementById('next_destination');

    next.addEventListener('click', () => {
        currentDestination = (currentDestination + 1) % planets.length;
        selectDestination();
    }, false);

    let prev = document.getElementById('prev_destination');

    prev.addEventListener('click', () => {
        currentDestination = (currentDestination + planets.length - 1) % planets.length;
        selectDestination();
    }, false);

    let takeoffButton = document.getElementById('takeoff_button');
    takeoffButton.addEventListener('click', () => {
        takeOff();
        currentCargo = 0;
        initMap();
        resetStarships();
        resetPlanets();
        resetPlanetInfo();
        resetBuyMenu();
    }, false);
}

function setShopListeners() {
    let next = document.getElementById('buy_product');

    next.addEventListener('click', () => {
        buyCargo(planets[currentPlanet].goods[currentCargo].name);
        resetMoney();
        resetBuyMenu();
        resetBayCargoAmount();
        resetLoadingBay();
    }, false);

    let prev = document.getElementById('sell_product');

    prev.addEventListener('click', () => {
        sellCargo(planets[currentPlanet].goods[currentCargo].name);
        resetMoney();
        resetBuyMenu();
        resetBayCargoAmount();
        resetLoadingBay();
    }, false);
}

function selectDestination() {
    let dest = document.getElementById('destination');
    dest.innerHTML = planets[currentDestination].name;
}

function resetLookup() {
    let menu = document.getElementById('lookup_buymenu');

    let img = document.getElementById('lookup_image');
    let text = document.getElementById('lookup_planetname');

    img.setAttribute('src', planets[currentLookup].skin);
    text.innerHTML = planets[currentLookup].name;

    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }

    for (let i = 0; i < planets[currentLookup].goods.length; i++) {
        let tableRow = document.createElement('tr');

        menu.appendChild(tableRow);

        let nameElement = document.createElement('td');
        let nameText = document.createTextNode(planets[currentLookup].goods[i].name);

        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);

        let amountElement = document.createElement('td');
        let amountText = document.createTextNode(planets[currentLookup].goods[i].amount.toString());

        tableRow.appendChild(amountElement);
        amountElement.appendChild(amountText);

        let buyElement = document.createElement('td');
        let buyText = document.createTextNode(planets[currentLookup].goods[i].buyValue.toString());

        tableRow.appendChild(buyElement);
        buyElement.appendChild(buyText);

        let sellElement = document.createElement('td');
        let sellText = document.createTextNode(planets[currentLookup].goods[i].sellValue.toString());

        buyElement.setAttribute('style', 'color: #77ff79');
        sellElement.setAttribute('style', 'color: #aa4449');

        tableRow.appendChild(sellElement);
        sellElement.appendChild(sellText);
    }
}

function resetTimer() {
    let timer = document.getElementById('time');
    timer.innerHTML = 'Time: ' + elapsedTime;
}

function initMap() {
    let map = document.getElementById('background');

    while (map.firstChild) {
        map.removeChild(map.firstChild);
    }

    let self = this;

    const svg_map = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const svg_flights = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg_map.setAttribute('width', '100%');
    svg_map.setAttribute('height', '100%');
    svg_map.setAttribute('id', 'svg_map');
    svg_map.setAttribute('style', 'position: absolute; top: 0; left: 0;');


    svg_flights.setAttribute('width', '100%');
    svg_flights.setAttribute('height', '100%');
    svg_flights.setAttribute('id', 'svg_flights');
    svg_flights.setAttribute('style', 'position: absolute; top: 0; left: 0;');
    svg_flights.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');


    planets.forEach((self, index) => {


        const cir1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        cir1.setAttribute('cx', (self.position.x).toString() + '%');
        cir1.setAttribute('cy', (self.position.y).toString() + '%');
        cir1.setAttribute('r', '6');
        cir1.setAttribute('fill', 'none');
        cir1.setAttribute('stroke-width', '2');
        cir1.setAttribute('stroke', '#aaaaaa');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (self.position.x).toString() + '%');
        text.setAttribute('y', (self.position.y + 4).toString() + '%');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#aaaaaa');
        text.setAttribute('style', 'font-size: 10px');
        text.innerHTML = '< ' + self.name + ' >';

        if(self.name == planets[currentPlanet].name) {
            text.setAttribute('fill', '#77ff79');
            cir1.setAttribute('stroke', '#77ff79');
        }

        svg_map.appendChild(cir1);
        svg_map.appendChild(text);

        map.appendChild(svg_map);
        map.appendChild(svg_flights);
    });
}

function resetMap() {
    let svg_flights = document.getElementById('svg_flights');

    while (svg_flights.firstChild) {
        svg_flights.removeChild(svg_flights.firstChild);
    }

    let self = this;

    flights.forEach( (self, index) => {

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', (planets[self.from].position.x).toString() + '%');
        line.setAttribute('y1', (planets[self.from].position.y).toString() + '%');
        line.setAttribute('x2', (planets[self.to].position.x).toString() + '%');
        line.setAttribute('y2', (planets[self.to].position.y).toString() + '%');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '2');
        line.setAttribute('stroke', '#aaaaaa');

        svg_flights.appendChild(line);

        let dx = planets[self.to].position.x - planets[self.from].position.x;
        let dy = planets[self.to].position.y - planets[self.from].position.y;

        let distance = Math.round(Math.sqrt(dx*dx + dy*dy));

        let ratio = self.elapsed / distance;

        const cir1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        cir1.setAttribute('cx', ((planets[self.from].position.x + (1-ratio)*dx)).toString() + '%');
        cir1.setAttribute('cy', ((planets[self.from].position.y + (1-ratio)*dy)).toString() + '%');
        cir1.setAttribute('r', '5');
        cir1.setAttribute('fill', '#dddddd');

        cir1.addEventListener('click', () => {
            selectStarship(index);
            initMap();
            resetMap();
            resetStarships();
            resetPlanets();
            resetStarshipInfo();
            resetPlanetInfo();
            resetBuyMenu();
            resetLoadingBay();
            resetCargoButton();
            resetBayCargoAmount();
        }, false);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', ((planets[self.from].position.x + (1-ratio)*dx)).toString() + '%');
        text.setAttribute('y', ((planets[self.from].position.y + (1-ratio)*dy) + 4).toString() + '%');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#dddddd');
        text.setAttribute('style', 'font-size: 8px');
        text.innerHTML = '< ' + starships[index].name + ' >';

        if(index == currentStarship) {
            text.setAttribute('fill', '#77ff79');
            cir1.setAttribute('fill', '#77ff79');
        }

        svg_flights.appendChild(cir1);
        svg_flights.appendChild(text);
    });

    planets.forEach((self, index) => {
        const cir1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        cir1.setAttribute('cx', (self.position.x).toString() + '%');
        cir1.setAttribute('cy', (self.position.y).toString() + '%');
        cir1.setAttribute('r', '9');
        cir1.setAttribute('fill', '#333333');
        cir1.setAttribute('opacity', '0');

        cir1.addEventListener('click', () => {
            currentLookup = index;
            location.hash = '#planetdetails';
            resetLookup();
        }, false);

        svg_flights.appendChild(cir1);
    });
}

function resetMoney() {
    let moneyCounter = document.getElementById('money');
    moneyCounter.innerHTML = money.toString() + '$';
}

function update() {
    if (updateGUI || starships[currentStarship].enRoute) {
        if (updateGUI) updateGUI = false;
        resetBuyMenu();
    }
    resetTimer();
    resetStarshipStatus();
    resetMap();
    setTimeout(update, 1000);
}

function render() {
    resetPlanets();
    resetStarships();
    resetBuyMenu();
    resetPlanetInfo();
    resetStarshipInfo();
    resetLoadingBay();
    resetBayCargoAmount();
    selectDestination();
    setDestinationListeners();
    setShopListeners();
    resetMoney();
    initMap();
    setLogOut();
}