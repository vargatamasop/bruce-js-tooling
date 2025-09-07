const exports = {};


function createDisplay() {
   // ====== Main canvas bootstrap ======
  const canvas = document.createElement("canvas");
  canvas.width = 240;  // tweak if your target TFT size differs
  canvas.height = 135;
  canvas.style.border = "1px solid #ccc";
  canvas.style.imageRendering = "pixelated";
  document.getElementById("app").appendChild(canvas);

  const ctx = canvas.getContext("2d", { willReadFrequently: false });

  // ====== State for text rendering ======
  let cursorX = 0;
  let cursorY = 0;
  let textColor565 = 0x0000; // rgb565
  let textAlignCanvas = "left";       // 'left' | 'center' | 'right'
  let textBaselineCanvas = "top"; // 'top' | 'middle' | 'bottom' | 'alphabetic'
  let textSizePx = 16;

  // ====== Color helpers (RGB565) ======
  function rgbTo565(r, g, b) {
    return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | ((b & 0xF8) >>> 3);
  }
  function _565ToCss(c565) {
    const r = ((c565 >> 11) & 0x1f) * 255 / 31;
    const g = ((c565 >> 5) & 0x3f) * 255 / 63;
    const b = (c565 & 0x1f) * 255 / 31;
    return `rgb(${r|0}, ${g|0}, ${b|0})`;
  }

  function mapAlign(a) {
    if (a === 0 || a === "left") return "left";
    if (a === 1 || a === "center") return "center";
    if (a === 2 || a === "right") return "right";
    return String(a);
  }
  function mapBaseline(b) {
    if (b === undefined) return "alphabetic";
    if (b === 0 || b === "top") return "top";
    if (b === 1 || b === "middle") return "middle";
    if (b === 2 || b === "bottom") return "bottom";
    if (b === "alphabetic") return "alphabetic";
    return String(b);
  }

  function ensureRoundRect(ctx) {
    if (!ctx.roundRect) {
      ctx.roundRect = function (x, y, w, h, r) {
        const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
        this.beginPath();
        this.moveTo(x + rr, y);
        this.lineTo(x + w - rr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + rr);
        this.lineTo(x + w, y + h - rr);
        this.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
        this.lineTo(x + rr, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - rr);
        this.lineTo(x, y + rr);
        this.quadraticCurveTo(x, y, x + rr, y);
        this.closePath();
      };
    }
  }
  ensureRoundRect(ctx);

  // ====== Core drawing API factory (used by display and sprites) ======
  function makeDrawingAPI(targetCtx, getW, getH, textState) {
    const state = textState || {
      cursorX: 0,
      cursorY: 0,
      textColor565: 0xffff,
      textAlignCanvas: "left",
      textBaselineCanvas: "top",
      textSizePx: 16,
    };

    function useText(ctx) {
      ctx.fillStyle = _565ToCss(state.textColor565);
      ctx.textAlign = state.textAlignCanvas;
      ctx.textBaseline = state.textBaselineCanvas;
      ctx.font = `${state.textSizePx * 8}px sans-serif`;
    }

    function drawMonochromeBitmap(ctx, x, y, bitmap, width, height, fg565, bg565) {
      const bytes = new Uint8Array(bitmap);
      ctx.save();

      // Optional background fill
      if (bg565 !== undefined) {
        ctx.fillStyle = _565ToCss(bg565);
        ctx.fillRect(x, y, width, height);
      }

      ctx.fillStyle = _565ToCss(fg565);

      const bytesPerRow = Math.ceil(width / 8);

      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          const byteIndex = row * bytesPerRow + Math.floor(col / 8);
          const bitMask = 1 << (col % 8); // LSB first
          if ((bytes[byteIndex] & bitMask) !== 0) {
            ctx.fillRect(x + col, y + row, 1, 1);
          }
        }
      }

      ctx.restore();
    }

    function drawBitmapGeneric(ctx, x, y, buf, width, height, bpp, paletteBuf) {
      const put = ctx.createImageData(width, height);
      const data = put.data;

      function setPixel(i, r, g, b) {
        const o = i * 4;
        data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 255;
      }

      if (bpp === 16) {
        const pix = new Uint16Array(buf);
        for (let i = 0; i < width * height; i++) {
          const c = pix[i];
          const r = ((c >> 11) & 0x1f) * 255 / 31;
          const g = ((c >> 5) & 0x3f) * 255 / 63;
          const b = (c & 0x1f) * 255 / 31;
          setPixel(i, r|0, g|0, b|0);
        }
      } else if (bpp === 8) { // RGB332
        const pix = new Uint8Array(buf);
        for (let i = 0; i < width * height; i++) {
          const c = pix[i];
          const r = ((c >> 5) & 0x07) * 255 / 7;
          const g = ((c >> 2) & 0x07) * 255 / 7;
          const b = (c & 0x03) * 255 / 3;
          setPixel(i, r|0, g|0, b|0);
        }
      } else if (bpp === 4 || bpp === 1) {
        if (!paletteBuf) throw new Error("Palette required for 4bpp/1bpp");
        const pal = new Uint16Array(paletteBuf);
        const src = new Uint8Array(buf);
        let i = 0; // pixel index
        if (bpp === 4) {
          for (let byte of src) {
            const hi = byte >> 4;
            const lo = byte & 0x0f;
            for (const idx of [hi, lo]) {
              if (i >= width * height) break;
              const c = pal[idx] || 0;
              const r = ((c >> 11) & 0x1f) * 255 / 31;
              const g = ((c >> 5) & 0x3f) * 255 / 63;
              const b = (c & 0x1f) * 255 / 31;
              setPixel(i++, r|0, g|0, b|0);
            }
          }
        } else { // 1 bpp, 8 pixels per byte
          for (let byte of src) {
            for (let bit = 7; bit >= 0; bit--) {
              if (i >= width * height) break;
              const idx = (byte >> bit) & 1;
              const c = pal[idx] || 0;
              const r = ((c >> 11) & 0x1f) * 255 / 31;
              const g = ((c >> 5) & 0x3f) * 255 / 63;
              const b = (c & 0x1f) * 255 / 31;
              setPixel(i++, r|0, g|0, b|0);
            }
          }
        }
      } else {
        throw new Error("Unsupported bpp");
      }
      ctx.putImageData(put, x, y);
    }

    const api = {
      color(r, g, b) { return rgbTo565(r|0, g|0, b|0); },

      fill(color565) {
        targetCtx.fillStyle = _565ToCss(color565);
        targetCtx.fillRect(0, 0, getW(), getH());
      },

      setCursor(x, y) { state.cursorX = x|0; state.cursorY = y|0; },

      print(...args) {
        useText(targetCtx);
        targetCtx.fillText(args.join(" "), state.cursorX, state.cursorY);
        try { console.log(...args); } catch {}
      },

      println(...args) {
        api.print(...args);
        state.cursorY += state.textSizePx + 2;
      },

      setTextColor(color565) { state.textColor565 = color565|0; },

      setTextAlign(align, baseline) {
        state.textAlignCanvas = mapAlign(align ?? state.textAlignCanvas);
        state.textBaselineCanvas = mapBaseline(baseline ?? state.textBaselineCanvas);
      },

      setTextSize(size) { state.textSizePx = Math.max(1, size|0); },

      drawText(text, x, y) {
        useText(targetCtx);
        targetCtx.fillText(String(text), x|0, y|0);
      },

      drawString(text, x, y) { api.drawText(text, x, y); },

      drawPixel(x, y, color565) {
        targetCtx.fillStyle = _565ToCss(color565);
        targetCtx.fillRect(x|0, y|0, 1, 1);
      },

      drawLine(x, y, x2, y2, color565) {
        targetCtx.strokeStyle = _565ToCss(color565);
        targetCtx.beginPath();
        targetCtx.moveTo(x|0, y|0);
        targetCtx.lineTo(x2|0, y2|0);
        targetCtx.stroke();
      },

      drawRect(x, y, w, h, color565) {
        targetCtx.strokeStyle = _565ToCss(color565);
        targetCtx.strokeRect(x|0, y|0, w|0, h|0);
      },

      drawFillRect(x, y, w, h, color565) {
        targetCtx.fillStyle = _565ToCss(color565);
        targetCtx.fillRect(x|0, y|0, w|0, h|0);
      },

      drawFillRectGradient(x, y, w, h, c1, c2, direction) {
        const grad = direction === "horizontal"
          ? targetCtx.createLinearGradient(x, y, x + w, y)
          : targetCtx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, _565ToCss(c1));
        grad.addColorStop(1, _565ToCss(c2));
        targetCtx.fillStyle = grad;
        targetCtx.fillRect(x|0, y|0, w|0, h|0);
      },

      drawRoundRect(x, y, w, h, r, color565) {
        ensureRoundRect(targetCtx);
        targetCtx.strokeStyle = _565ToCss(color565);
        targetCtx.beginPath();
        targetCtx.roundRect(x|0, y|0, w|0, h|0, r|0);
        targetCtx.stroke();
      },

      drawFillRoundRect(x, y, w, h, r, color565) {
        ensureRoundRect(targetCtx);
        targetCtx.fillStyle = _565ToCss(color565);
        targetCtx.beginPath();
        targetCtx.roundRect(x|0, y|0, w|0, h|0, r|0);
        targetCtx.fill();
      },

      drawCircle(x, y, r, color565) {
        targetCtx.strokeStyle = _565ToCss(color565);
        targetCtx.beginPath();
        targetCtx.arc(x|0, y|0, r|0, 0, Math.PI * 2);
        targetCtx.stroke();
      },

      drawFillCircle(x, y, r, color565) {
        targetCtx.fillStyle = _565ToCss(color565);
        targetCtx.beginPath();
        targetCtx.arc(x|0, y|0, r|0, 0, Math.PI * 2);
        targetCtx.fill();
      },

      drawXBitmap(x, y, bitmap, width, height, fgColor, bgColor) {
        drawMonochromeBitmap(targetCtx, x|0, y|0, bitmap, width|0, height|0, fgColor|0, bgColor);
      },

      drawBitmap(x, y, bitmap, width, height, bpp, palette) {
        drawBitmapGeneric(targetCtx, x|0, y|0, bitmap, width|0, height|0, bpp, palette);
      },

      // Simple JPG loader (asynchronous). For "Path" objects, use .path
      drawJpg(path, x = 0, y = 0, center = false) {
        const src = (typeof path === "string") ? path : (path && path.path) ? path.path : "";
        if (!src) return;
        const img = new Image();
        img.onload = () => {
          let dx = x, dy = y;
          if (center) {
            dx = ((getW() - img.width) / 2) | 0;
            dy = ((getH() - img.height) / 2) | 0;
          }
          targetCtx.drawImage(img, dx, dy);
        };
        img.src = src;
      },

      // Minimal stubs to avoid crashes (no real GIF timing):
      drawGif(path, x = 0, y = 0, center = false, _playDurationMs) {
        const src = (typeof path === "string") ? path : (path && path.path) ? path.path : "";
        if (!src) return;
        const img = new Image();
        img.onload = () => {
          let dx = x, dy = y;
          if (center) {
            dx = ((getW() - img.width) / 2) | 0;
            dy = ((getH() - img.height) / 2) | 0;
          }
          targetCtx.drawImage(img, dx, dy);
        };
        img.src = src;
      },

      gifOpen(path) {
        const src = (typeof path === "string") ? path : (path && path.path) ? path.path : "";
        const img = new Image();
        img.src = src;
        return {
          playFrame: (x = 0, y = 0, _sync = true) => {
            if (img.complete) targetCtx.drawImage(img, x|0, y|0);
          },
          dimensions: () => ({ width: img.naturalWidth || 0, height: img.naturalHeight || 0 }),
          reset: () => {}, close: () => {}
        };
      },

      width() { return getW(); },
      height() { return getH(); },
    };

    return api;
  }
  
  const display = makeDrawingAPI(
    ctx,
    () => canvas.width,
    () => canvas.height,
    { cursorX, cursorY, textColor565, textAlignCanvas, textBaselineCanvas, textSizePx }
  );

  // ====== SPRITES ======
  // createSprite(width?, height?, colorDepth?, frames?)
  display.createSprite = function (w, h, _colorDepth = 16, _frames = 1) {
    const off = document.createElement("canvas");
    off.width = (w == null ? canvas.width : w|0);
    off.height = (h == null ? canvas.height : h|0);
    const offCtx = off.getContext("2d", { willReadFrequently: false });
    ensureRoundRect(offCtx);

    // Independent text state for this sprite
    const spriteAPI = makeDrawingAPI(
      offCtx,
      () => off.width,
      () => off.height,
      { cursorX: 0, cursorY: 0, textColor565: 0xffff, textAlignCanvas: "left", textBaselineCanvas: "top", textSizePx: 16 }
    );

    let deleted = false;

    const sprite = {
      // Omit drawJpg/drawGif/gifOpen as per typings
      ...spriteAPI,
      deleteSprite() {
        deleted = true;
        // Help GC
        off.width = 0; off.height = 0;
      },
      pushSprite(x = 0, y = 0) {
        if (deleted) return;
        ctx.drawImage(off, x|0, y|0);
      },
    };

    return sprite;
  };
  return display;
}

const canvasDisplay = createDisplay();

function now() {
  return new Date().getTime();
}

function random(min, max) {
  if (typeof max === "undefined") {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min)) + min;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let currentOsc = null;

function require(module) {
  let object = {};
  if (module == "audio") {
    object["playFile"] = () => {};
    object["tone"] = (freq = 440, duration = 500) => {
      if (currentOsc) currentOsc.stop();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.frequency.value = freq;
      osc.type = "triangle";

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration / 1000);

      currentOsc = osc;

      // clear reference after finished
      osc.onended = () => {
        if (currentOsc === osc) currentOsc = null;
      };
    };

  } else if (module == "badusb") {
    object["setup"] = () => {};
    object["press"] = () => {};
    object["hold"] = () => {};
    object["release"] = () => {};
    object["releaseAll"] = () => {};
    object["print"] = () => {};
    object["println"] = () => {};
    object["pressRaw"] = () => {};
    object["runFile"] = () => {};

  } else if (module == "blebeacon") {

  } else if (module == "dialog" || module == "gui") {
    object["message"] = () => {};
    object["info"] = () => {};
    object["success"] = () => {};
    object["warning"] = () => {};
    object["error"] = () => {};
    object["choice"] = () => {};
    object["prompt"] = () => {};
    object["pickFile"] = () => {};
    object["viewFile"] = () => {};
    object["viewText"] = () => {};
    object["createTextViewer"] = () => {};
    object["drawStatusBar"] = () => {};

  } else if (module == "display") {
    object = canvasDisplay;

  } else if (module == "device" || module == "flipper") {
    object["getName"] = () => {};
    object["getBoard"] = () => {};
    object["getModel"] = () => {};
    object["getBatteryCharge"] = () => {};
    object["getFreeHeapSize"] = () => {};

  } else if (module == "gpio") {
    object["pinMode"] = () => {};
    object["digitalRead"] = () => {};
    object["analogRead"] = () => {};
    object["touchRead"] = () => {};
    object["digitalWrite"] = () => {};
    object["analogWrite"] = () => {};
    object["dacWrite"] = () => {};
    object["ledcSetup"] = () => {};
    object["ledcAttachPin"] = () => {};
    object["ledcWrite"] = () => {};

  } else if (module == "http") {
    // TODO: Make the WebServer API compatible with the Node.js API
    // The more compatible we are, the more Node.js scripts can run on Bruce
    // MEMO: We need to implement an event loop so the WebServer can run:
    // https://github.com/svaarala/duktape/tree/master/examples/eventloop

  } else if (module == "ir") {
    object["read"] = () => {};
    object["readRaw"] = () => {};
    object["transmitFile"] = () => {};
    object["transmit"] = () => {};

  } else if (module == "keyboard" || module == "input") {
    object["keyboard"] = () => {};

    const pressedKeys = new Set();

    document.addEventListener("keydown", (e) => {
      pressedKeys.add(e.key);
    });

    document.addEventListener("keyup", (e) => {
      pressedKeys.delete(e.key);
    });

    object["getKeysPressed"] = () => Array.from(pressedKeys);

    object["getPrevPress"] = () => pressedKeys.has("ArrowLeft") ? "ArrowLeft" : null;

    object["getSelPress"] = () => 
      (pressedKeys.has("Enter") || pressedKeys.has(" ")) ? "Enter" : null;

    object["getEscPress"] = () => pressedKeys.has("Escape") ? "Escape" : null;

    object["getNextPress"] = () => pressedKeys.has("ArrowRight") ? "ArrowRight" : null;

    object["getAnyPress"] = () => pressedKeys.size ? Array.from(pressedKeys)[0] : null;

  } else if (module == "notification") {
    object["blink"] = () => {};

  } else if (module == "serial") {
    object["print"] = () => {};
    object["println"] = () => {};
    object["readln"] = () => {};
    object["cmd"] = () => {};

    object["write"] = () => {};

  } else if (module == "storage") {
    object["read"] = (path, binary) => {
      return storage_rom;
    };
    object["write"] = () => {};
    object["rename"] = () => {};
    object["remove"] = () => {};
    object["readdir"] = () => {};
    object["mkdir"] = () => {};
    object["rmdir"] = () => {};

  } else if (module == "subghz") {
    object["setFrequency"] = () => {};
    object["read"] = () => {};
    object["readRaw"] = () => {};
    object["transmitFile"] = () => {};
    object["transmit"] = () => {};
    object["setup"] = () => {};
    object["setIdle"] = () => {};

  } else if (module == "wifi") {
    object["connected"] = () => {};
    object["connect"] = () => {};
    object["connectDialog"] = () => {};
    object["disconnect"] = () => {};
    object["scan"] = () => {};
    object["httpFetch"] = () => {};

  }

  return object;
}

const Duktape = {};

// Decode base64 → Uint8Array
Duktape.dec = function (type, input) {
  if (type !== "base64") throw new Error("Only base64 supported");
  if (typeof Buffer !== "undefined") {
    // Node.js
    return new Uint8Array(Buffer.from(input, "base64"));
  } else if (typeof atob !== "undefined") {
    // Browser
    const binary = atob(input);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } else {
    throw new Error("No base64 decode available");
  }
};

// Encode Uint8Array → base64 string
Duktape.enc = function (type, bytes) {
  if (type !== "base64") throw new Error("Only base64 supported");
  if (!(bytes instanceof Uint8Array)) {
    throw new TypeError("Input must be a Uint8Array");
  }

  if (typeof Buffer !== "undefined") {
    // Node.js
    return Buffer.from(bytes).toString("base64");
  } else if (typeof btoa !== "undefined") {
    // Browser
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } else {
    throw new Error("No base64 encode available");
  }
};
