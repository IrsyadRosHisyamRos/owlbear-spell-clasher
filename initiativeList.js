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

    // Create new list nodes for each initiative item
    const nodes = [];
    for (const clash of clashes) {
      const node = document.createElement("li");
      node.innerHTML = `Side ${clash.side}: ${clash.name}`;
      nodes.push(node);
    }
    element.replaceChildren(...nodes);
  };
  OBR.scene.items.onChange(renderList);
}
