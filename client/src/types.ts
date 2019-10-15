export class Statistics {
    constructor(public speed: number,
                public armor: number,
                public attackPoints: number,
                public range: number,
                public warp: number,
                public capacity: number) {
    }
}

export class Cargo {
    constructor(public name: string,
                public amount: number,
                public buyValue: number,
                public sellValue: number,
                public isLegal: boolean) {
    }
}

export class Flight {
    constructor(public from: number,
                public to: number,
                public elapsed: number) {
    }
}

export class Score {
    constructor (public player: string,
                 public score: number) {
    }
}

export class Preset {
    constructor (public name: string,
                 public author: string,
                 public content: string) {
    }
}

export class Starship {
    cargoBay: Cargo[];

    constructor(public name: string,
                public shipType: string,
                public stats: Statistics,
                public dockedAt: string,
                public enRoute: boolean,
                public skin: string) {
        this.cargoBay = [];
    }

    public loadCargo(cargo: Cargo) {
        let alreadyIn: boolean = false;

        for (let i = 0; i < this.cargoBay.length; i++) {
            if (this.cargoBay[i].name == cargo.name) {
                this.cargoBay[i].amount += cargo.amount;
                alreadyIn = true;
            }
        }

        if (!alreadyIn) {
            this.cargoBay.push(cargo);
        }
    }

    public unloadCargo(name: string) {
        for (let i = 0; i < this.cargoBay.length; i++) {
            if (this.cargoBay[i].name == name) {
                this.cargoBay[i].amount -= 1;

                if (this.cargoBay[i].amount <= 0) {
                    this.cargoBay.splice(i, 1);
                }

                return true;
            }
        }
        return false;
    }

    public getCargoAmount(name: string) {
        for (let i = 0; i < this.cargoBay.length; i++) {
            if (this.cargoBay[i].name == name) {
                return this.cargoBay[i].amount;
            }
        }
        return 0;
    }
}

export class Position {
    constructor(public x: number,
                public y: number) {
    }
}

export class Planet {
    goods: Cargo[];

    constructor(public name: string,
                public skin: string,
                public position: Position,
                public type: string,
                public atmo: string,
                public temp: string,
                public smax: string,
                public star: string) {
        this.goods = [];
    }

    public addSupplies(supply: Cargo) {
        this.goods.push(supply);
    }

    public refillSupplies(name: string, amount: number) {
        for (let i = 0; i < this.goods.length; i++) {
            if (this.goods[i].name == name) {
                this.goods[i].amount += amount;
            }
        }
    }
}