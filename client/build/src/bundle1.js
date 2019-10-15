(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var data;
var scores;
var nickname;
var starships = [];
var planets = [];
var flights = new Map();
var currentPlanet;
var currentStarship;
var currentCargo;
var currentDestination;
var currentLookup;
var elapsedTime;
var money;
var updateGUI = false;
var planetSkins = ['assets/planets/alderaan.png', 'assets/planets/arrakis.png',
    'assets/planets/correlia.png', 'assets/planets/earth.png',
    'assets/planets/gaia.png', 'assets/planets/nowwhat.png', 'assets/planets/surkesh.png',
    'assets/planets/tairia.png', 'assets/planets/tatooine.png', 'assets/planets/tuchanka.png'];
var shipSkins = ['assets/starships/hermes.png', 'assets/starships/axiom.png',
    'assets/starships/enterprise.png', 'assets/starships/goliath.png'];
var exampleName = ['Jenot', 'Kurczak', 'Konura Słoneczna', 'Lew', 'Aksolotl', 'Wydra', 'Humbak'];
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
    var playerScore = new types_1.Score(nickname, money);
    scores.push(playerScore);
    scores.sort(function (a, b) {
        return b.score - a.score;
    });
    var scoresString = JSON.stringify(scores);
    localStorage.setItem('scores', scoresString);
}
function initPlanets() {
    for (var key in data.planets) {
        var value = data.planets[key];
        var pos = new types_1.Position(value.x, value.y);
        var skin = planetSkins[random(0, planetSkins.length - 1)];
        var planet = new types_1.Planet(key, skin, pos, value.type, value.atmo, value.temp, value.smax, value.star);
        for (var cargo in value.available_items) {
            var cargoData = value.available_items[cargo];
            var supply = new types_1.Cargo(cargo, cargoData.available, cargoData.buy_price, cargoData.sell_price, true);
            planet.addSupplies(supply);
        }
        planets.push(planet);
    }
}
function initStarships() {
    for (var key in data.starships) {
        var value = data.starships[key];
        var statistics = new types_1.Statistics(1000, 1000, 1000, 1000, 1000, value.cargo_hold_size);
        var skin = shipSkins[random(0, shipSkins.length - 1)];
        var starship = new types_1.Starship(key, 'Corvette', statistics, value.position, false, skin);
        starships.push(starship);
    }
}
function getCargoWeight() {
    var mass = 0;
    for (var i = 0; i < starships[currentStarship].cargoBay.length; i++) {
        mass += starships[currentStarship].cargoBay[i].amount;
    }
    console.log(mass);
    return mass;
}
function getPlanetNumber(name) {
    for (var i = 0; i < planets.length; i++) {
        if (planets[i].name == name)
            return i;
    }
    return -1;
}
function getCargoNumber(name) {
    for (var i = 0; i < planets.length; i++) {
        if (planets[currentPlanet].goods[i].name == name)
            return i;
    }
    return -1;
}
function getCargoNumberInBay(name) {
    for (var i = 0; i < starships[currentStarship].cargoBay.length; i++) {
        if (starships[currentStarship].cargoBay[i].name == name)
            return i;
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
function sellCargo(name) {
    if (getCargoNumberInBay(name) != -1 && getCargoNumber(name) != -1 && !starships[currentStarship].enRoute) {
        var index = getCargoNumber(name);
        starships[currentStarship].unloadCargo(name);
        money += planets[currentPlanet].goods[index].sellValue;
    }
}
function buyCargo(name) {
    if (getCargoNumber(name) != -1) {
        var index = getCargoNumber(name);
        if (planets[currentPlanet].goods[index].buyValue <= money &&
            planets[currentPlanet].goods[index].amount > 0 &&
            getCargoWeight() < starships[currentStarship].stats.capacity &&
            !starships[currentStarship].enRoute) {
            planets[currentPlanet].goods[index].amount -= 1;
            money -= planets[currentPlanet].goods[index].buyValue;
            starships[currentStarship].loadCargo(new types_1.Cargo(name, 1, 0, 0, true));
        }
    }
}
function selectCargo(cargoNumber) {
    currentCargo = cargoNumber;
}
function moveShips() {
    for (var i = 0; i < starships.length; i++) {
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
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function selectStarship(shipNumber) {
    currentStarship = shipNumber;
    currentPlanet = getPlanetNumber(starships[shipNumber].dockedAt);
    currentCargo = 0;
}
function takeOff() {
    if (!starships[currentStarship].enRoute && currentDestination != currentPlanet) {
        starships[currentStarship].dockedAt = planets[currentDestination].name;
        starships[currentStarship].enRoute = true;
        var xdiff = planets[currentDestination].position.x - planets[currentPlanet].position.x;
        var ydiff = planets[currentDestination].position.y - planets[currentPlanet].position.y;
        var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
        var flight = new types_1.Flight(currentPlanet, currentDestination, Math.round(distance));
        currentPlanet = currentDestination;
        flights.set(currentStarship, flight);
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//*                                                 View functions                                                  *//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function resetPlanets() {
    var table = document.getElementById('planets_list');
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    var _loop_1 = function (i) {
        var tableRow = document.createElement('tr');
        table.appendChild(tableRow);
        var nameElement = document.createElement('td');
        var nameText = document.createTextNode(planets[i].name);
        nameElement.addEventListener('click', function () {
            currentDestination = i;
            selectDestination();
        }, false);
        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);
        var posElement = document.createElement('td');
        var posText = document.createTextNode('X: ' + planets[i].position.x.toString() + ' Y: ' + planets[i].position.y.toString());
        tableRow.appendChild(posElement);
        posElement.appendChild(posText);
        var xdiff = planets[i].position.x - planets[currentPlanet].position.x;
        var ydiff = planets[i].position.y - planets[currentPlanet].position.y;
        var distance = 0;
        if (i != currentPlanet)
            distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
        var distElement = document.createElement('td');
        distElement.innerHTML = Math.round(distance) + 'pc';
        tableRow.appendChild(distElement);
        var imgElement = document.createElement('td');
        var imgContent = document.createElement('img');
        imgContent.setAttribute('src', planets[i].skin);
        imgContent.setAttribute('class', 'avatar');
        imgContent.setAttribute('style', 'height: 60px');
        tableRow.appendChild(imgElement);
        imgElement.appendChild(imgContent);
    };
    for (var i = 0; i < planets.length; i++) {
        _loop_1(i);
    }
}
function setLogOut() {
    var button = document.getElementById('log_out');
    button.addEventListener('click', function () {
        console.log("exiting");
        updateStorage();
        var score = document.getElementById('score');
        score.innerHTML = money.toString();
        location.hash = '#endgame_popup';
    }, false);
}
function resetStarships() {
    console.log(starships.length);
    var table = document.getElementById('starship_list');
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    var _loop_2 = function (i) {
        var tableRow = document.createElement('tr');
        table.appendChild(tableRow);
        var nameElement = document.createElement('td');
        var nameText = document.createTextNode(starships[i].name);
        nameElement.addEventListener('click', function () {
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
        var statusElement = document.createElement('td');
        statusElement.setAttribute('id', starships[i].name + 'Status');
        if (starships[i].enRoute) {
            statusElement.innerHTML = flights.get(i).elapsed + 's do ' + starships[i].dockedAt.toString();
        }
        else {
            statusElement.innerHTML = 'jest na ' + starships[i].dockedAt.toString();
        }
        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);
        tableRow.appendChild(statusElement);
        var imgElement = document.createElement('td');
        var imgContent = document.createElement('img');
        imgContent.setAttribute('src', starships[i].skin);
        imgContent.setAttribute('class', 'avatar');
        imgContent.setAttribute('style', 'height: 60px');
        tableRow.appendChild(imgElement);
        imgElement.appendChild(imgContent);
    };
    for (var i = 0; i < starships.length; i++) {
        _loop_2(i);
    }
}
function resetStarshipStatus() {
    for (var i = 0; i < starships.length; i++) {
        var statusElement = document.getElementById(starships[i].name + 'Status');
        if (starships[i].enRoute) {
            statusElement.innerHTML = flights.get(i).elapsed + 's do ' + starships[i].dockedAt.toString();
        }
        else {
            statusElement.innerHTML = 'na ' + starships[i].dockedAt.toString();
        }
    }
}
function resetPlanetInfo() {
    var box = document.getElementById('current_planet');
    while (box.firstChild) {
        box.removeChild(box.firstChild);
    }
    var imgContent = document.createElement('img');
    imgContent.setAttribute('src', planets[currentPlanet].skin);
    imgContent.setAttribute('style', 'width: 100%');
    box.appendChild(imgContent);
    var nameElement = document.createElement('h2');
    var nameText = document.createTextNode(planets[currentPlanet].name);
    box.appendChild(nameElement);
    nameElement.appendChild(nameText);
    var buttonElement = document.createElement('a');
    buttonElement.innerHTML = 'Informacje dodatkowe';
    buttonElement.setAttribute('class', 'button');
    buttonElement.setAttribute('href', '#planetdetails');
    buttonElement.setAttribute('style', 'width: 70%');
    buttonElement.addEventListener('click', function () {
        currentLookup = currentPlanet;
        resetLookup();
    }, false);
    var info = document.createElement('div');
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
    var box = document.getElementById('current_starship');
    while (box.firstChild) {
        box.removeChild(box.firstChild);
    }
    var imgContent = document.createElement('img');
    imgContent.setAttribute('src', starships[currentStarship].skin);
    imgContent.setAttribute('style', 'width: 100%');
    box.appendChild(imgContent);
    var nameElement = document.createElement('h2');
    var nameText = document.createTextNode(starships[currentStarship].name);
    box.appendChild(nameElement);
    nameElement.appendChild(nameText);
    var button1Element = document.createElement('a');
    button1Element.innerHTML = 'Szykuj do startu';
    button1Element.setAttribute('class', 'button');
    button1Element.setAttribute('href', '#takeoff');
    button1Element.setAttribute('style', 'width: 70%');
    button1Element.setAttribute('id', 'takeoff_popup');
    var info = document.createElement('div');
    info.setAttribute('class', 'info1');
    info.setAttribute('id', 'cargo_weight');
    box.appendChild(info);
    resetWeightInfo();
    box.appendChild(button1Element);
    var button2Element = document.createElement('a');
    button2Element.innerHTML = 'Ładownia';
    button2Element.setAttribute('class', 'button');
    button2Element.setAttribute('href', '#cargo_bay');
    button2Element.setAttribute('style', 'width: 70%');
    box.appendChild(button2Element);
    var button3Element = document.createElement('a');
    button3Element.innerHTML = 'Zmień statek';
    button3Element.setAttribute('class', 'button');
    button3Element.setAttribute('href', '#navigation');
    button3Element.setAttribute('style', 'width: 70%');
    box.appendChild(button3Element);
}
function resetWeightInfo() {
    var info = document.getElementById('cargo_weight');
    info.innerHTML = '<b>Ładunek:</b> ' + getCargoWeight() + '/' +
        starships[currentStarship].stats.capacity + 't <br>';
}
function resetBuyMenu() {
    var menu = document.getElementById('buy_menu');
    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }
    if (!starships[currentStarship].enRoute) {
        var _loop_3 = function (i) {
            var tableRow = document.createElement('tr');
            menu.appendChild(tableRow);
            var nameElement = document.createElement('td');
            var nameText = document.createTextNode(planets[currentPlanet].goods[i].name);
            tableRow.appendChild(nameElement);
            nameElement.appendChild(nameText);
            nameElement.addEventListener('click', function () {
                selectCargo(i);
                resetCargoButton();
                resetBayCargoAmount();
            }, false);
            var amountElement = document.createElement('td');
            var amountText = document.createTextNode(planets[currentPlanet].goods[i].amount.toString());
            tableRow.appendChild(amountElement);
            amountElement.appendChild(amountText);
            var buyElement = document.createElement('td');
            var buyText = document.createTextNode(planets[currentPlanet].goods[i].buyValue.toString());
            tableRow.appendChild(buyElement);
            buyElement.appendChild(buyText);
            var sellElement = document.createElement('td');
            var sellText = document.createTextNode(planets[currentPlanet].goods[i].sellValue.toString());
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
        };
        for (var i = 0; i < planets[currentPlanet].goods.length; i++) {
            _loop_3(i);
        }
    }
    else {
        var tableRow = document.createElement('tr');
        var timeLeft = document.createElement('td');
        timeLeft.setAttribute('style', 'font-size: 30px; padding-bottom: 100px');
        timeLeft.innerHTML = '<br>Przylot: ' + flights.get(currentStarship).elapsed + 's';
        menu.appendChild(tableRow);
        tableRow.appendChild(timeLeft);
    }
    resetCargoButton();
    resetBayCargoAmount();
}
function resetCargoButton() {
    var currentCargoButton = document.getElementById('current_product');
    currentCargoButton.innerHTML = planets[currentPlanet].goods[currentCargo].name;
}
function resetLoadingBay() {
    var image = document.getElementById('cargo_starship');
    image.setAttribute('src', starships[currentStarship].skin);
    var table = document.getElementById('cargo_list');
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    var bay = starships[currentStarship].cargoBay;
    for (var i = 0; i < bay.length; i++) {
        var tableRow = document.createElement('tr');
        table.appendChild(tableRow);
        var cargoElement = document.createElement('td');
        var cargoText = document.createTextNode(bay[i].name + ': ' + bay[i].amount.toString() + 't');
        cargoElement.setAttribute('style', 'width: 100%; font-size: 20px;');
        tableRow.appendChild(cargoElement);
        cargoElement.appendChild(cargoText);
    }
    resetWeightInfo();
}
function resetBayCargoAmount() {
    var info = document.getElementById('in_bay');
    info.innerHTML = 'W ładowni: ' + starships[currentStarship].getCargoAmount(planets[currentPlanet].goods[currentCargo].name) + 't';
}
function setDestinationListeners() {
    var next = document.getElementById('next_destination');
    next.addEventListener('click', function () {
        currentDestination = (currentDestination + 1) % planets.length;
        selectDestination();
    }, false);
    var prev = document.getElementById('prev_destination');
    prev.addEventListener('click', function () {
        currentDestination = (currentDestination + planets.length - 1) % planets.length;
        selectDestination();
    }, false);
    var takeoffButton = document.getElementById('takeoff_button');
    takeoffButton.addEventListener('click', function () {
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
    var next = document.getElementById('buy_product');
    next.addEventListener('click', function () {
        buyCargo(planets[currentPlanet].goods[currentCargo].name);
        resetMoney();
        resetBuyMenu();
        resetBayCargoAmount();
        resetLoadingBay();
    }, false);
    var prev = document.getElementById('sell_product');
    prev.addEventListener('click', function () {
        sellCargo(planets[currentPlanet].goods[currentCargo].name);
        resetMoney();
        resetBuyMenu();
        resetBayCargoAmount();
        resetLoadingBay();
    }, false);
}
function selectDestination() {
    var dest = document.getElementById('destination');
    dest.innerHTML = planets[currentDestination].name;
}
function resetLookup() {
    var menu = document.getElementById('lookup_buymenu');
    var img = document.getElementById('lookup_image');
    var text = document.getElementById('lookup_planetname');
    img.setAttribute('src', planets[currentLookup].skin);
    text.innerHTML = planets[currentLookup].name;
    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }
    for (var i = 0; i < planets[currentLookup].goods.length; i++) {
        var tableRow = document.createElement('tr');
        menu.appendChild(tableRow);
        var nameElement = document.createElement('td');
        var nameText = document.createTextNode(planets[currentLookup].goods[i].name);
        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);
        var amountElement = document.createElement('td');
        var amountText = document.createTextNode(planets[currentLookup].goods[i].amount.toString());
        tableRow.appendChild(amountElement);
        amountElement.appendChild(amountText);
        var buyElement = document.createElement('td');
        var buyText = document.createTextNode(planets[currentLookup].goods[i].buyValue.toString());
        tableRow.appendChild(buyElement);
        buyElement.appendChild(buyText);
        var sellElement = document.createElement('td');
        var sellText = document.createTextNode(planets[currentLookup].goods[i].sellValue.toString());
        buyElement.setAttribute('style', 'color: #77ff79');
        sellElement.setAttribute('style', 'color: #aa4449');
        tableRow.appendChild(sellElement);
        sellElement.appendChild(sellText);
    }
}
function resetTimer() {
    var timer = document.getElementById('time');
    timer.innerHTML = 'Time: ' + elapsedTime;
}
function initMap() {
    var map = document.getElementById('background');
    while (map.firstChild) {
        map.removeChild(map.firstChild);
    }
    var self = this;
    var svg_map = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var svg_flights = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg_map.setAttribute('width', '100%');
    svg_map.setAttribute('height', '100%');
    svg_map.setAttribute('id', 'svg_map');
    svg_map.setAttribute('style', 'position: absolute; top: 0; left: 0;');
    svg_flights.setAttribute('width', '100%');
    svg_flights.setAttribute('height', '100%');
    svg_flights.setAttribute('id', 'svg_flights');
    svg_flights.setAttribute('style', 'position: absolute; top: 0; left: 0;');
    svg_flights.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    planets.forEach(function (self, index) {
        var cir1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        cir1.setAttribute('cx', (self.position.x).toString() + '%');
        cir1.setAttribute('cy', (self.position.y).toString() + '%');
        cir1.setAttribute('r', '6');
        cir1.setAttribute('fill', 'none');
        cir1.setAttribute('stroke-width', '2');
        cir1.setAttribute('stroke', '#aaaaaa');
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (self.position.x).toString() + '%');
        text.setAttribute('y', (self.position.y + 4).toString() + '%');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#aaaaaa');
        text.setAttribute('style', 'font-size: 10px');
        text.innerHTML = '< ' + self.name + ' >';
        if (self.name == planets[currentPlanet].name) {
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
    var svg_flights = document.getElementById('svg_flights');
    while (svg_flights.firstChild) {
        svg_flights.removeChild(svg_flights.firstChild);
    }
    var self = this;
    flights.forEach(function (self, index) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', (planets[self.from].position.x).toString() + '%');
        line.setAttribute('y1', (planets[self.from].position.y).toString() + '%');
        line.setAttribute('x2', (planets[self.to].position.x).toString() + '%');
        line.setAttribute('y2', (planets[self.to].position.y).toString() + '%');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '2');
        line.setAttribute('stroke', '#aaaaaa');
        svg_flights.appendChild(line);
        var dx = planets[self.to].position.x - planets[self.from].position.x;
        var dy = planets[self.to].position.y - planets[self.from].position.y;
        var distance = Math.round(Math.sqrt(dx * dx + dy * dy));
        var ratio = self.elapsed / distance;
        var cir1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        cir1.setAttribute('cx', ((planets[self.from].position.x + (1 - ratio) * dx)).toString() + '%');
        cir1.setAttribute('cy', ((planets[self.from].position.y + (1 - ratio) * dy)).toString() + '%');
        cir1.setAttribute('r', '5');
        cir1.setAttribute('fill', '#dddddd');
        cir1.addEventListener('click', function () {
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
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', ((planets[self.from].position.x + (1 - ratio) * dx)).toString() + '%');
        text.setAttribute('y', ((planets[self.from].position.y + (1 - ratio) * dy) + 4).toString() + '%');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#dddddd');
        text.setAttribute('style', 'font-size: 8px');
        text.innerHTML = '< ' + starships[index].name + ' >';
        if (index == currentStarship) {
            text.setAttribute('fill', '#77ff79');
            cir1.setAttribute('fill', '#77ff79');
        }
        svg_flights.appendChild(cir1);
        svg_flights.appendChild(text);
    });
    planets.forEach(function (self, index) {
        var cir1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        cir1.setAttribute('cx', (self.position.x).toString() + '%');
        cir1.setAttribute('cy', (self.position.y).toString() + '%');
        cir1.setAttribute('r', '9');
        cir1.setAttribute('fill', '#333333');
        cir1.setAttribute('opacity', '0');
        cir1.addEventListener('click', function () {
            currentLookup = index;
            location.hash = '#planetdetails';
            resetLookup();
        }, false);
        svg_flights.appendChild(cir1);
    });
}
function resetMoney() {
    var moneyCounter = document.getElementById('money');
    moneyCounter.innerHTML = money.toString() + '$';
}
function update() {
    if (updateGUI || starships[currentStarship].enRoute) {
        if (updateGUI)
            updateGUI = false;
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

},{"./types":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Statistics = /** @class */ (function () {
    function Statistics(speed, armor, attackPoints, range, warp, capacity) {
        this.speed = speed;
        this.armor = armor;
        this.attackPoints = attackPoints;
        this.range = range;
        this.warp = warp;
        this.capacity = capacity;
    }
    return Statistics;
}());
exports.Statistics = Statistics;
var Cargo = /** @class */ (function () {
    function Cargo(name, amount, buyValue, sellValue, isLegal) {
        this.name = name;
        this.amount = amount;
        this.buyValue = buyValue;
        this.sellValue = sellValue;
        this.isLegal = isLegal;
    }
    return Cargo;
}());
exports.Cargo = Cargo;
var Flight = /** @class */ (function () {
    function Flight(from, to, elapsed) {
        this.from = from;
        this.to = to;
        this.elapsed = elapsed;
    }
    return Flight;
}());
exports.Flight = Flight;
var Score = /** @class */ (function () {
    function Score(player, score) {
        this.player = player;
        this.score = score;
    }
    return Score;
}());
exports.Score = Score;
var Preset = /** @class */ (function () {
    function Preset(name, author, content) {
        this.name = name;
        this.author = author;
        this.content = content;
    }
    return Preset;
}());
exports.Preset = Preset;
var Starship = /** @class */ (function () {
    function Starship(name, shipType, stats, dockedAt, enRoute, skin) {
        this.name = name;
        this.shipType = shipType;
        this.stats = stats;
        this.dockedAt = dockedAt;
        this.enRoute = enRoute;
        this.skin = skin;
        this.cargoBay = [];
    }
    Starship.prototype.loadCargo = function (cargo) {
        var alreadyIn = false;
        for (var i = 0; i < this.cargoBay.length; i++) {
            if (this.cargoBay[i].name == cargo.name) {
                this.cargoBay[i].amount += cargo.amount;
                alreadyIn = true;
            }
        }
        if (!alreadyIn) {
            this.cargoBay.push(cargo);
        }
    };
    Starship.prototype.unloadCargo = function (name) {
        for (var i = 0; i < this.cargoBay.length; i++) {
            if (this.cargoBay[i].name == name) {
                this.cargoBay[i].amount -= 1;
                if (this.cargoBay[i].amount <= 0) {
                    this.cargoBay.splice(i, 1);
                }
                return true;
            }
        }
        return false;
    };
    Starship.prototype.getCargoAmount = function (name) {
        for (var i = 0; i < this.cargoBay.length; i++) {
            if (this.cargoBay[i].name == name) {
                return this.cargoBay[i].amount;
            }
        }
        return 0;
    };
    return Starship;
}());
exports.Starship = Starship;
var Position = /** @class */ (function () {
    function Position(x, y) {
        this.x = x;
        this.y = y;
    }
    return Position;
}());
exports.Position = Position;
var Planet = /** @class */ (function () {
    function Planet(name, skin, position, type, atmo, temp, smax, star) {
        this.name = name;
        this.skin = skin;
        this.position = position;
        this.type = type;
        this.atmo = atmo;
        this.temp = temp;
        this.smax = smax;
        this.star = star;
        this.goods = [];
    }
    Planet.prototype.addSupplies = function (supply) {
        this.goods.push(supply);
    };
    Planet.prototype.refillSupplies = function (name, amount) {
        for (var i = 0; i < this.goods.length; i++) {
            if (this.goods[i].name == name) {
                this.goods[i].amount += amount;
            }
        }
    };
    return Planet;
}());
exports.Planet = Planet;

},{}]},{},[1]);
