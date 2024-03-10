import OBR from "@owlbear-rodeo/sdk";
import { getExtensionId, debounce, sleepFor } from "./utils";

export function setupMainMenu(element) {
  const renderList = (players) => {
    // Get the name and initiative of any item with
    // our initiative metadata
    let sideA;
    let sideB;
    for (const player of players) {
      const metadata = player.metadata[getExtensionId("metadata")];
      if (metadata) {
        window.console.log(player);
        if (metadata.side == "A") {
          sideA = {
            name: player.name,
            img: player.image.url,
            side: metadata.side,
          };
        } else if (metadata.side == "B") {
          sideB = {
            name: player.name,
            img: player.image.url,
            side: metadata.side,
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
    }
    
    // Create button if there are clashers
    let button;
    if (sideA && sideB) {
      button = document.createElement("input");
      button.setAttribute("type", "button");
      button.setAttribute("id", "reset");
      button.setAttribute("value", "Clash!");
      
      // Button onClicked() event
      async function start_clash(event) {
        if (event.keyIdentifier=='U+000A' || event.keyIdentifier=='Enter') {
            if (event.target.nodeName=='input') {
                event.preventDefault();
                return false;
            }
        }

        event.target.disabled = true;
        window.console.log("Clash started");
        await sleepFor(5000);
        event.target.disabled = false;
      }
      button.addEventListener("click", debounce(start_clash, 250));

      nodes.push(button)
    }

    element.replaceChildren(...nodes);
  };
  OBR.scene.items.onChange(renderList);
}
