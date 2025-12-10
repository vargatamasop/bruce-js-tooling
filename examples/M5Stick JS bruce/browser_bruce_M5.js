var dialog = require('dialog');
var wifi = require('wifi');
var display = require('display');
var keyboard = require('keyboard');

var tftWidth = display.width();
var tftHeight = display.height();

var request = { body: '' };

function drawWindow(title) {
  display.fill(0);
  var boxColor = 0xFFFF;
  if (typeof BRUCE_PRICOLOR !== 'undefined') {
      boxColor = BRUCE_PRICOLOR;
  }
  display.drawRoundRect(5, 5, tftWidth - 10, tftHeight - 10, 5, boxColor);
  
  display.setTextSize(2);
  display.setTextAlign('center', 'top');
  
  var safeTitle = title;
  if (safeTitle.length > 15) safeTitle = safeTitle.substring(0, 15) + "..";
  display.drawText(safeTitle, tftWidth / 2, 5);
  
  display.setTextAlign('left', 'top');
  display.setTextSize(1);
  display.drawText('Loading...', 20, 35);
}

var textViewer = dialog.createTextViewer(request.body, {
  fontSize: 1,
  startX: 10,
  startY: 25,
  width: tftWidth - 20,
  height: tftHeight - 35,
  indentWrappedLines: true,
});

var history = [];

// Egyszerű HTML tag eltávolító (hogy ne krix-kraxot láss)
function stripHtml(html) {
   var tmp = html;
   // Cseréljük a <br> és <p> jeleket új sorra
   tmp = tmp.replace(/<br\s*\/?>/gi, "\n");
   tmp = tmp.replace(/<\/p>/gi, "\n\n");
   // Minden más <...> taget törlünk
   tmp = tmp.replace(/<[^>]*>/g, "");
   // Üres sorok ritkítása
   tmp = tmp.replace(/\n\s*\n/g, "\n");
   return tmp;
}

function goToPage(url) {
  var title = url;
  if (title.indexOf('://') > -1) {
      title = title.substring(title.indexOf('://') + 3);
  }
  
  drawWindow(title);
  textViewer.clear();
  textViewer.setText("Connecting direct...\n" + url);
  textViewer.draw();

  try {
    // KÖZVETLEN LEKÉRÉS (Nincs W3C közvetítő)
    console.log("Direct fetch: " + url);
    
    var response = wifi.httpFetch(url, { 
        method: 'GET',
        headers: { "User-Agent": "curl/7.64.1" } // A 'curl' álcázás segít a wttr.in-nek
    });
    
    if (response && response.body) {
        // Ha ez az időjárás oldal, nem kell tisztítani
        if (url.indexOf("wttr.in") !== -1) {
             request = { body: response.body };
        } else {
             // Ha sima weboldal, leszedjük a HTML tageket
             var cleanText = stripHtml(response.body);
             request = { body: cleanText };
        }
    } else {
        request = { body: 'Error: Empty response.' };
    }
    
  } catch (e) {
    var err = String(e);
    request = { body: 'Direct Error: ' + err + '\n(Try http instead of https)' };
  }
  
  history.push(url);
  textViewer.setText(request.body);
  textViewer.draw();
}

var websites = [
  'http://wttr.in/Budapest?format=3', // 1. EZT PRÓBÁLD! (Tiszta szöveg)
  'http://wttr.in/Budapest?0',        // 2. Részletes időjárás
  'http://example.com',               // 3. Egyszerű teszt oldal
  'http://info.cern.ch',              // 4. Az első weboldal (nagyon egyszerű)
];

function selectWebsite() {
  var websitesChoice = {};
  for (var index = 0; index < websites.length; index++) {
    // Rövidítjük a nevet a menüben
    var label = websites[index];
    if (label.indexOf("wttr.in") !== -1) label = "Idojaras (BP)";
    if (label.indexOf("example") !== -1) label = "Example.com";
    if (label.indexOf("cern") !== -1) label = "CERN Info";
    
    websitesChoice[label] = websites[index];
  }
  websitesChoice['Cancel'] = 'Cancel';
  websitesChoice['Quit'] = 'Quit';
  return dialog.choice(websitesChoice);
}

// ... (A selectSection és main függvények ugyanazok maradtak, csak a main hívja a selectWebsite-ot)

function selectSection() {
  var websitesSections = {};
  var getMaxLines = textViewer.getMaxLines();
  var limit = getMaxLines > 50 ? 50 : getMaxLines;
  
  for (var index = 0; index < limit; index++) {
    var lineText = textViewer.getLine(index);
    if (lineText && lineText.length > 0 && lineText[0] !== ' ') {
       var key = lineText;
       if (key.length > 20) key = key.substring(0, 20) + "..";
       websitesSections[key] = String(index);
    }
  }
  websitesSections['Cancel'] = 'Cancel';
  var choice = dialog.choice(websitesSections);
  return choice === 'Cancel' ? -1 : parseInt(choice, 10);
}

function main() {
  var url = selectWebsite();
  if (url === 'Quit' || url === 'Cancel') return;
  
  goToPage(url);
  
  var redraw = true;

  while (true) {
    if (keyboard.getSelPress()) {
      // Egyszerűsített menü
      var choice = dialog.choice(['Select Website', 'Quit', 'Cancel']);
      
      if (choice === 'Quit') break;
      if (choice === 'Cancel') redraw = true;
      if (choice === 'Select Website') {
         var newUrl = selectWebsite();
         if (newUrl !== 'Cancel' && newUrl !== 'Quit') {
             goToPage(newUrl);
         } else if (newUrl === 'Quit') break;
         else redraw = true;
      }
    }
    
    if (keyboard.getPrevPress()) {
      textViewer.scrollUp();
      textViewer.draw();
      redraw = false;
    }
    if (keyboard.getNextPress()) {
      textViewer.scrollDown();
      textViewer.draw();
      redraw = false;
    }

    if (redraw) {
       textViewer.draw();
       redraw = false;
    }
    
    delay(100);
  }
}

main();
