import OBR from "@owlbear-rodeo/sdk";

const ID = "com.chadrose.spell-clash";

OBR.onReady(async () => {
    const scale = await OBR.scene.grid.getScale()
    const selection = await OBR.player.getSelection()
    let current_height = 0
    if (selection) {
        const items = await OBR.scene.items.getItems(selection);
        for (const item of items) {
            if (item.metadata?.[meta_id]?.item_height) {
                let this_height = item.metadata[meta_id].item_height
                if (this_height) {
                    current_height = this_height
                }
            }
        }

    }
    const input = document.getElementById("height");
    const unit = document.getElementById("unit");
    const reset = document.getElementById("reset");
    input.value = current_height;
    input.attributes["step"].value = scale.parsed.multiplier;
    unit.innerHTML = `${scale.parsed.unit}.`;
    
    window.addEventListener('keydown', (e) => {
        if (e.keyIdentifier=='U+000A' || e.keyIdentifier=='Enter' || e.keyCode==13) {
            if (e.target.nodeName=='input' && e.target.type=='number') {
                e.preventDefault();

                return false;
            }
        }
    }, true);

    let debounced_set_height = debounce(set_height, 250);

    input.addEventListener("keyup", debounced_set_height);
    input.addEventListener("input", debounced_set_height);
    reset.addEventListener("click", debounced_set_height);

    async function set_height(event) {
        if (event.keyIdentifier=='U+000A' || event.keyIdentifier=='Enter') {
            if (event.target.nodeName=='input') {
                event.preventDefault();
                return false;
            }
        } 

        let new_height = parseInt(event.target.value);
        if (!new_height || isNaN(new_height)) {
            new_height = 0
        }
        
        const dpi = await OBR.scene.grid.getDpi()
        const scale = await OBR.scene.grid.getScale()
        
        const items = await OBR.scene.items.getItems(selection);
        const allHeightIcons = await OBR.scene.items.getItems((item) => {
            const old_id = item.id.startsWith(`${meta_id}/`)
            const metadata = item.metadata[meta_id]
            return old_id || metadata
        });
        
        const toDelete = [];
        const toSetLabel = [];
        const toAdd = []
        const toUpdate = [];

        for (const item of items) {
            const attachedHeight = allHeightIcons.filter((icon) => icon.attachedTo === item.id);
            if (new_height == 0) {
                toDelete.push(...attachedHeight.map((icon) => icon.id));
                new_height = 0
            } else if (attachedHeight.length == 1) {
                toSetLabel.push(attachedHeight[0].id);
            } else {
                const dpiScale = dpi / item.grid.dpi;
                const height = item.image.height * dpiScale * item.scale.y;
                const offsetY = (item.grid.offset.y / item.image.height) * height;

                // Apply image offset and offset position to be centered just above the token label
                const position = {
                    x: item.position.x,
                    y: item.position.y + offsetY - 60,
                };

                const image = buildImage(
                    {
                        height: 40,
                        width: 40,
                        url: `https://owlbear-distances.onrender.com/wing.png`,
                        mime: "image/png",
                    },
                    { 
                        dpi: 40, offset: { x: 20, y: 20 } 
                    }
                )
                .name("Height")
                .position(position)
                .layer("ATTACHMENT")
                .scale({x: 0.3, y: .3})
                .plainText(`${new_height} ${scale.parsed.unit}.`)
                .locked(true)
                .attachedTo(item.id)
                .disableAttachmentBehavior(["ROTATION"])
                .metadata({ [meta_id]: { enabled: true } })
                .visible(item.visible)
                .build()
                toAdd.push(image);
                
            }

            if (item.metadata?.[meta_id]?.["item_height"] != new_height) {
                toUpdate.push(item.id);
            }
        }

        // Remove, update, and add items as necessary
        if (toDelete.length) {
            await OBR.scene.items.deleteItems(toDelete);
        }
        if (toSetLabel.length) {
            await OBR.scene.items.updateItems(toSetLabel, (items) => {
                for (const item of items) {
                    item.text.plainText = `${new_height} ${scale.parsed.unit}.`
                }
            });
        }
        if (toUpdate.length) {
            await OBR.scene.items.updateItems(toUpdate, (items) => {
                for (const item of items){
                    item.metadata[`${meta_id}`] = {
                        item_height: new_height,
                    };
                }
            });
        }
        if (toAdd.length) {
            await OBR.scene.items.addItems(toAdd);
        }
        
    };

});