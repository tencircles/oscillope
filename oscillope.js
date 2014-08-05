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
    Oscillope.prototype.makeNote = function (midiNote, startTime, duration, velocity) {
        var osc = this.context.createOscillator();

        osc.env = this.context.createGain();
        osc.vel = this.context.createGain();

        switch (velocity) {
            case 0:
                return this.stop();
            case undefined:
                velocity = 127;
                break;
            default:
                velocity = velocity < 0 ? 0 : velocity > 127 ? 127 : velocity;
        }

        osc.vel.gain.setValueAtTime(velocity / 127, 0);

        this.oscs.push(osc);

        osc.type = this.type;
        osc.frequency.value = this.mtof(midiNote);

        osc.connect(osc.env).connect(osc.vel).connect(this.output);
        osc.start(startTime);
        env.call(this, osc, startTime, duration);
        if (duration) {
            setTimeout(function () {
                var index = this.oscs.indexOf(osc);
                if (index > -1) {
                    this.stop(index);
                }
            }.bind(this), (duration + this.release + 0.05) * 1000);
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
            //this.oscs[n].stop(t || 0);
            this.oscs.splice(n, 1);
        }
    };
    Oscillope.prototype.mtof = function (note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    };
    Oscillope.prototype.adsr = function (a, d, s, r) {
        this.attack = a;
        this.decay = d;
        this.sustain = s;
        this.release = r;
    };
    Object.defineProperties(Oscillope.prototype, {
        gain: {
            get: function () {
                return this.output.gain;
            }
        },
        type: {
            get: function () {
                return this._type;
            },
            set: function (value) {
                this._type = value;
            }
        }
    });
    window.webkitAudioContext.prototype.createOscillope = function () {
        return new Oscillope(this);
    };
    function env (osc, startTime, duration) {
        var peakTime = startTime + this.attack,
            sustainTime = peakTime + this.decay,
            releaseTime = startTime + duration + this.release;

        osc.env.gain.setValueAtTime(0, startTime);
        osc.env.gain.linearRampToValueAtTime(1, peakTime);
        osc.env.gain.linearRampToValueAtTime(this.sustain, sustainTime);
        osc.env.gain.setValueAtTime(this.sustain, startTime + duration);
        osc.env.gain.linearRampToValueAtTime(0, releaseTime);
        osc.stop(releaseTime + 0.001);
    }
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
