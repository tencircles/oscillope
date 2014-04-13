(function (definition) {
    typeof define === "function" && define.amd ?
    define(definition) :
    typeof module !== "undefined" && module.exports ?
    module.exports = definition() :
    this.oscillope = definition();
})(function () {
    function Oscillope (context) {
        hackit(context);
        this.context = context;
        this.type = "sine";
        this.oscs = [];
        this.output = context.createGain();
    }
    Oscillope.prototype.makeNote = function (midiNote, startTime, duration) {
        var osc = this.context.createOscillator();
        this.oscs.push(osc);
        osc.type = this.type;
        osc.frequency.value = this.mtof(midiNote);
        osc.connect(this.output);
        osc.start(startTime);
        if (duration) {
            osc.stop(startTime + duration);
            setTimeout(function () {
                var index = this.oscs.indexOf(osc);
                if (index > -1) {
                    this.stop(index);
                }
            }.bind(this), (duration * 1000) + 1);
        }
    };
    Oscillope.prototype.connect = function (node) {
        return this.output.connect(node);
    };
    Oscillope.prototype.stop = function (n, t) {
        if (typeof n === "undefined") {
            while (this.oscs.length) {
                this.oscs.shift().stop(0);
            }
        } else {
            this.oscs[n].stop(t || 0);
            this.oscs.splice(n, 1);
        }
    };
    Oscillope.prototype.mtof = function (note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    };
    Object.defineProperties(Oscillope.prototype, {
        gain: {
            get: function () {
                return this.output.gain;
            }
        }
    });
    window.webkitAudioContext.prototype.createOscillope = function () {
        return new Oscillope(this);
    };
    function hackit (context) {
        var k = context.createGain(),
            proto = Object.getPrototypeOf(Object.getPrototypeOf(k)),
            oconnect = proto.connect;

        function osconnect (node) {
            if (node instanceof Oscillope) {
                oconnect.call(this, node.output);
            } else {
                oconnect.call(this, node);
            }
            return node;
        }
        if (oconnect.toString() !== "function connect() { [native code] }") {
            return;
        } else {
            proto.connect = osconnect;
        }
    }
    return Oscillope;
});
