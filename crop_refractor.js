const fs = require('fs');

const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
const fileMap = {
    'Spring': 'crops_spring.js',
    'Summer': 'crops_summer.js',
    'Autumn': 'crops_autumn.js',
    'Winter': 'crops_winter.js'
};

function getArrayFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(/\[([\s\S]*?)\]/);
        if (!match) return [];
        let arrayString = `[${match[1]}]`;
        // Clean comments/newlines for JSON parsing
        arrayString = arrayString.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
        // Evaluate as JS code to handle the array literal
        return eval(arrayString); 
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err.message);
        return [];
    }
}

function refactorCrops() {
    const assignedCrops = new Set();
    const finalLists = {
        'Spring': [],
        'Summer': [],
        'Autumn': [],
        'Winter': []
    };

    console.log("Refactoring crops based on priority: Spring > Summer > Autumn > Winter...\n");

    seasons.forEach(season => {
        const crops = getArrayFromFile(fileMap[season]);
        
        crops.forEach(crop => {
            const normalized = crop.toString().trim();
            if (!assignedCrops.has(normalized.toLowerCase())) {
                finalLists[season].push(crop);
                assignedCrops.add(normalized.toLowerCase());
            } else {
                console.log(`[REMOVED] Duplicate "${crop}" removed from ${season} (already assigned to an earlier season).`);
            }
        });
    });

    seasons.forEach(season => {
        const fileName = `clean_${fileMap[season]}`;
        const content = `const ${season.toLowerCase()}Crops = ${JSON.stringify(finalLists[season], null, 4)};`;
        fs.writeFileSync(fileName, content);
        console.log(`Created ${fileName} with ${finalLists[season].length} unique crops.`);
    });

    console.log("\nDone! Check your folder for the 'clean_' files.");
}

refactorCrops();