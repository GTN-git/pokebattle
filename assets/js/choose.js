var player = {
  name: "player",
  pokemon: {}
}

var rival = {
  name: "rival",
  pokemon: {}
}

var pokemon;
var location;
var movesList = [];
var coords = [ "27.17400606300552,78.0422513023935",
               "51.17877711750124,-1.826188341180512",
               "35.6244244,139.7755421",
               "43.610491,-116.197901" ];
var key = "key=AIzaSyCYGcyytvi9evk7Yc5TKac02OSXkrFUxZI";
var arenaLocation;

function getPokemon(trainer, choice) {
  if(choice === null)
    choice = Math.floor(Math.random() * 151);

  fetch("https://pokeapi.co/api/v2/pokemon/" + choice).then(function(response) {
    if(response.ok)
      return response.json();
    else {
      var errorEl = $("#error-modal");
      errorEl.addClass("is-active");
      $("#error-message").html("<p><strong>API Error:</strong> " + response.status + " - " + response.message + "</p>");
    }
  }).then(function(data) {
      pokemon = {
      name: data.name,
      moves: [],
      stats: {
        health: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        special_attack: data.stats[3].base_stat,
        special_defense: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
      },
      sprite: (trainer === "rival") ? data.sprites.versions['generation-v']['black-white'].animated.front_default : data.sprites.versions['generation-v']['black-white'].animated.back_default
    };

      var apiRequests = [];
      for(var i = 0; i < data.moves.length; i++) {
        apiRequests.push(fetch(data.moves[i].move.url));
      }

      Promise.all(apiRequests).then(responses => {
        for(var response of responses) {
          if(!response.ok) {
            var errorEl = $("#error-modal");
            errorEl.addClass("is-active");
            $("#error-message").html("<p><strong>API Error:</strong> " + response.status + " - " + response.message + "</p>");
            break;
          }
          return responses;
        }
      }).then(responses => Promise.all(responses.map(response => response.json()))).then(moves => moves.forEach(move => {
        if(move.power !== null) {
          var moveObj = {
            name: move.name,
            power: move.power,
            accuracy: move.accuracy,
            type: move.type.name
          }
          movesList.push(moveObj);
        }
      })).then(function() {
        pokemon.moves = movesList;
        movesList = [];

        if(trainer === "rival") {
          rival.pokemon = pokemon;
          sessionStorage.setItem("rival", JSON.stringify(rival));
          getLocation();
        } else {
          player.pokemon = pokemon;
          sessionStorage.setItem("player", JSON.stringify(player));
          getPokemon("rival", null);
        }
      });
  });
}

function getLocation() {
  var randomNum = Math.floor(Math.random() * coords.length);
  fetch("https://maps.googleapis.com/maps/api/streetview?location=" + coords[randomNum] + "&size=1400x1400&heading=70&pitch=0&" + key).then(function(response) { 
  if(response.ok) {
      arenaLocation = "https://maps.googleapis.com/maps/api/streetview?location=" + coords[randomNum] + "&size=1400x1400&heading=70&pitch=0&" + key;
      sessionStorage.setItem("location", JSON.stringify(arenaLocation));
      startMatch();
    } else {
      var errorEl = $("#error-modal");
      errorEl.addClass("is-active");
      $("#error-message").html("<p><strong>API Error:</strong> " + response.status + " - " + response.message + "</p>");
    }
  });
}

function startMatch() {
  var versusModalEl = $("#versus-modal");
  versusModalEl.addClass("is-active");

  var versusEl = $("#versus");
  versusEl.text(player.name + " VS. " + rival.name);

  var countdown = $("#countdown").text();
  
  var countTimer = function() {
    if(countdown > 0) {
      $("#countdown").text(countdown--);
      setTimeout(countTimer, 1000);
    } else {
      window.location = "./fight.html";
    }
  }
  countTimer();
}

$("#player-ok").click(function(event) {
  event.preventDefault();
  player.name = $("#player-name").val();
  if(player.name === "") {
    player.name = "Ash";
  }
  $(this).parent().parent().parent().parent().removeClass("is-active");
});

$(".modal-close").click(function () {
  $(this).parent().removeClass("is-active");
});

$(".button").click(function() {
  var pick = $(this).attr("id");
  getPokemon("player", pick);
  $(':button').prop('disabled', true);
});