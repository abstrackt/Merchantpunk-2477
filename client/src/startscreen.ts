import {
    Score, Preset
} from './types';


let scores: Score[] = [];
let logged: boolean = false;
let user: string;

let presets: Preset[] = [];
let currentPreset = 0;

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
    let table = document.getElementById('highscores');

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    for (let i = 0; i < Math.min(scores.length, 5); i++) {
        let tableRow = document.createElement('tr');

        table.appendChild(tableRow);

        let nameElement = document.createElement('td');
        let nameText = document.createTextNode(scores[i].player);

        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);

        let scoreElement = document.createElement('td');
        let scoreText = document.createTextNode(scores[i].score.toString());

        tableRow.appendChild(scoreElement);
        scoreElement.appendChild(scoreText);
    }

    if (scores.length < 5) {
        for (let i = 0; i < 5 - scores.length; i++) {
            let tableRow = document.createElement('tr');

            table.appendChild(tableRow);

            let nameElement = document.createElement('td');
            let nameText = document.createTextNode('---');

            tableRow.appendChild(nameElement);
            nameElement.appendChild(nameText);

            let scoreElement = document.createElement('td');
            let scoreText = document.createTextNode('0');

            tableRow.appendChild(scoreElement);
            scoreElement.appendChild(scoreText);
        }
    }
}

function setSubmitButton() {
    let button = document.getElementById('submit');
    let form = <HTMLInputElement>document.getElementById('game_nick');

    document.getElementById("login_result").innerHTML = "Access your account";

    button.addEventListener('click', () => {
        user = form.value;
        updateStorage();
        location.href = 'maingame.html';
    });
}

function setLoggedSubmitButton() {
    let button = document.getElementById('playbutton');

    button.addEventListener('click', () => {
        updateStorage();
        location.href = 'maingame.html';
    });
}

function setSignupButton() {
    let button = document.getElementById('signup');
    let nick = <HTMLInputElement>document.getElementById('signup_nick');
    let pass = <HTMLInputElement>document.getElementById('signup_pwd');

    button.addEventListener('click', () => {
        let username = nick.value;
        let password = pass.value;
        signUp(username, password);
    });
}

function setLoginButton() {
    let button = document.getElementById('login');
    let nick = <HTMLInputElement>document.getElementById('login_nick');
    let pass = <HTMLInputElement>document.getElementById('login_pwd');

    button.addEventListener('click', () => {
        let username = nick.value;
        let password = pass.value;
        logIn(username, password);
    });
}

function setLogoutButton() {
    let button = document.getElementById('logout');

    button.addEventListener('click', () => {
        logged = false;
        user = "";
        updateLoginState();
    });
}


function updateLoginState() {


    let container = document.getElementById("buttons");
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
    } else {
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
    let uploadButton = document.getElementById('send_preset');
    let fileName = <HTMLInputElement>document.getElementById('preset_name');

    uploadButton.addEventListener('click', () => {
        let name = fileName.value;
        addPreset(user, name);
    });
}

function choosePreset(i: number) {
    currentPreset = i;
    let preset = document.getElementById('current_preset');
    preset.innerHTML = presets[currentPreset].name;
}

function updatePresets() {
    let table = document.getElementById('preset_menu');

    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    for (let i = 0; i < presets.length; i++) {
        let tableRow = document.createElement('tr');

        table.appendChild(tableRow);

        let nameElement = document.createElement('td');
        let nameText = document.createTextNode(presets[i].name);

        nameElement.addEventListener('click', () => {
            choosePreset(i);
        }, false);

        tableRow.appendChild(nameElement);
        nameElement.appendChild(nameText);

        let authorElement = document.createElement('td');
        let authorText = document.createTextNode(presets[i].author);

        tableRow.appendChild(authorElement);
        authorElement.appendChild(authorText);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//*                                                 Client functions                                                *//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function signUp(nickname: string, password: string) {
    console.log("sending request\n");

    if (nickname.length != 0 && password.length != 0) {

        let data = {
            'nickname': nickname,
            'password': password
        };

        fetch("http://localhost:8082/register", {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(data)

        }).then(
            response => {
                if (response.status == 200) {
                    document.getElementById("signup_result").innerHTML = "Success!";
                    console.log("added account\n");
                } else {
                    document.getElementById("signup_result").innerHTML = "Wrong data.";
                }
            }
        )
    }
}

function addPreset(nickname: string, saveName: string) {
    console.log("sending request\n");

    let fileForm = <HTMLInputElement>document.getElementById('preset_selector');
    let file = fileForm.files[0];

    console.log(file.name);

    if (file.name.length != 0 && saveName.length != 0) {

        let reader = new FileReader();

        reader.onload = function () {

            let data = {
                'nickname': nickname,
                'savename': saveName,
                'savedata': reader.result
            };

            fetch("http://localhost:8082/addfile", {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(data)
            }).then(
                response => {
                    if (response.status == 200) {
                        console.log("added preset\n");
                        loadPresets();
                    }
                }
            )
        };

        reader.readAsText(file);

    }
}

function loadPresets() {
    console.log("sending request\n");

    fetch("http://localhost:8082/getfiles", {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
    }).then(
        response => {
            if (response.status == 200) {
                response.text().then((text) => {
                    let json = JSON.parse(text);

                    console.log(json);

                    presets = [];

                    for (let key in json) {
                        console.log("adding preset");
                        presets.push(new Preset(json[key].savename, json[key].username, json[key].savedata));
                    }

                    updatePresets();
                    choosePreset(0);
                })
            } else {
                console.log("Error");
            }
        }
    )
}

function logIn(nickname: string, password: string) {
    console.log("sending request\n");

    if (nickname.length != 0 && password.length != 0) {

        let data = {
            'nickname': nickname,
            'password': password
        };

        fetch("http://localhost:8082/login", {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(data)

        }).then(
            response => {
                if (response.status == 200) {
                    document.getElementById("login_result").innerHTML = "Logged in";
                    console.log("logged in\n");
                    logged = true;
                    user = nickname;
                } else {
                    document.getElementById("login_result").innerHTML = "Wrong credentials";
                }
                updateLoginState();
            }
        )

    }
}