import OBR from "@owlbear-rodeo/sdk";

export function getExtensionId(module) {
    return `com.chadrose.spell-clash/${module}`
}

export function debounce(func, delay) {
    let timeoutId;

    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
        func.apply(this, args);
        }, delay);
    };
}

export async function sleepFor(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}