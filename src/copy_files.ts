/** @param {NS} ns */
export async function main(ns: NS) {
  const serverTxt = ns.read("serverlist.json");
  const serverMap = JSON.parse(serverTxt);

  for (const serverName of Object.keys(serverMap)) {
    await ns.scp(["grow.js", "weaken.js", "hack.js"], serverName);
  }
}
