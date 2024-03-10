import OBR from "@owlbear-rodeo/sdk";
import { getExtensionId } from "./utils";

export function setupContextMenu() {
  OBR.contextMenu.create({
    id: getExtensionId("context-menu"),
    icons: [
      {
        icon: "/add.svg",
        label: "Initiate Spell Clash",
        filter: {
          every: [ // Shows this button if the token is a character and has no metadata
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
            { key: ["metadata", getExtensionId("metadata")], value: undefined },
          ],
        },
      },
      {
        icon: "/remove.svg",
        label: "Cancel Spell Clash",
        filter: { // Shows this button if the token is a character
          every: [
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT" },
          ],
        },
      }
    ],
    embed: {
      url: "/clash-menu.html"
    }, 
    onClick(context) {
      // Check if item is being removed or added
      const addToClash = context.items.every(
        (item) => {
          let isNotClashing = item.metadata[getExtensionId("metadata")] === undefined
          return isNotClashing
        }
      );

      // [KIV] window.console.log(`${context.items[0].name}'s Pos [x:${context.items[0].position.x}, y:${context.items[0].position.y}]`)
      if (addToClash) {
        if (context.items.length > 1) {
          // Find all items that are in clash
          OBR.scene.items.getItems(
            (item) => item.metadata[getExtensionId("metadata")] // All item that have clash metadata
          ).then((items)=>{
            if (items.length > 0){ // There is already a clash
              OBR.scene.items.updateItems(items, (items) => {
                for (let item of items) {
                  item.metadata[getExtensionId("metadata")] = undefined
                }
              });
            }

            OBR.scene.items.updateItems(context.items, (items) => {
              let i = 0;
              let side;
              for (let item of items) {
                if (i==0) side = "A"
                else if (i==1) side = "B"
                else side = undefined

                if (side){
                  item.metadata[getExtensionId("metadata")] = {
                    id: item.id,
                    side: side,
                    score: 0,
                  };
                }

                i++;
              }
            });
          });
        } else {
          OBR.notification.show(`You need to select 2 tokens to start the clash`);
        }
      } else {
        OBR.scene.items.getItems(
          (item) => item.metadata[getExtensionId("metadata")] // All item that have clash metadata
        ).then((items)=>{
          OBR.scene.items.updateItems(items, (items) => {
            for (let item of items) {
              delete item.metadata[getExtensionId("metadata")]
            }
          });
        });
      }
    },
  });
}