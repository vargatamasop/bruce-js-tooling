var display = require('display');
var serialApi = require('serial');
var keyboard = require('keyboard');

var println = display.println;
var gifOpen = display.gifOpen;
var serialPrintln = serialApi.println;

var tftWidth = display.width(); 

function now() {
  return new Date().getTime();
}

function main() {
  display.fill(0);
  println("Loading 3 GIFs...");
  
  var sectionWidth = Math.floor(tftWidth / 3);
  
  // 'var'-t használunk 'const' helyett, hogy módosítható legyen (biztonságosabb)
  var gif1 = gifOpen('littlefs', '/gifs/spongebob.gif');
  var gif2 = gifOpen('littlefs', '/gifs/patrick.gif');
  var gif3 = gifOpen('littlefs', '/gifs/rick.gif');

  if (!gif1 && !gif2 && !gif3) {
    display.fill(0);
    println("Error: No GIFs found!");
    delay(3000);
    throw new Error("Cannot load gifs.");
  }

  var elapsed;
  var frames = 0;
  var fps = 0;
  var startTime = now();

  display.fill(0);

  while(true) {
    // --- LEJÁTSZÁS (try-catch, hogy futás közben se fagyjon le) ---
    try {
        if (gif1) gif1.playFrame(0, 0);
        if (gif2) gif2.playFrame(sectionWidth, 0);
        if (gif3) gif3.playFrame(sectionWidth * 2, 0);
    } catch(err) {
        // Ha hiba van lejátszás közben, figyelmen kívül hagyjuk
    }

    frames++;
    if (frames % 10 === 0) {
      elapsed = (now() - startTime) / 1000;
      if (elapsed > 0) fps = frames / elapsed;
    }

    // --- KILÉPÉS ---
    // Csak az oldalsó gomb (Next) vagy ESC (Prev)
    if (keyboard.getNextPress() || keyboard.getPrevPress()) {
      
      display.fill(0);
      println("Closing...");
      
      // *** A HIBAJAVÍTÁS LÉNYEGE: ***
      // Megpróbáljuk szépen bezárni őket, de ha hiba van, elnyomjuk azt.
      try {
          if (gif1) gif1.close();
      } catch (e) { /* Hiba elnyomása */ }
      
      try {
          if (gif2) gif2.close();
      } catch (e) { /* Hiba elnyomása */ }
      
      try {
          if (gif3) gif3.close();
      } catch (e) { /* Hiba elnyomása */ }

      delay(100); // Pici várakozás
      break; 
    }
  }
}

main();