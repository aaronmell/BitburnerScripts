/** @param {NS} ns */
export async function main(ns: NS) {
  const serverName = ns.args[0] as string;
  await ns.weaken(serverName);
}
