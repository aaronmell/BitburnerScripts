import { getPlayerFilename } from "/mcp/constants";

/** @param {NS} ns */
export async function main(ns: NS) {
    const player = ns.getPlayer();
    const playerString = JSON.stringify(player);
    await ns.write(getPlayerFilename(), playerString, "w");
}
