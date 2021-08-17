var player;
var rival;

var playerMoveSet = [];
var rivalMoveSet = [];
var winners;
var end = false;

function showDmg(target, damage) {
    var hpBar = $("#" + target + "-hp-bar");
    var hp = $("#" + target + "-current-hp");
    var value = hp.text();
    var pokemon = $("#" + target + "-pokemon").parent();

    pokemon.addClass("shake");
    setTimeout(function() {
        pokemon.removeClass("shake");
    }, 1000);

    if(damage < value)  {
        hpBar[0].value -= damage;
        hp.text(value - damage);
    } else {
        hpBar[0].value = 0;
        hp.text("0");
        updateLog(target, damage);
        endMatch(target);
        end = true;
    }

    if(hpBar[0].value < (player.pokemon.stats.health * .75)) {
        hpBar.removeClass("is-success");
        hpBar.addClass("is-warning");
    }
    if (hpBar[0].value <= player.pokemon.stats.health * .25) {
        hpBar.removeClass("is-success");
        hpBar.removeClass("is-warning");
        hpBar.addClass("is-danger");
    }

    if(!end)
        updateLog(target, damage);
};

function updateLog(target, damage) {
    var attacker = "";
    var logElement = $("#battle-log")[0];

    if(target === "rival")
        attacker = $("#player-name")[0].textContent;
    else
        attacker = $("#rival-name")[0].textContent;

    logElement.value = attacker + " attacked " + $("#" + target + "-name")[0].textContent + " for " + damage + " damage.\n" + logElement.value;
};

function calculateDmg(move) {
    return Math.floor((Math.random() * 23) + 1);
};

function loadData() {
    player = JSON.parse(sessionStorage.getItem("player"));
    rival = JSON.parse(sessionStorage.getItem("rival"));


    var stageEl = $("#stage");
    var playerHPBarEl = $("#player-hp-bar");
    var playerCurrentHPEl = $("#player-current-hp");
    var playerMaxHPEl = $("#player-max-hp");
    var playerNameEl = $("#player-name");
    var playerPokemonEl = $("#player-pokemon")


    playerCurrentHPEl[0].textContent = playerMaxHPEl[0].textContent = playerHPBarEl[0].value = playerHPBarEl[0].max = player.pokemon.stats.health;
    playerPokemonEl[0].alt = playerNameEl[0].textContent = player.pokemon.name[0].toUpperCase() + player.pokemon.name.substring(1);
    playerPokemonEl[0].src = player.pokemon.sprite;

    var rivalHPBarEl = $("#rival-hp-bar");
    var rivalCurrentHPEl = $("#rival-current-hp");
    var rivalMaxHPEl = $("#rival-max-hp");
    var rivalNameEl = $("#rival-name");
    var rivalPokemonEl = $("#rival-pokemon")

    rivalCurrentHPEl[0].textContent = rivalMaxHPEl[0].textContent = rivalHPBarEl[0].value = rivalHPBarEl[0].max = rival.pokemon.stats.health;
    rivalPokemonEl[0].alt = rivalNameEl[0].textContent = rival.pokemon.name[0].toUpperCase() + rival.pokemon.name.substring(1);
    rivalPokemonEl[0].src = rival.pokemon.sprite;

    for(var i = 0; i < 4; i++) {
        var playerRand = Math.floor(Math.random() * player.pokemon.moves.length);
        var rivalRand = Math.floor(Math.random() * rival.pokemon.moves.length);

        playerMoveSet.push(player.pokemon.moves[playerRand]);
        rivalMoveSet.push(rival.pokemon.moves[rivalRand]);

        switch(i) {
            case 0: $("#attack1")[0].textContent = playerMoveSet[i].name;
                break;
            case 1: $("#attack2")[0].textContent = playerMoveSet[i].name;
                break;
            case 2: $("#attack3")[0].textContent = playerMoveSet[i].name;
                break;
            case 3: $("#attack4")[0].textContent = playerMoveSet[i].name;
                break;
        }
    }

    $(".attack").click(function() {
        var attack = $(this)[0].textContent;
        
        $(':button').prop('disabled', true);
        showDmg("rival", calculateDmg(attack));

        setTimeout(function() {
            if(!end) {
                $(':button').prop('disabled', false);
                showDmg("player", calculateDmg(attack));
            }
        }, 3000);

        
    })
};

function endMatch(target) {
    winners = localStorage.getItem("winners");
    console.log(winners);
    winners = winners ? JSON.parse(winners) : [];
    var attacker;

    $(':button').prop('disabled', true);
    if(target !== "player") {
        var tempWin = {
            name: player.name,
            pokemon: player.pokemon.name[0].toUpperCase() + player.pokemon.name.substring(1)
        }

        sessionStorage.setItem("winner", JSON.stringify(tempWin));
    }

    if(target === "rival")
        attacker = $("#player-name")[0].textContent;
    else
        attacker = $("#rival-name")[0].textContent;

    var logElement = $("#battle-log")[0];
    logElement.value = $("#" + target + "-name")[0].textContent + " has fainted.\n" + logElement.value;

    setTimeout(function() {
        sessionStorage.removeItem("player");
        sessionStorage.removeItem("rival");
        window.location = "./win.html";
    }, 5000);
};

$(document).ready(function () {
    loadData();
});