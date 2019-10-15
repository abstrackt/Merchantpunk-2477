(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var scores = [];
var logged = false;
var user;
var presets = [];
var currentPreset = 0;
loadPresets();
getStorage();
updateLoginState();
resetHighscores();
function getStorage() {
    scores = JSON.parse(localStorage.getItem('scores'));
    if (scores == null) {
        scores = [];
    }
}
function updateStorage() {
    localStorage.setItem('nickname', user);
    localStorage.setItem('file', presets[currentPreset].content);
}
function resetHighscores() {
    var table = document.getElementById('highscores');
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    for (var i = 0; i < Math.min(scores.length, 5); i++) {
        var tableRow = document.createElement('tr');
        table.appendChild(tableRow);
        var nameElement = document.createElement('td');
        var nameText = document.createTextNode(scores[i].player);
        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);
        var scoreElement = document.createElement('td');
        var scoreText = document.createTextNode(scores[i].score.toString());
        tableRow.appendChild(scoreElement);
        scoreElement.appendChild(scoreText);
    }
    if (scores.length < 5) {
        for (var i = 0; i < 5 - scores.length; i++) {
            var tableRow = document.createElement('tr');
            table.appendChild(tableRow);
            var nameElement = document.createElement('td');
            var nameText = document.createTextNode('---');
            tableRow.appendChild(nameElement);
            nameElement.appendChild(nameText);
            var scoreElement = document.createElement('td');
            var scoreText = document.createTextNode('0');
            tableRow.appendChild(scoreElement);
            scoreElement.appendChild(scoreText);
        }
    }
}
function setSubmitButton() {
    var button = document.getElementById('submit');
    var form = document.getElementById('game_nick');
    document.getElementById("login_result").innerHTML = "Access your account";
    button.addEventListener('click', function () {
        user = form.value;
        updateStorage();
        location.href = 'maingame.html';
    });
}
function setLoggedSubmitButton() {
    var button = document.getElementById('playbutton');
    button.addEventListener('click', function () {
        updateStorage();
        location.href = 'maingame.html';
    });
}
function setSignupButton() {
    var button = document.getElementById('signup');
    var nick = document.getElementById('signup_nick');
    var pass = document.getElementById('signup_pwd');
    button.addEventListener('click', function () {
        var username = nick.value;
        var password = pass.value;
        signUp(username, password);
    });
}
function setLoginButton() {
    var button = document.getElementById('login');
    var nick = document.getElementById('login_nick');
    var pass = document.getElementById('login_pwd');
    button.addEventListener('click', function () {
        var username = nick.value;
        var password = pass.value;
        logIn(username, password);
    });
}
function setLogoutButton() {
    var button = document.getElementById('logout');
    button.addEventListener('click', function () {
        logged = false;
        user = "";
        updateLoginState();
    });
}
function updateLoginState() {
    var container = document.getElementById("buttons");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    if (logged) {
        container.innerHTML =
            "<a class=\"startbutton\" id=\"playbutton\">Launch</a><br><br>" +
                "<a class=\"startbutton\" href=\"#popup4\" id=\"presets\">Presets</a><br><br>" +
                "<a class=\"startbutton\" id=\"logout\">Log out</a>";
        setPresetWindow();
        setLoggedSubmitButton();
        setLogoutButton();
    }
    else {
        container.innerHTML =
            "<a class=\"startbutton\" href=\"#popup1\" id=\"playbutton\">Launch</a><br><br>" +
                "<a class=\"startbutton\" href=\"#popup2\" id=\"signbutton\">Sign up</a><br><br>" +
                "<a class=\"startbutton\" href=\"#popup3\" id=\"loginbutton\">Log in</a>";
        setSubmitButton();
        setSignupButton();
        setLoginButton();
    }
}
function setPresetWindow() {
    var uploadButton = document.getElementById('send_preset');
    var fileName = document.getElementById('preset_name');
    uploadButton.addEventListener('click', function () {
        var name = fileName.value;
        addPreset(user, name);
    });
}
function choosePreset(i) {
    currentPreset = i;
    var preset = document.getElementById('current_preset');
    preset.innerHTML = presets[currentPreset].name;
}
function updatePresets() {
    var table = document.getElementById('preset_menu');
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
    var _loop_1 = function (i) {
        var tableRow = document.createElement('tr');
        table.appendChild(tableRow);
        var nameElement = document.createElement('td');
        var nameText = document.createTextNode(presets[i].name);
        nameElement.addEventListener('click', function () {
            choosePreset(i);
        }, false);
        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);
        var authorElement = document.createElement('td');
        var authorText = document.createTextNode(presets[i].author);
        tableRow.appendChild(authorElement);
        authorElement.appendChild(authorText);
    };
    for (var i = 0; i < presets.length; i++) {
        _loop_1(i);
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//*                                                 Client functions                                                *//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function signUp(nickname, password) {
    console.log("sending request\n");
    if (nickname.length != 0 && password.length != 0) {
        var data = {
            'nickname': nickname,
            'password': password
        };
        fetch("http://localhost:8082/register", {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(function (response) {
            if (response.status == 200) {
                document.getElementById("signup_result").innerHTML = "Success!";
                console.log("added account\n");
            }
            else {
                document.getElementById("signup_result").innerHTML = "Wrong data.";
            }
        });
    }
}
function addPreset(nickname, saveName) {
    console.log("sending request\n");
    var fileForm = document.getElementById('preset_selector');
    var file = fileForm.files[0];
    console.log(file.name);
    if (file.name.length != 0 && saveName.length != 0) {
        var reader_1 = new FileReader();
        reader_1.onload = function () {
            var data = {
                'nickname': nickname,
                'savename': saveName,
                'savedata': reader_1.result
            };
            fetch("http://localhost:8082/addfile", {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(data)
            }).then(function (response) {
                if (response.status == 200) {
                    console.log("added preset\n");
                    loadPresets();
                }
            });
        };
        reader_1.readAsText(file);
    }
}
function loadPresets() {
    console.log("sending request\n");
    fetch("http://localhost:8082/getfiles", {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
    }).then(function (response) {
        if (response.status == 200) {
            response.text().then(function (text) {
                var json = JSON.parse(text);
                console.log(json);
                presets = [];
                for (var key in json) {
                    console.log("adding preset");
                    presets.push(new types_1.Preset(json[key].savename, json[key].username, json[key].savedata));
                }
                updatePresets();
                choosePreset(0);
            });
        }
        else {
            console.log("Error");
        }
    });
}
function logIn(nickname, password) {
    console.log("sending request\n");
    if (nickname.length != 0 && password.length != 0) {
        var data = {
            'nickname': nickname,
            'password': password
        };
        fetch("http://localhost:8082/login", {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(function (response) {
            if (response.status == 200) {
                document.getElementById("login_result").innerHTML = "Logged in";
                console.log("logged in\n");
                logged = true;
                user = nickname;
            }
            else {
                document.getElementById("login_result").innerHTML = "Wrong credentials";
            }
            updateLoginState();
        });
    }
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
