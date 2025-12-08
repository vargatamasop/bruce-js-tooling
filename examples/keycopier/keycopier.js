// KEY COPIER PROGRAM
// By VARGA TAMAS


var display = require('display');
var keyboard = require('keyboard');
var storage = require('storage');

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
  var code = [1, 1, 1, 1, 1, 1]; 
  var maxDepth = 7; 

  // --- MENTÉS HELYE ---
  var FILE_PATH = "/KeyCopier/key_copier.code"; 

  var showMenu = false;
  var menuCursor = 0;
  var menuItems = ["Save", "Load", "Exit"];

  var statusMsg = "";
  var msgTimer = 0;

  keyboard.setLongPress(true);

  // --- GRAFIKA ---
  var TANGENT = 0.84; 
  var PIN_HALF_WIDTH = 3; 
  var DEPTH_STEP = 4;     
  var numY = 25; 
  var TOP_Y = 55;         
  var keySpineY = 95;     

  while (true) {
    
    if (msgTimer > 0) msgTimer--;
    if (msgTimer === 0) statusMsg = "";

    // --- BEMENET ---

    if (showMenu) {
        // *** MENÜ ***
        if (keyboard.getPrevPress(true)) showMenu = false;

        if (keyboard.getNextPress(true)) {
            menuCursor++;
            if (menuCursor >= menuItems.length) menuCursor = 0;
        }

        if (keyboard.getSelPress(true)) {
            if (menuCursor === 0) {
                // **********************************
                // *** SAVE (FELÜLÍRÁS "write" MÓDDAL) ***
                // **********************************
                try {
                    // CSV formátum
                    var csvData = code.join(",");
                    
                    // JAVÍTÁS: Itt adjuk át a "write" paramétert!
                    // Ez biztosítja, hogy felülírja a fájlt, ne hozzáfűzzön.
                    var success = storage.write(FILE_PATH, csvData, "write");
                    
                    if (success) statusMsg = "Saved!";
                    else statusMsg = "Write: False";

                } catch (e) {
                    statusMsg = "Sys Err";
                }
                msgTimer = 30;
                showMenu = false; 
            } 
            else if (menuCursor === 1) {
                // **********************************
                // *** LOAD (BETÖLTÉS) ***
                // **********************************
                var raw = undefined;
                var loaded = false;

                try {
                    // Közvetlen olvasás
                    raw = storage.read(FILE_PATH);
                } catch (e) {
                    statusMsg = "IO Err"; 
                }

                if (raw !== undefined && raw !== null) {
                    try {
                        var str = String(raw).trim();
                        // Ha esetleg maradtak benne sortörések, csak az első sort vesszük
                        // Ez extra védelem, ha régebben appendelt fájlt olvasunk be
                        var lines = str.split("\n");
                        if (lines.length > 0) str = lines[lines.length-1]; // Az utolsó sort vesszük (a legfrissebbet)

                        var parts = str.split(",");
                        
                        var tempCode = [];
                        for (var k = 0; k < parts.length; k++) {
                            var val = parseInt(parts[k].trim());
                            if (!isNaN(val)) tempCode.push(val);
                        }

                        // Mivel lehet, hogy a fájlban több sor van (a régi hibás mentések miatt),
                        // csak az utolsó 6 számot vesszük figyelembe, ha több lenne.
                        if (tempCode.length >= 6) {
                            // Az utolsó 6 elemet töltjük be
                            var startIdx = tempCode.length - 6;
                            code = tempCode.slice(startIdx, startIdx + 6);
                            statusMsg = "Loaded!";
                            loaded = true;
                        } else {
                            statusMsg = "Bad Len";
                        }
                    } catch (e) {
                        statusMsg = "Parse Err";
                    }
                    
                    if (!loaded && statusMsg === "") statusMsg = "Bad Data";

                } else {
                    if (statusMsg === "") statusMsg = "No File";
                }
                
                msgTimer = 30;
                showMenu = false; 
            } 
            else if (menuCursor === 2) {
                break; // Exit
            }
        }

    } else {
        // *** SZERKESZTŐ ***
        if (keyboard.getPrevPress(true)) {
            showMenu = true;
            menuCursor = 0; 
        }
        if (keyboard.getSelPress(true)) {
           cursor++;
           if (cursor > 5) cursor = 0;
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
    
    var availableWidth = dw - 20; 
    var pinSpacing = Math.floor(availableWidth / 6);
    var startX = 10;

    sprite.setTextSize(2);
    for(var i=0; i<6; i++) {
        var pinCenterX = startX + (i * pinSpacing) + (pinSpacing/2);
        var textStr = code[i].toString();
        
        if (i === cursor && !showMenu) {
            textStr = "[" + textStr + "]";
            sprite.drawText(textStr, pinCenterX - 14, numY); 
        } else {
            sprite.drawText(textStr, pinCenterX - 5, numY);
        }
    }

    var keyEnd = dw - 5;
    sprite.drawLine(0, keySpineY, keyEnd, keySpineY, fg_color);
    sprite.drawLine(0, keySpineY, 0, TOP_Y, fg_color);
    sprite.drawLine(keyEnd, keySpineY, keyEnd, TOP_Y + 10, fg_color);

    for(var j=0; j<6; j++) {
        var cx = startX + (j * pinSpacing) + (pinSpacing/2); 
        var currentDepthPx = (code[j] - 1) * DEPTH_STEP;
        var bottomY = TOP_Y + currentDepthPx; 

        sprite.drawLine(cx - PIN_HALF_WIDTH, bottomY, cx + PIN_HALF_WIDTH, bottomY, fg_color);

        var prevDepthPx = 0;
        if (j > 0) prevDepthPx = (code[j-1] - 1) * DEPTH_STEP;
        var myLeftWidth = PIN_HALF_WIDTH + (currentDepthPx * TANGENT);
        var prevRightWidth = PIN_HALF_WIDTH + (prevDepthPx * TANGENT);
        var distToPrev = (j === 0) ? 999 : pinSpacing; 

        if (j === 0) {
            var slopeEndX = cx - myLeftWidth;
            if (slopeEndX < 0) slopeEndX = 0;
            sprite.drawLine(cx - PIN_HALF_WIDTH, bottomY, slopeEndX, TOP_Y, fg_color);
            if (slopeEndX > 0) sprite.drawLine(0, TOP_Y, slopeEndX, TOP_Y, fg_color);
        } else {
            if ((myLeftWidth + prevRightWidth) > distToPrev) {
                var ratio = currentDepthPx / (currentDepthPx + prevDepthPx);
                if (currentDepthPx + prevDepthPx === 0) ratio = 0.5;
                var peakDistX = ratio * distToPrev; 
                var peakX = cx - peakDistX;
                var rise = (peakDistX - PIN_HALF_WIDTH) / TANGENT;
                var peakY = bottomY - rise;
                sprite.drawLine(cx - PIN_HALF_WIDTH, bottomY, peakX, peakY, fg_color);
            } else {
                var slopeTopX = cx - myLeftWidth;
                sprite.drawLine(cx - PIN_HALF_WIDTH, bottomY, slopeTopX, TOP_Y, fg_color);
                var prevCx = cx - pinSpacing;
                var prevSlopeTopX = prevCx + prevRightWidth;
                sprite.drawLine(prevSlopeTopX, TOP_Y, slopeTopX, TOP_Y, fg_color);
            }
        }

        var nextDepthPx = 0;
        if (j < 5) nextDepthPx = (code[j+1] - 1) * DEPTH_STEP;
        var myRightWidth = PIN_HALF_WIDTH + (currentDepthPx * TANGENT);
        var nextLeftWidth = PIN_HALF_WIDTH + (nextDepthPx * TANGENT);
        var distToNext = (j === 5) ? 999 : pinSpacing;

        if (j === 5) {
            var slopeEndX = cx + myRightWidth;
            sprite.drawLine(cx + PIN_HALF_WIDTH, bottomY, slopeEndX, TOP_Y, fg_color);
            sprite.drawLine(slopeEndX, TOP_Y, keyEnd, TOP_Y, fg_color);
        } else {
            if ((myRightWidth + nextLeftWidth) > distToNext) {
                var ratio = currentDepthPx / (currentDepthPx + nextDepthPx);
                if (currentDepthPx + nextDepthPx === 0) ratio = 0.5;
                var peakDistX = ratio * distToNext; 
                var myPeakDistX = distToNext - peakDistX;
                var peakX = cx + myPeakDistX;
                var rise = (myPeakDistX - PIN_HALF_WIDTH) / TANGENT;
                var peakY = bottomY - rise;
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
