const fs = require("fs");
    const path = require("path");

    const root = process.cwd();
    const publicDir = path.join(root, "public");

    if (!fs.existsSync(publicDir)) {
      console.error("ERROR: public folder not found.");
      process.exit(1);
    }

    const scriptDir = __dirname;
    const imageNames = [
      "about_us_1.webp",
      "about_us_2.webp",
      "about_us_3.webp",
      "about_us_4.webp",
    ];

    for (const name of imageNames) {
      const source = path.join(scriptDir, name);
      if (!fs.existsSync(source)) {
        console.error(`ERROR: Missing ${name} beside this script.`);
        process.exit(1);
      }
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(
      root,
      ".mollick-backups",
      `our-process-images-${stamp}`
    );

    fs.mkdirSync(backupDir, { recursive: true });

    for (const name of imageNames) {
      const destination = path.join(publicDir, name);

      if (fs.existsSync(destination)) {
        fs.copyFileSync(destination, path.join(backupDir, name));
        console.log(`Backup: public/${name}`);
      }

      fs.copyFileSync(path.join(scriptDir, name), destination);
      console.log(`Updated: public/${name}`);
    }

    console.log("
SUCCESS!");
    console.log("Replaced all 4 Our Process images.");
    console.log("No JSX/CSS/text/layout was changed.");
    console.log(`Backup folder: ${backupDir}`);
    console.log("
Image mapping:");
    console.log("about_us_1.webp -> Product Strategy");
    console.log("about_us_2.webp -> UX & Design");
    console.log("about_us_3.webp -> Engineering & Development");
    console.log("about_us_4.webp -> Launch & Support");
    console.log("
Now run:");
    console.log("npm run dev -- --host");
