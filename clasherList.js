import OBR from "@owlbear-rodeo/sdk";
import { getExtensionId, debounce, sleepFor } from "./utils";

export function setupMainMenu(element) {
  const renderList = (players) => {
    // Get the player data
    let sideA;
    let sideB;
    for (const player of players) {
      const metadata = player.metadata[getExtensionId("metadata")];
      if (metadata) {
        if (metadata.side == "A") {
          sideA = {
            id: metadata.id,
            name: player.name,
            img: player.image.url,
            side: metadata.side,
            score: metadata.score,
            pos: [player.position.x, player.position.y],
            offset: [player.grid.offset.x, player.grid.offset.y],
          };
        } else if (metadata.side == "B") {
          sideB = {
            id: metadata.id,
            name: player.name,
            img: player.image.url,
            side: metadata.side,
            score: metadata.score,
            pos: [player.position.x, player.position.y],
            offset: [player.grid.offset.x, player.grid.offset.y],
          };
        }
      }
    }

    // Create new list nodes for each clasher
    let nodes = [];
    if (sideA && sideB){
      const node = document.createElement("div");
      node.style.display = "flex";

      // Player side A
      let imageA = document.createElement("img");
      imageA.style.margin = "auto";
      imageA.src = sideA.img;
      imageA.height = 70;
      imageA.width = 70;
      node.appendChild(imageA);

      // Middle section
      let middleContainer = document.createElement("div");
      middleContainer.style.display = "flex";
      middleContainer.style.flexDirection = "column";
      middleContainer.style.flex = "1";
      middleContainer.innerHTML += `<p style="text-align: left;">${sideA.name}</p>`;
      middleContainer.innerHTML += `<p style="text-align: centre;">VS</p>`;
      middleContainer.innerHTML += `<p style="text-align: right;">${sideB.name}</p>`;
      node.appendChild(middleContainer);

      // Player side B
      let imageB = document.createElement("img");
      imageB.style.margin = "auto";
      imageB.src = sideB.img;
      imageB.height = 70;
      imageA.width = 70;
      node.appendChild(imageB);
      nodes.push(node);

      // Create button if there are clashers
      let button = document.createElement("input");
      button.setAttribute("type", "button");
      button.setAttribute("id", "reset");
      button.setAttribute("value", "Clash!");

      // Sword.mp3
      let swordSwing = []
      swordSwing.push(new Audio("https://cdn.pixabay.com/download/audio/2022/03/01/audio_274b32a58a.mp3?filename=slash-21834.mp3"));
      swordSwing.push(new Audio("https://assets.mixkit.co/active_storage/sfx/1487/1487.wav"));
      swordSwing.push(new Audio("https://assets.mixkit.co/active_storage/sfx/2792/2792.wav"));
      swordSwing.push(new Audio("https://assets.mixkit.co/active_storage/sfx/2797/2797.wav"));
      function playSwordAudioFor(duration) {
        let audio = swordSwing[Math.floor(Math.random() * swordSwing.length)]
        audio.play();
        setTimeout(function() {
            audio.pause();
            audio.currentTime = 0;
        }, duration);
      }

      // Button onClicked() event 
      async function start_clash(event) {
        // Prevent input issues
        if (event.keyIdentifier=='U+000A' || event.keyIdentifier=='Enter') {
            if (event.target.nodeName=='input') {
                event.preventDefault();
                return false;
            }
        }

        // Disables button to start clash
        event.target.disabled = true;
        imageA.style.filter = "grayscale(0%)";
        imageB.style.filter = "grayscale(0%)";
        sideA.score = 0;
        sideB.score = 0;
        window.console.log("Clash started!");
        let round = 0;
        let targetScore = 4
        while (sideA.score < targetScore && sideB.score < targetScore){
          const timeFullSpeed = 330; // Time between rolls when it reaches full speed (Lower than 500 has sound issues)
          playSwordAudioFor(timeFullSpeed-10); // Comment this if the sound gets annoying

          const diceA = Math.floor(Math.random() * 20) + 1;
          const diceB = Math.floor(Math.random() * 20) + 1;
          
          // Reroll if draw
          if (diceA != diceB){
            // Higher roll: +1 score
            if (diceA > diceB)
              sideA.score++
            else
              sideB.score++

            // Nat 1: -1 score
            if (diceA == 0 && sideA.score > 0) sideA.score--
            if (diceB == 0 && sideB.score > 0) sideB.score--

            // Nat 20: +1 score
            if (diceA == 20) sideA.score++
            if (diceB == 20) sideB.score++  
          }
          window.console.log(`Round ${++round}: A=${sideA.score}, B=${sideB.score}`)

          // Proceed to next round if still no winner
          const timeInitMin = 1000; // Initial minimum time between rolls
          const timeInitRange = 250; // So the range is 1000-1500
          const roundsToFullSpeed = 6 // Number of rounds needed to reach full speed 
          const percentSpeed = (round>roundsToFullSpeed) ? 1.0 : round/roundsToFullSpeed;
          const timeCurrMin = timeInitMin - ((timeInitMin-timeFullSpeed)*percentSpeed);
          const timeRandom = Math.floor(Math.random()*timeInitRange*(1-percentSpeed)) 
          const timeToSleep = timeCurrMin + timeRandom

          // Stores the original position of the items
          const sideA_posX = sideA.pos.x
          const sideA_posY = sideA.pos.y
          const sideB_posX = sideB.pos.x
          const sideB_posY = sideB.pos.y
          function moveToClashAt(side, old_pos_x, old_pos_y, duration) {
            setTimeout(function() {
              OBR.scene.items.updateItems([side.id], (items) => {
                for (let item of items) {
                  item.position.x = old_pos_x;
                  item.position.y = old_pos_y;
                  //window.console.log(`${item.name} updated: [${item.position.x},${item.position.y}]`)
                }
              });
            }, duration);

            OBR.scene.items.updateItems([side.id], (items) => {
              for (let item of items) {
                item.position.x = side.pos.x;
                item.position.y = side.pos.y;
                //window.console.log(`${item.name} updated: [${item.position.x},${item.position.y}]`)
              }
            });
          }

          // Clash in the middle
          //window.console.log(`Side A: [${sideA.pos.x},${sideA.pos.y}]`)
          //window.console.log(`Side B: [${sideB.pos.x},${sideB.pos.y}]`)
          //window.console.log(`   Avg: [${(sideA.pos.x+sideB.pos.x)/2},${(sideA.pos.y+sideB.pos.y)/2}]`)
          sideA.pos.x = (sideA.pos.x+sideB.pos.x)/2 //+ (sideA.offset.x * ((sideA.pos.x < sideB.pos.x) ? -1 : 1))
          sideA.pos.y = (sideA.pos.y+sideB.pos.y)/2 //+ (sideA.offset.y * ((sideA.pos.y < sideB.pos.y) ? -1 : 1))
          sideB.pos.x = (sideA.pos.x+sideB.pos.x)/2 //+ (sideB.offset.x * ((sideA.pos.x < sideB.pos.x) ? 1 : -1))
          sideB.pos.y = (sideA.pos.y+sideB.pos.y)/2 //+ (sideB.offset.y * ((sideA.pos.y < sideB.pos.y) ? 1 : -1))
          // moveToClashAt(sideA, sideA_posX, sideA_posY, timeToSleep*0.4);
          // moveToClashAt(sideB, sideB_posX, sideB_posY, timeToSleep*0.4);

          // Repeat next round
          if (sideA.score < targetScore && sideB.score < targetScore){
            window.console.log(`Waiting for ${(timeToSleep/1000).toFixed(3)}s`)
            await sleepFor(Math.ceil(timeToSleep));
          }
        }

        let isSideAWin = (Math.random() < 0.5);
        if (isSideAWin){
          imageB.style.filter = "grayscale(100%)";
          window.console.log("Clash ended! A wins!");
        } else {
          imageA.style.filter = "grayscale(100%)";
          window.console.log("Clash ended! B wins!");
        }
          
        // Enables button again
        event.target.disabled = false;
      }
      button.addEventListener("click", debounce(start_clash, 250));

      nodes.push(button)
    }

    element.replaceChildren(...nodes);
  };
  OBR.scene.items.onChange(renderList);
}
