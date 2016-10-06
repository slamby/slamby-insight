const fs = require('fs-extra');
const jsonfile = require('jsonfile');

try { 
    console.log("Clean files...");
    
    fs.removeSync('packager/temp');

    console.log("Copying files...");

    fs.copySync('src/assets', 'packager/temp/assets');
    fs.copySync('src/build', 'packager/temp/build');
    fs.copySync('src/helper', 'packager/temp/helper');
    fs.copySync('src/index.html', 'packager/temp/index.html');
    fs.copySync('src/main.js', 'packager/temp/main.js');
    
    console.log("Copy succeded!");

    const sourceFile = "package.json";
    const targetFile = "tasks/package.release.json";
    const tempTargetFile = "packager/temp/package.json";
    var sourcePackage = jsonfile.readFileSync(sourceFile);
    var targetPackage = jsonfile.readFileSync(targetFile);

    targetPackage.name = sourcePackage.name;
    targetPackage.version = sourcePackage.version;
    targetPackage.description = sourcePackage.description;
    targetPackage.author = sourcePackage.author;

    jsonfile.writeFileSync(tempTargetFile, targetPackage, {spaces: 4});

    console.log("Package.json update succeded!");
} catch (err) {
    console.error(err);
    process.exit(1);
}