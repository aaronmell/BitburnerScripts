/** @param {NS} ns */
export async function main(ns: NS) {
  runHomeScript(ns, "gen_servers.js");
  await ns.sleep(1000);

  runHomeScript(ns, "hack_all_serversv2.js");

  await ns.sleep(1000);

  runHomeScript(ns, "copy_files.js");

  await ns.sleep(1000);

  runHomeScript(ns, "gen_player.js");

  await ns.sleep(1000);
}

/** @param {NS} ns */
function runHomeScript(ns: NS, scriptName: string) {
  const home = "home";

  if (!ns.scriptRunning(scriptName, "home")) {
    ns.exec(scriptName, home);
  }
}
