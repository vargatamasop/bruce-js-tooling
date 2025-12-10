var display = require('display');
var keyboard = require('keyboard');
var storage = require('storage');

// ===================================================================================
// 1. TELJES KULCS ADATBÁZIS (Bővítve: Elzett & JMA/Universal & Rittal)
// ===================================================================================
var KEY_DB = [
    { manufacturer: "Elzett", format_name: "751 (Euro)", pin_num: 5, first_pin_inch: 0.177, last_pin_inch: 0.807, pin_increment_inch: 0.1575, pin_width_inch: 0.039, elbow_inch: 0.118, drill_angle: 90, uncut_depth_inch: 0.338, deepest_depth_inch: 0.197, depth_step_inch: 0.0197, min_depth_ind: 1, max_depth_ind: 6 },
    { manufacturer: "Universal", format_name: "JMA / Euro", pin_num: 5, first_pin_inch: 0.157, last_pin_inch: 0.787, pin_increment_inch: 0.1575, pin_width_inch: 0.039, elbow_inch: 0.118, drill_angle: 90, uncut_depth_inch: 0.335, deepest_depth_inch: 0.197, depth_step_inch: 0.020, min_depth_ind: 1, max_depth_ind: 6 },
    { manufacturer: "Rittal", format_name: "3524 E", pin_num: 4, first_pin_inch: 0.138, last_pin_inch: 0.650, pin_increment_inch: 0.138, pin_width_inch: 0.060, elbow_inch: 0.100, drill_angle: 90, uncut_depth_inch: 0.331, deepest_depth_inch: 0.177, depth_step_inch: 0.031, min_depth_ind: 1, max_depth_ind: 5 },
    { manufacturer: "Kwikset", format_name: "KW1", first_pin_inch: 0.247, last_pin_inch: 0.847, pin_increment_inch: 0.15, pin_num: 5, pin_width_inch: 0.084, elbow_inch: 0.15, drill_angle: 90, uncut_depth_inch: 0.329, deepest_depth_inch: 0.191, depth_step_inch: 0.023, min_depth_ind: 1, max_depth_ind: 7 },
    { manufacturer: "Schlage", format_name: "SC4", first_pin_inch: 0.231, last_pin_inch: 1.012, pin_increment_inch: 0.1562, pin_num: 6, pin_width_inch: 0.031, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.335, deepest_depth_inch: 0.2, depth_step_inch: 0.015, min_depth_ind: 0, max_depth_ind: 9 },
    { manufacturer: "Yale", format_name: "Y11", first_pin_inch: 0.124, last_pin_inch: 0.502, pin_increment_inch: 0.095, pin_num: 5, pin_width_inch: 0.039, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.246, deepest_depth_inch: 0.167, depth_step_inch: 0.020, min_depth_ind: 1, max_depth_ind: 5 },
    { manufacturer: "Yale", format_name: "Y2", first_pin_inch: 0.200, last_pin_inch: 1.025, pin_increment_inch: 0.165, pin_num: 6, pin_width_inch: 0.054, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.320, deepest_depth_inch: 0.149, depth_step_inch: 0.019, min_depth_ind: 0, max_depth_ind: 9 },
    { manufacturer: "Master Lock", format_name: "M1", first_pin_inch: 0.185, last_pin_inch: 0.689, pin_increment_inch: 0.126, pin_num: 5, pin_width_inch: 0.039, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.276, deepest_depth_inch: 0.171, depth_step_inch: 0.015, min_depth_ind: 0, max_depth_ind: 7 },
    { manufacturer: "Arrow", format_name: "AR4", first_pin_inch: 0.265, last_pin_inch: 1.040, pin_increment_inch: 0.155, pin_num: 6, pin_width_inch: 0.060, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.312, deepest_depth_inch: 0.186, depth_step_inch: 0.014, min_depth_ind: 0, max_depth_ind: 9 },
    { manufacturer: "American", format_name: "AM7", first_pin_inch: 0.157, last_pin_inch: 0.781, pin_increment_inch: 0.125, pin_num: 6, pin_width_inch: 0.039, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.283, deepest_depth_inch: 0.173, depth_step_inch: 0.016, min_depth_ind: 1, max_depth_ind: 8 },
    { manufacturer: "Sargent", format_name: "S22", first_pin_inch: 0.216, last_pin_inch: 0.996, pin_increment_inch: 0.156, pin_num: 6, pin_width_inch: 0.063, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.328, deepest_depth_inch: 0.148, depth_step_inch: 0.020, min_depth_ind: 1, max_depth_ind: 10 },
    { manufacturer: "Corbin", format_name: "CO88", first_pin_inch: 0.250, last_pin_inch: 1.030, pin_increment_inch: 0.156, pin_num: 6, pin_width_inch: 0.047, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.343, deepest_depth_inch: 0.217, depth_step_inch: 0.014, min_depth_ind: 1, max_depth_ind: 10 },
    { manufacturer: "Lockwood", format_name: "LW4", first_pin_inch: 0.245, last_pin_inch: 0.870, pin_increment_inch: 0.1562, pin_num: 5, pin_width_inch: 0.031, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.344, deepest_depth_inch: 0.203, depth_step_inch: 0.014, min_depth_ind: 0, max_depth_ind: 9 },
    { manufacturer: "Lockwood", format_name: "LW5", first_pin_inch: 0.245, last_pin_inch: 1.0262, pin_increment_inch: 0.1562, pin_num: 6, pin_width_inch: 0.031, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.344, deepest_depth_inch: 0.203, depth_step_inch: 0.014, min_depth_ind: 0, max_depth_ind: 9 },
    { manufacturer: "National", format_name: "NA12", first_pin_inch: 0.150, last_pin_inch: 0.710, pin_increment_inch: 0.140, pin_num: 5, pin_width_inch: 0.039, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.270, deepest_depth_inch: 0.157, depth_step_inch: 0.013, min_depth_ind: 0, max_depth_ind: 9 },
    { manufacturer: "National", format_name: "NA25", first_pin_inch: 0.250, last_pin_inch: 0.874, pin_increment_inch: 0.156, pin_num: 5, pin_width_inch: 0.039, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.304, deepest_depth_inch: 0.191, depth_step_inch: 0.012, min_depth_ind: 0, max_depth_ind: 9 },
    { manufacturer: "Russwin", format_name: "RU45", first_pin_inch: 0.250, last_pin_inch: 1.030, pin_increment_inch: 0.156, pin_num: 6, pin_width_inch: 0.053, elbow_inch: 0.1, drill_angle: 90, uncut_depth_inch: 0.343, deepest_depth_inch: 0.203, depth_step_inch: 0.028, min_depth_ind: 1, max_depth_ind: 6 },
    { manufacturer: "Weiser", format_name: "WR3", first_pin_inch: 0.237, last_pin_inch: 0.861, pin_increment_inch: 0.156, pin_num: 5, pin_width_inch: 0.090, elbow_inch: 0.150, drill_angle: 90, uncut_depth_inch: 0.315, deepest_depth_inch: 0.153, depth_step_inch: 0.018, min_depth_ind: 0, max_depth_ind: 10 }
];

// ==========================================
// 2. SCAD GENERÁLÁS (TEMPLATE ALAPÚ)
// ==========================================
function generateSCAD(keyCodes, format) {
    var bits = [];
    for(var i=0; i<format.pin_num; i++) {
        bits.push(keyCodes[i]);
    }

    var scad = "";
    scad += "// Generated by KeyCopier for " + format.manufacturer + " " + format.format_name + "\n";
    scad += "function mm(i) = i*25.4;\n\n";

    scad += "module rounded(size, r) { union() { translate([r, 0, 0]) cube([size[0]-2*r, size[1], size[2]]); translate([0, r, 0]) cube([size[0], size[1]-2*r, size[2]]); translate([r, r, 0]) cylinder(h=size[2], r=r, $fn=16); translate([size[0]-r, r, 0]) cylinder(h=size[2], r=r, $fn=16); translate([r, size[1]-r, 0]) cylinder(h=size[2], r=r, $fn=16); translate([size[0]-r, size[1]-r, 0]) cylinder(h=size[2], r=r, $fn=16); } }\n";
    
    scad += "module bit() { w = mm(1/4); difference() { translate([-w/2, 0, 0]) cube([w, mm(1), w]); translate([-mm(5/128), 0, 0]) rotate([0, 0, 135]) cube([w, w, w]); translate([mm(5/128), 0, 0]) rotate([0, 0, -45]) cube([w, w, w]); } }\n";

    scad += "module key(bits) {\n";
    scad += "    thickness = mm(0.080);\n";
    var len = format.last_pin_inch + format.elbow_inch;
    scad += "    length = mm(" + len.toFixed(3) + ");\n";
    scad += "    width = mm(" + format.uncut_depth_inch.toFixed(3) + ");\n";
    scad += "    shoulder = mm(" + format.first_pin_inch.toFixed(3) + ");\n";
    scad += "    pin_spacing = mm(" + format.pin_increment_inch.toFixed(3) + ");\n";
    scad += "    depth_inc = mm(" + format.depth_step_inch.toFixed(3) + ");\n";
    scad += "    fudge = 0.5;\n";
    scad += "    h_l = mm(1); h_w = mm(1); h_d = mm(1/16);\n";
    
    scad += "    difference() {\n";
    scad += "        union() { translate([-h_l, -h_w/2 + width/2, 0]) rounded([h_l, h_w, thickness], mm(1/4)); cube([length - mm(1/64), width, thickness]); }\n";
    scad += "        translate([length, mm(1/8), 0]) { rotate([0, 0, 45]) cube([10, 10, thickness]); rotate([0, 0, 225]) cube([10, 10, thickness]); }\n";
    scad += "        translate([-h_l + mm(3/16), width/2, 0]) cylinder(h=thickness, r=mm(1/8), $fn=16);\n";
    scad += "        union() { translate([-h_d, mm(.105), mm(.025)]) rotate([225, 0, 0]) cube([length + h_d, width, width]); translate([-h_d, mm(.105), mm(.05)]) rotate([260, 0, 0]) cube([length + h_d, thickness/2, mm(1/32)]); translate([-h_d, mm(.105), 0]) cube([length + h_d, mm(7/128), mm(.05)]); translate([-h_d, mm(.105) + mm(7/128), mm(.05)]) rotate([225, 0, 0]) cube([length + h_d, mm(3/64), thickness]); }\n";
    scad += "        translate([-h_d, width - mm(9/64), mm(.043)]) { cube([length + h_d, width - (width - mm(10/64)), thickness]); rotate([50, 0, 0]) cube([length + h_d, width, thickness]); }\n";
    scad += "        union() { translate([-h_d, mm(0.015), mm(.03)]) cube([length + h_d, mm(15/256), thickness]); translate([-h_d, mm(0.015) + mm(13/256), thickness - mm(1/64)]) rotate([45, 0, 0]) cube([length + h_d, mm(1/16), mm(1/16)]); }\n";
    
    scad += "        for (b = [0:" + (format.pin_num - 1) + "]) {\n";
    scad += "            translate([shoulder + fudge + b*pin_spacing, width - mm(.008) - (bits[b] - " + format.min_depth_ind + ")*depth_inc - fudge, 0]) bit();\n";
    scad += "        }\n";
    scad += "    }\n";
    scad += "}\n\n";
    
    scad += "key(" + JSON.stringify(bits) + ");\n";
    return scad;
}

// ==========================================
// 3. FŐ PROGRAM
// ==========================================
function main() {
  var dw = display.width();
  var dh = display.height();
  var sprite = display.createSprite(dw, dh);
  
  var bg_color = display.color(255, 130, 0); 
  var fg_color = display.color(0, 0, 0);

  // Állapotváltozók
  var currentKeyIdx = 0; 
  var cursor = 0;        
  var code = [0,0,0,0,0,0,0,0,0,0]; 
  
  function initCodeForFormat(idx) {
      var fmt = KEY_DB[idx];
      for(var i=0; i<10; i++) code[i] = fmt.min_depth_ind;
      cursor = 0;
  }
  initCodeForFormat(0);

  var CODE_FILE = "/KeyCopier/data.code";
  var SCAD_FILE = "/KeyCopier/model.scad";

  var MODE_EDIT = 0;
  var MODE_MENU = 1;
  var mode = MODE_EDIT;
  var menuCursor = 0;
  var menuItems = ["Save", "Load", "Change Type", "Exit"];
  
  var statusMsg = "";
  var msgTimer = 0;

  keyboard.setLongPress(true);

  while (true) {
    if (msgTimer > 0) msgTimer--;
    if (msgTimer === 0) statusMsg = "";
    
    var format = KEY_DB[currentKeyIdx];

    // --- BEMENET KEZELÉS ---
    if (mode === MODE_MENU) {
        if (keyboard.getPrevPress(true)) mode = MODE_EDIT;
        if (keyboard.getNextPress(true)) {
            menuCursor++;
            if (menuCursor >= menuItems.length) menuCursor = 0;
        }
        
        if (keyboard.getSelPress(true)) {
            if (menuCursor === 0) { // SAVE
                try {
                    var saveArr = code.slice(0, format.pin_num);
                    saveArr.push(currentKeyIdx); 
                    var csvData = saveArr.join(",");
                    storage.write(CODE_FILE, csvData, "write");
                    var scadContent = generateSCAD(code, format);
                    storage.write(SCAD_FILE, scadContent, "write");
                    statusMsg = "Saved!";
                } catch(e) { statusMsg = "Err"; }
                msgTimer = 30; mode = MODE_EDIT;
            }
            else if (menuCursor === 1) { // LOAD
                try {
                    var raw = storage.read(CODE_FILE);
                    if (raw) {
                        var str = String(raw).trim();
                        var parts = str.split(",");
                        if (parts.length > 1) {
                            var savedIdx = parseInt(parts[parts.length-1]);
                            if (!isNaN(savedIdx) && savedIdx < KEY_DB.length) {
                                currentKeyIdx = savedIdx;
                                format = KEY_DB[currentKeyIdx];
                                initCodeForFormat(currentKeyIdx); 
                                parts.pop();
                            }
                        }
                        for(var i=0; i<format.pin_num; i++) {
                            if (i < parts.length) code[i] = parseInt(parts[i]);
                        }
                        statusMsg = "Loaded!";
                    }
                } catch(e) { statusMsg = "IO Err"; }
                msgTimer = 30; mode = MODE_EDIT;
            }
            else if (menuCursor === 2) { // TYPE
                currentKeyIdx++;
                if (currentKeyIdx >= KEY_DB.length) currentKeyIdx = 0;
                initCodeForFormat(currentKeyIdx);
                
                // Rittal Auto-Set
                if (KEY_DB[currentKeyIdx].manufacturer === "Rittal") {
                    code[0] = 3; code[1] = 5; code[2] = 2; code[3] = 4;
                    statusMsg = "Auto: Rittal 3524";
                } else {
                    statusMsg = "Type: " + KEY_DB[currentKeyIdx].format_name;
                }
                msgTimer = 30;
            }
            else if (menuCursor === 3) { break; }
        }
    } 
    else {
        // *** EDIT ***
        if (keyboard.getPrevPress(true)) { mode = MODE_MENU; menuCursor = 0; }
        if (keyboard.getSelPress(true)) {
           cursor++;
           if (cursor >= format.pin_num) cursor = 0;
        }
        if (keyboard.getNextPress(true)) {
           code[cursor]++;
           if (code[cursor] > format.max_depth_ind) code[cursor] = format.min_depth_ind;
        }
    }

    // --- RAJZOLÁS ---
    sprite.fill(bg_color); 
    sprite.setTextColor(fg_color, bg_color);
    
    sprite.setTextSize(1);
    sprite.drawText(format.manufacturer + " " + format.format_name, 2, 2);

    // --- SKÁLÁZÁS ---
    var shoulderX = 0; 
    var spineY = dh - 20; // Gerinc alul
    
    var maxDisplayWidth = dw; 
    var keyTotalLenInch = format.last_pin_inch + format.elbow_inch;
    var ppi = maxDisplayWidth / (keyTotalLenInch + 0.1);
    
    var bladeHeightPx = format.uncut_depth_inch * ppi;
    var topY = spineY - bladeHeightPx;
    
    // Gerinc és Váll
    var keyEndPx = keyTotalLenInch * ppi;
    sprite.drawLine(shoulderX, spineY, Math.round(keyEndPx), spineY, fg_color);
    sprite.drawLine(shoulderX, spineY, shoulderX, Math.round(topY), fg_color);
    
    var lastY = topY; 
    
    // --- MARÁS SZIMULÁCIÓ ---
    for (var x = 0; x <= keyEndPx; x++) {
        var maxY = topY; 
        
        for (var i = 0; i < format.pin_num; i++) {
            var pinCenterInch = format.first_pin_inch + (i * format.pin_increment_inch);
            var pinCenterPx = pinCenterInch * ppi;
            
            var depthInd = code[i] - format.min_depth_ind;
            var cutDepthInch = depthInd * format.depth_step_inch;
            var cutDepthPx = cutDepthInch * ppi;
            var cutBottomY = topY + cutDepthPx;
            
            var halfFlatW = (format.pin_width_inch * ppi) / 2;
            var dist = Math.abs(x - pinCenterPx);
            
            var thisY = topY; 
            
            if (dist <= halfFlatW) {
                thisY = cutBottomY;
            } else {
                var rise = dist - halfFlatW; 
                thisY = cutBottomY - rise;
            }
            
            if (thisY > maxY) maxY = thisY;
        }
        
        if (maxY > spineY) maxY = spineY;
        
        if (x > 0) {
            sprite.drawLine(x - 1, Math.round(lastY), x, Math.round(maxY), fg_color);
        }
        lastY = maxY;
    }
    
    // Tip lezárása
    sprite.drawLine(Math.round(keyEndPx), Math.round(lastY), Math.round(keyEndPx), spineY, fg_color);

    // Számok kiírása (JAVÍTVA: Soha nem megy ki a képből)
    sprite.setTextSize(2);
    for(var i=0; i<format.pin_num; i++) {
        var pinCenterInch = format.first_pin_inch + (i * format.pin_increment_inch);
        var pinCenterPx = pinCenterInch * ppi;
        
        var s = code[i].toString();
        if (i === cursor && mode === MODE_EDIT) s = "["+s+"]";
        
        // JAVÍTÁS: Minimum 15 pixelre legyen a tetőtől, hogy látszódjon
        var textY = Math.max(15, Math.round(topY) - 20);
        sprite.drawText(s, Math.round(pinCenterPx) - 5, textY);
    }

    // Menu
    if (mode === MODE_MENU) {
        var mw = 120; var mh = 70; 
        var mx = (dw-mw)/2; var my = (dh-mh)/2;
        sprite.drawFillRect(mx, my, mw, mh, fg_color);
        sprite.setTextColor(bg_color, fg_color);
        sprite.setTextSize(1);
        for(var m=0; m<menuItems.length; m++) {
            var s = menuItems[m];
            if (m === menuCursor) s = "> " + s;
            sprite.drawText(s, mx+10, my+10 + (m*15));
        }
    }
    
    if (statusMsg !== "") {
        sprite.drawFillRect(0, dh-20, dw, 20, fg_color);
        sprite.setTextColor(bg_color, fg_color);
        sprite.drawText(statusMsg, 5, dh-15);
    }

    sprite.pushSprite();
    delay(50);
  }
}

main();
