var display = require('display');
var keyboard = require('keyboard');
var storage = require('storage');

// --- OpenSCAD KÓD GENERÁLÓ FÜGGVÉNY (KWIKSET KW1 5-PIN IMPERIAL) ---
function generateSCADScript(keyCodes) {
    
    var PIN_COUNT = 5;
    var shoulder = 0.247;
    var pin_spacing = 0.150;
    var depth_inc = 0.023;
    
    var convertedBits = [];
    for (var i = 0; i < PIN_COUNT; i++) {
        var bitValue = Math.max(0, keyCodes[i] - 1); 
        convertedBits.push(bitValue);
    }
    
    var SCAD = "";

    SCAD += "// Generated for 3D Printing by KeyCopier\n";
    SCAD += "// Key code: kw1(" + JSON.stringify(convertedBits) + ")\n";
    SCAD += "// NOTE: Using Kwikset KW1 5-PIN IMPERIAL standards.\n";
    SCAD += "\n";
    
    SCAD += "function mm(i) = i*25.4;\n";
    
    // A modulok definíciója
    SCAD += "module rounded(size, r) {\n";
    SCAD += "    union() {\n";
    SCAD += "        translate([r, 0, 0]) cube([size[0]-2*r, size[1], size[2]]);\n";
    SCAD += "        translate([0, r, 0]) cube([size[0], size[1]-2*r, size[2]]);\n";
    SCAD += "        translate([r, r, 0]) cylinder(h=size[2], r=r);\n";
    SCAD += "        translate([size[0]-r, r, 0]) cylinder(h=size[2], r=r);\n";
    SCAD += "        translate([r, size[1]-r, 0]) cylinder(h=size[2], r=r);\n";
    SCAD += "        translate([size[0]-r, size[1]-r, 0]) cylinder(h=size[2], r=r);\n";
    SCAD += "    }\n";
    SCAD += "}\n";
    
    SCAD += "module bit() {\n";
    SCAD += "    w = mm(1/4);\n";
    SCAD += "    difference() {\n";
    SCAD += "        translate([-w/2, 0, 0]) cube([w, mm(1), w]);\n";
    SCAD += "        translate([-mm(5/128), 0, 0]) rotate([0, 0, 135]) cube([w, w, w]);\n";
    SCAD += "        translate([mm(5/128), 0, 0]) rotate([0, 0, -45]) cube([w, w, w]);\n";
    SCAD += "    }\n";
    SCAD += "}\n";
    
    SCAD += "module kw1(bits) {\n";
    SCAD += "    thickness = mm(0.080);\n";
    SCAD += "    length = mm(1.500);\n";
    SCAD += "    width = mm(.337);\n";
    SCAD += "    shoulder = mm(" + shoulder.toFixed(3) + ");\n"; 
    SCAD += "    pin_spacing = mm(" + pin_spacing.toFixed(3) + ");\n";
    SCAD += "    depth_inc = mm(" + depth_inc.toFixed(3) + ");\n";
    SCAD += "    fudge = 0.5;\n";
    SCAD += "    h_l = mm(1); h_w = mm(1); h_d = mm(1/16);\n";
    
    SCAD += "    difference() {\n";
    SCAD += "        // blade and key handle\n";
    SCAD += "        union() {\n";
    SCAD += "            translate([-h_l, -h_w/2 + width/2, 0]) rounded([h_l, h_w, thickness], mm(1/4));\n";
    SCAD += "            // cut a little off the tip to avoid going too long\n";
    SCAD += "            cube([length - mm(1/64), width, thickness]);\n";
    SCAD += "        }\n";
    SCAD += "        \n";
    SCAD += "        // chamfer the tip\n";
    SCAD += "        translate([length, mm(1/8), 0]) {\n";
    SCAD += "            rotate([0, 0, 45]) cube([10, 10, thickness]);\n";
    SCAD += "            rotate([0, 0, 225]) cube([10, 10, thickness]);\n";
    SCAD += "        }\n";
    SCAD += "        \n";
    SCAD += "        // put in a hole for keychain use\n";
    SCAD += "        translate([-h_l + mm(3/16), width/2, 0]) cylinder(h=thickness, r=mm(1/8));\n";
    SCAD += "        \n";
    SCAD += "        // cut the channels in the key. designed more for printability than accuracy\n";
    SCAD += "        union() {\n";
    SCAD += "            translate([-h_d, mm(.105), mm(.025)]) rotate([225, 0, 0]) cube([length + h_d, width, width]);\n";
    SCAD += "            translate([-h_d, mm(.105), mm(.05)]) rotate([260, 0, 0]) cube([length + h_d, thickness/2, mm(1/32)]);\n";
    SCAD += "            translate([-h_d, mm(.105), 0]) cube([length + h_d, mm(7/128), mm(.05)]);\n";
    SCAD += "            translate([-h_d, mm(.105) + mm(7/128), mm(.05)]) rotate([225, 0, 0]) cube([length + h_d, mm(3/64), thickness]);\n";
    SCAD += "        }\n";
    SCAD += "        \n";
    SCAD += "        translate([-h_d, width - mm(9/64), mm(.043)]) {\n";
    SCAD += "            cube([length + h_d, width - (width - mm(10/64)), thickness]);\n";
    SCAD += "            rotate([50, 0, 0]) cube([length + h_d, width, thickness]);\n";
    SCAD += "        }\n";
    SCAD += "        \n";
    SCAD += "        union() {\n";
    SCAD += "            translate([-h_d, mm(0.015), mm(.03)]) cube([length + h_d, mm(15/256), thickness]);\n";
    SCAD += "            translate([-h_d, mm(0.015) + mm(13/256), thickness - mm(1/64)]) rotate([45, 0, 0]) cube([length + h_d, mm(1/16), mm(1/16)]);\n";
    SCAD += "        }\n";
    SCAD += "        \n";
    SCAD += "        // Do the actual bitting\n";
    SCAD += "        for (b = [0:4]) {\n";
    SCAD += "            translate([shoulder + fudge + b*pin_spacing, width - mm(.008) - bits[b]*depth_inc - fudge, 0]) bit();\n";
    SCAD += "        }\n";
    SCAD += "    }\n";
    SCAD += "}\n";
    
    SCAD += "kw1(" + JSON.stringify(convertedBits) + ");\n";

    return SCAD;
}
// --- FŐ PROGRAM ---
function main() {
  
  // --- Képernyő ---
  var dw = display.width();
  var dh = display.height();
  var sprite = display.createSprite(dw, dh);
  
  // --- Színek ---
  var bg_color = display.color(255, 130, 0); 
  var fg_color = display.color(0, 0, 0);      

  // --- Adatok ---
  var cursor = 0;
  var code = [1, 1, 1, 1, 1, 1]; // 6 hely, de csak 5-öt használunk
  var maxDepth = 7; 

  // --- MENTÉS HELYE ---
  var CODE_FILE_PATH = "/KeyCopier/key_copier.code"; 
  var SCAD_FILE_PATH = "/KeyCopier/key_model.scad"; 

  var showMenu = false;
  var menuCursor = 0;
  var menuItems = ["Save", "Load", "Exit"];

  var statusMsg = "";
  var msgTimer = 0;

  keyboard.setLongPress(true);

  // --- GRAFIKAI PARAMÉTEREK (5 PIN VIZUALIZÁCIÓ) ---
  // Skálázáshoz használt valós értékek (mm)
  var PIN_COUNT_REAL = 6; 
  var DEPTH_INC_REAL = 0.58; 
  var PIN_SPACING_REAL = 3.81;
  var FIRST_PIN_START_X = 6.27;
  
  // Teljes hossz számítása a skálázáshoz
  var VISUAL_TOTAL_REAL_MM = FIRST_PIN_START_X + (PIN_COUNT_REAL - 1) * PIN_SPACING_REAL + PIN_SPACING_REAL; 
  
  var TANGENT = 0.84; 
  var PIN_HALF_WIDTH = 3; 
  var VISUAL_SCALE_FACTOR = 8; 
  var DEPTH_STEP = Math.round(DEPTH_INC_REAL * VISUAL_SCALE_FACTOR);
  
  var TOP_Y = 55;          
  var keySpineY = TOP_Y + 77; // Vastagság: 77 pixel
  var numY = 25; 
  var availableWidth = dw - 20;
  var scaleRatio = availableWidth / VISUAL_TOTAL_REAL_MM; 
    
  // A Tip rajzolásához szükséges fix pozíciók
  var X_GERINC_END_PX = 220; 
  var X_TIP_END_PX = 240;
  var Y_TIP_OFFSET = 35;
  var tipStartY = keySpineY - Y_TIP_OFFSET; 

  while (true) {
    
    if (msgTimer > 0) msgTimer--;
    if (msgTimer === 0) statusMsg = "";

    // --- BEMENET ---

    if (showMenu) {
        if (keyboard.getPrevPress(true)) showMenu = false;
        if (keyboard.getNextPress(true)) {
            menuCursor++;
            if (menuCursor >= menuItems.length) menuCursor = 0;
        }

        if (keyboard.getSelPress(true)) {
            if (menuCursor === 0) {
                // *** SAVE ***
                try {
                    var csvData = code.slice(0, 5).join(",");
                    var csvSuccess = storage.write(CODE_FILE_PATH, csvData, "write");
                    
                    var scadData = generateSCADScript(code); 
                    var scadSuccess = storage.write(SCAD_FILE_PATH, scadData, "write");
                    
                    if (csvSuccess && scadSuccess) statusMsg = "Saved & SCAD!";
                    else statusMsg = "Save Error";
                } catch (e) { statusMsg = "Sys Err"; }
                msgTimer = 30;
                showMenu = false; 
            } 
            else if (menuCursor === 1) {
                // *** LOAD (JAVÍTVA) ***
                var raw = undefined;
                var loaded = false;
                try { raw = storage.read(CODE_FILE_PATH); } catch (e) { statusMsg = "IO Err"; }
                
                if (raw !== undefined && raw !== null) {
                    try {
                        var str = String(raw).trim();
                        var lines = str.split("\n");
                        if (lines.length > 0) str = lines[lines.length-1]; 
                        var parts = str.split(",");
                        var tempCode = [];
                        for (var k = 0; k < parts.length; k++) {
                            var val = parseInt(parts[k].trim());
                            if (!isNaN(val)) tempCode.push(val);
                        }
                        
                        // JAVÍTÁS: For ciklus használata spread operátor helyett
                        if (tempCode.length >= 5) {
                            var startIdx = tempCode.length - 5;
                            for (var i = 0; i < 5; i++) {
                                code[i] = tempCode[startIdx + i];
                            }
                            statusMsg = "Loaded!";
                            loaded = true;
                        } else { statusMsg = "Bad Len"; }
                    } catch (e) { statusMsg = "Parse Err"; }
                    
                    if (!loaded && statusMsg === "") statusMsg = "Bad Data";
                } else { if (statusMsg === "") statusMsg = "No File"; }
                
                msgTimer = 30;
                showMenu = false; 
            } 
            else if (menuCursor === 2) { break; }
        }

    } else {
        // *** SZERKESZTŐ (5 PIN) ***
        if (keyboard.getPrevPress(true)) {
            showMenu = true;
            menuCursor = 0; 
        }
        if (keyboard.getSelPress(true)) {
           cursor++;
           if (cursor > 4) cursor = 0; // Csak 5 pin (0-4)
        }
        if (keyboard.getNextPress(true)) {
           code[cursor]++;
           if (code[cursor] > maxDepth) code[cursor] = 1;
        }
    }

    // --- RAJZOLÁS ---
    sprite.fill(bg_color); 
    sprite.setTextColor(fg_color, bg_color);

    sprite.setTextSize(2);
    sprite.drawText("Key Copier", 5, 2);
    
    // Számértékek (5 db)
    sprite.setTextSize(2);
    for(var i=0; i<5; i++) {
        var pinRealX = FIRST_PIN_START_X + (i * PIN_SPACING_REAL);
        var pinCenterX = 10 + Math.round(pinRealX * scaleRatio);
        
        var textStr = code[i].toString();
        
        if (i === cursor && !showMenu) {
            textStr = "[" + textStr + "]";
            sprite.drawText(textStr, pinCenterX - 14, numY); 
        } else {
            sprite.drawText(textStr, pinCenterX - 5, numY);
        }
    }

    // --- KERET RAJZOLÁSA ---
    
    // 1. Vízszintes alsó gerinc 220 px-ig
    sprite.drawLine(0, keySpineY, X_GERINC_END_PX, keySpineY, fg_color); 
    // 2. Függőleges nyak
    sprite.drawLine(0, keySpineY, 0, TOP_Y, fg_color); 
    
    // 3. FERDE KULCS VÉG (TIP) - Jobbra, felfelé
    sprite.drawLine(X_GERINC_END_PX, keySpineY, X_TIP_END_PX, tipStartY, fg_color); 
    
    // 4. A kulcs tetejének lezárása a Tip felett
    sprite.drawLine(X_GERINC_END_PX, TOP_Y, X_TIP_END_PX, TOP_Y, fg_color); 

    // --- KULCS PROFIL (5 PIN) ---
    var startDrawX = 10; // X eltolás a rajzoláshoz

    for(var j=0; j<5; j++) {
        var pinRealX = FIRST_PIN_START_X + (j * PIN_SPACING_REAL);
        var cx = startDrawX + Math.round(pinRealX * scaleRatio);
        
        var currentDepthPx = (code[j] - 1) * DEPTH_STEP;
        var bottomY = TOP_Y + currentDepthPx; 

        // Pin alja
        sprite.drawLine(cx - PIN_HALF_WIDTH, bottomY, cx + PIN_HALF_WIDTH, bottomY, fg_color);

        // Bal oldali kapcsolat (Előző pinhez vagy elejéhez)
        var prevDepthPx = 0;
        var prevCx = 0;
        if (j > 0) {
            prevDepthPx = (code[j-1] - 1) * DEPTH_STEP;
            var prevPinRealX = FIRST_PIN_START_X + (j-1) * PIN_SPACING_REAL;
            prevCx = startDrawX + Math.round(prevPinRealX * scaleRatio);
        }
        
        var myLeftWidth = PIN_HALF_WIDTH + (currentDepthPx * TANGENT);
        var prevRightWidth = PIN_HALF_WIDTH + (prevDepthPx * TANGENT);
        var distToPrev = (j === 0) ? 999 : (cx - prevCx); 

        if (j === 0) {
            // Első pin eleje
            var slopeEndX = cx - myLeftWidth;
            if (slopeEndX < 0) slopeEndX = 0;
            sprite.drawLine(cx - PIN_HALF_WIDTH, bottomY, slopeEndX, TOP_Y, fg_color);
            if (slopeEndX > 0) sprite.drawLine(0, TOP_Y, slopeEndX, TOP_Y, fg_color);
        } else {
            // Csatlakozás az előző pinhez
            if ((myLeftWidth + prevRightWidth) > distToPrev) {
                var ratio = currentDepthPx / (currentDepthPx + prevDepthPx);
                if (currentDepthPx + prevDepthPx === 0) ratio = 0.5;
                var peakDistX = ratio * distToPrev; 
                var peakX = cx - peakDistX;
                var peakY = bottomY - ((peakDistX - PIN_HALF_WIDTH) / TANGENT);
                sprite.drawLine(cx - PIN_HALF_WIDTH, bottomY, peakX, peakY, fg_color);
            } else {
                var slopeTopX = cx - myLeftWidth;
                sprite.drawLine(cx - PIN_HALF_WIDTH, bottomY, slopeTopX, TOP_Y, fg_color);
                var prevSlopeTopX = prevCx + prevRightWidth;
                sprite.drawLine(prevSlopeTopX, TOP_Y, slopeTopX, TOP_Y, fg_color);
            }
        }

        // Jobb oldali kapcsolat (Következő pinhez VAGY Tiphez)
        var myRightWidth = PIN_HALF_WIDTH + (currentDepthPx * TANGENT);

        if (j === 4) {
            // ** UTOLSÓ PIN (5.) LEZÁRÁSA **
            // Ez volt a vizuális hiba forrása. Most fixen a gerinc végéig húzzuk.
            var slopeEndX = cx + myRightWidth;
            
            // Felfelé húzzuk a vonalat a kulcs tetejéig (TOP_Y)
            sprite.drawLine(cx + PIN_HALF_WIDTH, bottomY, slopeEndX, TOP_Y, fg_color);
            
            // Onnan pedig vízszintesen a Tip kezdetéig (X_GERINC_END_PX)
            // (Ha a slopeEndX túlmegy, akkor nem rajzolunk visszafelé)
            if (slopeEndX < X_GERINC_END_PX) {
                sprite.drawLine(slopeEndX, TOP_Y, X_GERINC_END_PX, TOP_Y, fg_color);
            }
            
        } else {
            // Normál köztes pin kapcsolat (j < 4)
            var nextDepthPx = (code[j+1] - 1) * DEPTH_STEP;
            var nextPinRealX = FIRST_PIN_START_X + (j+1) * PIN_SPACING_REAL;
            var nextCx = startDrawX + Math.round(nextPinRealX * scaleRatio);
            
            var nextLeftWidth = PIN_HALF_WIDTH + (nextDepthPx * TANGENT);
            var distToNext = nextCx - cx;

            if ((myRightWidth + nextLeftWidth) > distToNext) {
                var ratio = currentDepthPx / (currentDepthPx + nextDepthPx);
                if (currentDepthPx + nextDepthPx === 0) ratio = 0.5;
                var peakDistX = ratio * distToNext; 
                var myPeakDistX = distToNext - peakDistX;
                var peakX = cx + myPeakDistX;
                var peakY = bottomY - ((myPeakDistX - PIN_HALF_WIDTH) / TANGENT);
                sprite.drawLine(cx + PIN_HALF_WIDTH, bottomY, peakX, peakY, fg_color);
            } else {
                var slopeTopX = cx + myRightWidth;
                sprite.drawLine(cx + PIN_HALF_WIDTH, bottomY, slopeTopX, TOP_Y, fg_color);
            }
        }
    }
    
    // --- Menü ---
    if (showMenu) {
        var menuW = 80;
        var menuH = 55;
        var menuX = (dw - menuW) / 2;
        var menuY = (dh - menuH) / 2;

        sprite.drawFillRect(menuX, menuY, menuW, menuH, fg_color);
        sprite.drawLine(menuX, menuY, menuX + menuW, menuY, bg_color); 
        sprite.drawLine(menuX, menuY + menuH, menuX + menuW, menuY + menuH, bg_color);
        sprite.drawLine(menuX, menuY, menuX, menuY + menuH, bg_color);
        sprite.drawLine(menuX + menuW, menuY, menuX + menuW, menuY + menuH, bg_color);

        sprite.setTextSize(1);
        sprite.setTextColor(bg_color, fg_color);

        for (var m = 0; m < menuItems.length; m++) {
            var itemY = menuY + 12 + (m * 12);
            var itemText = menuItems[m];
            if (m === menuCursor) itemText = "> " + itemText + " <";
            sprite.drawText(itemText, menuX + 15, itemY);
        }
    } 
    
    // --- Üzenet ---
    if (statusMsg !== "") {
        var msgH = 20;
        sprite.drawFillRect(0, dh - msgH, dw, msgH, fg_color); 
        sprite.drawLine(0, dh - msgH, dw, dh - msgH, bg_color); 
        sprite.setTextColor(bg_color, fg_color);
        sprite.setTextSize(1);
        sprite.drawText(statusMsg, (dw/2) - (statusMsg.length*3), dh - 15);
    }
    else if (!showMenu) {
        sprite.setTextSize(1);
        sprite.drawText("Back: Menu | Next: Cut", 5, dh - 12);
    }

    sprite.pushSprite();
    delay(50);
  }
  
  keyboard.setLongPress(false);
}

main();
