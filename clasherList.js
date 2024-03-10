import OBR from "@owlbear-rodeo/sdk";

const ID = "com.chadrose.spell-clash";

export function setupMainMenu(element) {
  const renderList = (players) => {
    // Get the name and initiative of any item with
    // our initiative metadata
    const clashes = [];
    for (const player of players) {
      const metadata = player.metadata[`${ID}/metadata`];
      if (metadata) {
        clashes.push({
          side: metadata.side,
          name: player.name,
        });
      }
    }

    // Create new list nodes for each clasher
    const nodes = [];
    for (const clash of clashes) {
      const node = document.createElement("li");
      node.innerHTML = `Side ${clash.side}: ${clash.name}`;
      nodes.push(node);
    }
    
    // Create button if there are clashers
    let button;
    if (nodes.length > 0) {
      button = document.createElement("input");
      button.setAttribute("type", "button");
      button.setAttribute("id", "reset");
      button.setAttribute("value", "Clash!");
      nodes.push(button)
    }

    element.replaceChildren(...nodes);
  };
  OBR.scene.items.onChange(renderList);
}
