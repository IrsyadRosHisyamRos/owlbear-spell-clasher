import "./style.css";
import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { setupMainMenu } from "./initiativeList";

document.querySelector("#app").innerHTML = `
  <div>
    <h1>ChadRose's Spell Clasher</h1>
    <h2>Mechanic by sup2244</h2>
    <ul id="initiative-list"></ul>
  </div>
`;

OBR.onReady(() => {
  setupContextMenu();
  setupMainMenu(document.querySelector("#initiative-list"));
});