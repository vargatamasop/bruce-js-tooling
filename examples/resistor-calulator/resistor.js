var display = require('display');
var keyboard = require('keyboard');
var storage = require('storage');

function main() {
  
  // --- KÉPERNYŐ ---
  var dw = display.width();
  var dh = display.height();
  var sprite = display.createSprite(dw, dh);
  
  // --- SZÍNEK (R, G, B formátum 0-255) ---
  var C_BLACK  = display.color(0, 0, 0);
  var C_BROWN  = display.color(165, 42, 42);   
  var C_RED    = display.color(255, 0, 0);     
  var C_ORANGE = display.color(255, 165, 0);   
  var C_YELLOW = display.color(255, 255, 0);   
  var C_GREEN  = display.color(0, 255, 0);     
  var C_BLUE   = display.color(0, 0, 255);     
  var C_VIOLET = display.color(255, 0, 255);   
  var C_GRAY   = display.color(128, 128, 128); 
  var C_WHITE  = display.color(255, 255, 255); 
  
  var C_GOLD   = display.color(255, 215, 0);   
  var C_SILVER = display.color(192, 192, 192); 
  
  var C_BG      = C_BLACK; 
  var C_TXT     = C_WHITE; 

  // Sáv színek (0-9)
  var bandColors = [
      C_BLACK, C_BROWN, C_RED, C_ORANGE, C_YELLOW, 
      C_GREEN, C_BLUE, C_VIOLET, C_GRAY, C_WHITE
  ];

  var txtColors = [
      C_WHITE, C_WHITE, C_WHITE, C_BLACK, C_BLACK,
      C_BLACK, C_WHITE, C_WHITE, C_WHITE, C_BLACK
  ];

  var multColors = bandColors.concat([C_GOLD, C_SILVER]);
  
  var multLabels = [
      "x1", "x10", "x100", "x1K", "x10K", 
      "x100K", "x1M", "x10M", "x100M", "x1G", 
      "x0.1", "x0.01"
  ];

  var tolColors = [C_BROWN, C_RED, C_GOLD, C_SILVER];
  var tolValues = ["1%", "2%", "5%", "10%"];

  // --- Adatok ---
  var band1 = 1; 
  var band2 = 0; 
  var mult  = 2; 
  var tol   = 2; 
  
  var focus = 0; 
  var FILE_PATH = "/data/resistor.txt";

  // Betöltés
  try {
      if (storage.exists(FILE_PATH)) {
          var raw = storage.read(FILE_PATH);
          if (raw) {
              var parts = String(raw).trim().split(",");
              if (parts.length === 4) {
                  band1 = parseInt(parts[0]);
                  band2 = parseInt(parts[1]);
                  mult = parseInt(parts[2]);
                  tol = parseInt(parts[3]);
              }
          }
      }
  } catch(e) {}

  keyboard.setLongPress(true); 

  // --- FÜGGVÉNYEK ---

  function formatResistor(val) {
      if (val < 1) return val.toFixed(2);
      if (val < 10) return val.toFixed(1);
      if (val >= 1000000000) return (val / 1000000000).toFixed(2) + "G";
      if (val >= 1000000)    return (val / 1000000).toFixed(2) + "M";
      if (val >= 1000)       return (val / 1000).toFixed(2) + "K";
      return val.toFixed(0);
  }

  function calculate() {
      var base = (band1 * 10) + band2;
      var factor = 1;
      if (mult < 10) factor = Math.pow(10, mult);
      else if (mult === 10) factor = 0.1;
      else if (mult === 11) factor = 0.01;
      return base * factor;
  }

  function saveState() {
      try {
          var data = band1 + "," + band2 + "," + mult + "," + tol;
          storage.write(FILE_PATH, data, "write");
      } catch(e) {}
  }

  while (true) {
    
    // --- GOMBKEZELÉS ---
    var btnEsc  = keyboard.getPrevPress(true);
    var btnNext = keyboard.getNextPress(true);
    var btnSel  = keyboard.getSelPress(true);

    if (btnEsc && btnNext) {
        return; 
    }

    if (btnEsc && !btnNext) {
        focus++;
        if (focus > 3) focus = 0;
    }

    if (btnSel || (btnNext && !btnEsc)) {
        if (focus === 0) { 
            band1++; if (band1 > 9) band1 = 0; 
        }
        else if (focus === 1) { 
            band2++; if (band2 > 9) band2 = 0; 
        }
        else if (focus === 2) { 
            mult++; if (mult > 11) mult = 0; 
        }
        else if (focus === 3) { 
            tol++; if (tol > 3) tol = 0; 
        }
        saveState();
    }

    // --- RAJZOLÁS ---
    sprite.fill(C_BG);
    sprite.setTextSize(1);

    // ==========================================
    // 1. BAL OLDALI OSZLOPOK (Mindig látszik a keret)
    // ==========================================
    var colH = 13;      
    var startY = 3;     
    var col1X = 2;   
    var col2X = 24;  
    var colW = 20;   

    for (var i = 0; i <= 9; i++) {
        var y = startY + (i * colH);
        var c = bandColors[i];
        var numCol = txtColors[i];

        // -- 1. OSZLOP --
        if (band1 === i) {
            // Ha ez az oszlop aktív, akkor FEHÉR, ha nem, akkor SZÜRKE a keret
            var boxColor = (focus === 0) ? C_WHITE : C_GRAY;
            sprite.drawRect(col1X - 2, y, colW + 4, colH, boxColor);
        }
        
        sprite.drawFillRect(col1X, y + 1, colW, colH - 2, c);
        sprite.setTextColor(numCol, c); 
        sprite.drawText(i.toString(), col1X + 7, y + 2); 

        // -- 2. OSZLOP --
        if (band2 === i) {
            var boxColor = (focus === 1) ? C_WHITE : C_GRAY;
            sprite.drawRect(col2X - 2, y, colW + 4, colH, boxColor);
        }
        
        sprite.drawFillRect(col2X, y + 1, colW, colH - 2, c);
        sprite.setTextColor(numCol, c);
        sprite.drawText(i.toString(), col2X + 7, y + 2);
    }

    // ==========================================
    // 2. SZORZÓ OSZLOP (Mindig látszik a keret)
    // ==========================================
    var multBoxX = 225; 
    var multTxtRightX = 222; 
    var multH = 11; 

    for (var m = 0; m <= 11; m++) {
        var my = startY + (m * multH); 
        var mc = multColors[m];
        var txt = multLabels[m];
        
        // Aktív az, amit éppen szerkesztünk (focus===2), de a keret mindig kirajzolódik
        var isSelected = (mult === m);
        var isFocused = (focus === 2);
        
        // Szöveg szín
        // Ha épp ezen a soron vagyunk (fókusz), akkor PIROS, amúgy alap
        var txtColor = (isSelected && isFocused) ? C_RED : C_TXT;
        
        sprite.setTextColor(txtColor, C_BG);
        sprite.drawText(txt, multTxtRightX - (txt.length * 6), my + 1);

        if (isSelected) {
            var boxColor = isFocused ? C_WHITE : C_GRAY;
            sprite.drawRect(multBoxX - 1, my, 14, multH, boxColor);
        }
        
        sprite.drawFillRect(multBoxX, my + 1, 12, multH - 2, mc);
    }

    // ==========================================
    // 3. ELLENÁLLÁS TEST
    // ==========================================
    var centerX = 135; 
    var resY = 40;
    var bodyColor = display.color(222, 184, 135); 

    sprite.drawLine(centerX - 55, resY + 10, centerX + 55, resY + 10, C_SILVER);
    sprite.drawFillRect(centerX - 40, resY, 80, 20, bodyColor);
    
    sprite.drawFillRect(centerX - 30, resY, 10, 20, bandColors[band1]);
    sprite.drawFillRect(centerX - 10, resY, 10, 20, bandColors[band2]);
    sprite.drawFillRect(centerX + 10,  resY, 10, 20, multColors[mult]);
    sprite.drawFillRect(centerX + 30, resY, 10, 20, tolColors[tol]);

    // ==========================================
    // 4. EREDMÉNY DOBOZ
    // ==========================================
    var ohmVal = calculate();
    var valStr = formatResistor(ohmVal);
    
    var boxX = 61; 
    var boxW = 130;
    var boxCenterX = boxX + (boxW / 2);

    sprite.drawFillRect(boxX, 75, boxW, 30, C_BLUE);
    sprite.setTextSize(2);
    sprite.setTextColor(C_WHITE, C_BLUE);
    
    var valTxtW = valStr.length * 12;
    sprite.drawText(valStr, boxCenterX - (valTxtW/2) - 10, 83);
    sprite.setTextSize(1);
    sprite.drawText("ohm", boxCenterX + (valTxtW/2), 90);

    // ==========================================
    // 5. TOLERANCIA (Mindig látszik a keret)
    // ==========================================
    var tolY = 118;
    
    var tolItemW = 19;  
    var tolStart = 85;  
    var tolH = 15;      
    var tolSelH = 19;   

    for (var t = 0; t < 4; t++) {
        var tx = tolStart + (t * (tolItemW + 5));
        var tc = tolColors[t];
        var tVal = tolValues[t];

        // Keret kirajzolása, ha ez a kiválasztott érték
        if (tol === t) {
            var boxColor = (focus === 3) ? C_WHITE : C_GRAY;
            sprite.drawRect(tx - 2, tolY - 2, tolItemW + 4, tolSelH, boxColor);
        }
        
        sprite.drawFillRect(tx, tolY, tolItemW, tolH, tc);
        
        var tTxtCol = C_WHITE;
        if (t === 2 || t === 3) tTxtCol = C_BLACK; 
        
        sprite.setTextColor(tTxtCol, tc);
        sprite.drawText(tVal, tx + 1, tolY + 3);
    }
    
    // Fejléc
    sprite.setTextColor(C_WHITE, C_BG);
    sprite.drawText("R-Calc", centerX - 20, 5);

    sprite.pushSprite();
    try { delay(50); } catch(e) {}
  }
}

main();
