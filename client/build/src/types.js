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
