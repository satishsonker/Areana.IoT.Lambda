class Common {
    endpointHealthContext = {
        namespace: "Alexa.EndpointHealth",
        name: "connectivity",
        value: {
            value: "OK"
        },
        timeOfSample: JSON.stringify(new Date()).replace(/"/gi, ''),
        uncertaintyInMilliseconds: 0
    };
    powerControllerContext = {
        namespace: "Alexa.PowerController",
        name: "powerState",
        value: "",
        timeOfSample: JSON.stringify(new Date()).replace(/"/gi, ''),
        uncertaintyInMilliseconds: 0
    };
    brightnessControllerContext = {
        namespace: "Alexa.BrightnessController",
        name: "brightness",
        value: "",
        timeOfSample: JSON.stringify(new Date()).replace(/"/gi, ''),
        uncertaintyInMilliseconds: 0
    };
    colorControllerContext = {
        namespace: "Alexa.ColorController",
        name: "color",
        value: {
            "hue": 350.5,
            "saturation": 0.7138,
            "brightness": 0.6524
        },
        timeOfSample: JSON.stringify(new Date()).replace(/"/gi, ''),
        uncertaintyInMilliseconds: 0
    };
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `#${f(0)}${f(8)}${f(4)}`;
      }
    hsvToHex(h, s, v) {
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        var _h = h,
            _s = s * v,
            _l = (2 - s) * v;
        _s /= (_l <= 1) ? (_l === 0 ? 1 : _l) : 2 - _l;
        _l /= 2;
     return this.hslToHex(_h,_s*100,_l*100);
    }
    checkNumber(number) {
        return !isNaN(parseInt(number));
    }
    defaultIfEmpty(value, defaultValue) {
        return value !== undefined && value !== null ? value : defaultValue;
    }
}
module.exports = Common;