const url = "https://qazaq-drive.vercel.app/ru";
(async () => {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
    const html = await res.text();
    const deployed = {
      attempt,
      status: res.status,
      fullBleedHero: html.includes("min-h-[100svh]"),
      heroBgObject: html.includes("object-[62%_center]"),
      noGridHero: !html.includes("lg:grid-cols-[1.05fr_0.95fr]"),
    };
    console.log(deployed);
    if (deployed.fullBleedHero) break;
    await new Promise((r) => setTimeout(r, 20000));
  }
})();
