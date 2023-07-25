/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 978:
/***/ ((module) => {

    "use strict";


    /**
     * Masks a buffer using the given mask.
     *
     * @param {Buffer} source The buffer to mask
     * @param {Buffer} mask The mask to use
     * @param {Buffer} output The buffer where to store the result
     * @param {Number} offset The offset at which to start writing
     * @param {Number} length The number of bytes to mask.
     * @public
     */
    const mask = (source, mask, output, offset, length) => {
      for (var i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    };
    
    /**
     * Unmasks a buffer using the given mask.
     *
     * @param {Buffer} buffer The buffer to unmask
     * @param {Buffer} mask The mask to use
     * @public
     */
    const unmask = (buffer, mask) => {
      // Required until https://github.com/nodejs/node/issues/9006 is resolved.
      const length = buffer.length;
      for (var i = 0; i < length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    };
    
    module.exports = { mask, unmask };
    
    
    /***/ }),
    
    /***/ 82:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    "use strict";
    
    
    try {
      module.exports = require(__nccwpck_require__.ab + "prebuilds/win32-x64/node.napi.node");
    } catch (e) {
      module.exports = __nccwpck_require__(978);
    }
    
    
    /***/ }),
    
    /***/ 430:
    /***/ ((module, exports, __nccwpck_require__) => {
    
    /**
     * This is the web browser implementation of `debug()`.
     *
     * Expose `debug()` as the module.
     */
    
    exports = module.exports = __nccwpck_require__(575);
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = 'undefined' != typeof chrome
                   && 'undefined' != typeof chrome.storage
                      ? chrome.storage.local
                      : localstorage();
    
    /**
     * Colors.
     */
    
    exports.colors = [
      'lightseagreen',
      'forestgreen',
      'goldenrod',
      'dodgerblue',
      'darkorchid',
      'crimson'
    ];
    
    /**
     * Currently only WebKit-based Web Inspectors, Firefox >= v31,
     * and the Firebug extension (any Firefox version) are known
     * to support "%c" CSS customizations.
     *
     * TODO: add a `localStorage` variable to explicitly enable/disable colors
     */
    
    function useColors() {
      // NB: In an Electron preload script, document will be defined but not fully
      // initialized. Since we know we're in Chrome, we'll just detect this case
      // explicitly
      if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
        return true;
      }
    
      // is webkit? http://stackoverflow.com/a/16459606/376773
      // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
      return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
        // is firebug? http://stackoverflow.com/a/398120/376773
        (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
        // is firefox >= v31?
        // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
        // double check webkit in userAgent just in case we are in a worker
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
    }
    
    /**
     * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
     */
    
    exports.formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (err) {
        return '[UnexpectedJSONParseError]: ' + err.message;
      }
    };
    
    
    /**
     * Colorize log arguments if enabled.
     *
     * @api public
     */
    
    function formatArgs(args) {
      var useColors = this.useColors;
    
      args[0] = (useColors ? '%c' : '')
        + this.namespace
        + (useColors ? ' %c' : ' ')
        + args[0]
        + (useColors ? '%c ' : ' ')
        + '+' + exports.humanize(this.diff);
    
      if (!useColors) return;
    
      var c = 'color: ' + this.color;
      args.splice(1, 0, c, 'color: inherit')
    
      // the final "%c" is somewhat tricky, because there could be other
      // arguments passed either before or after the %c, so we need to
      // figure out the correct index to insert the CSS into
      var index = 0;
      var lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, function(match) {
        if ('%%' === match) return;
        index++;
        if ('%c' === match) {
          // we only are interested in the *last* %c
          // (the user may have provided their own)
          lastC = index;
        }
      });
    
      args.splice(lastC, 0, c);
    }
    
    /**
     * Invokes `console.log()` when available.
     * No-op when `console.log` is not a "function".
     *
     * @api public
     */
    
    function log() {
      // this hackery is required for IE8/9, where
      // the `console.log` function doesn't have 'apply'
      return 'object' === typeof console
        && console.log
        && Function.prototype.apply.call(console.log, console, arguments);
    }
    
    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */
    
    function save(namespaces) {
      try {
        if (null == namespaces) {
          exports.storage.removeItem('debug');
        } else {
          exports.storage.debug = namespaces;
        }
      } catch(e) {}
    }
    
    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */
    
    function load() {
      var r;
      try {
        r = exports.storage.debug;
      } catch(e) {}
    
      // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
      if (!r && typeof process !== 'undefined' && 'env' in process) {
        r = process.env.DEBUG;
      }
    
      return r;
    }
    
    /**
     * Enable namespaces listed in `localStorage.debug` initially.
     */
    
    exports.enable(load());
    
    /**
     * Localstorage attempts to return the localstorage.
     *
     * This is necessary because safari throws
     * when a user disables cookies/localstorage
     * and you attempt to access it.
     *
     * @return {LocalStorage}
     * @api private
     */
    
    function localstorage() {
      try {
        return window.localStorage;
      } catch (e) {}
    }
    
    
    /***/ }),
    
    /***/ 575:
    /***/ ((module, exports, __nccwpck_require__) => {
    
    
    /**
     * This is the common logic for both the Node.js and web browser
     * implementations of `debug()`.
     *
     * Expose `debug()` as the module.
     */
    
    exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
    exports.coerce = coerce;
    exports.disable = disable;
    exports.enable = enable;
    exports.enabled = enabled;
    exports.humanize = __nccwpck_require__(554);
    
    /**
     * The currently active debug mode names, and names to skip.
     */
    
    exports.names = [];
    exports.skips = [];
    
    /**
     * Map of special "%n" handling functions, for the debug "format" argument.
     *
     * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
     */
    
    exports.formatters = {};
    
    /**
     * Previous log timestamp.
     */
    
    var prevTime;
    
    /**
     * Select a color.
     * @param {String} namespace
     * @return {Number}
     * @api private
     */
    
    function selectColor(namespace) {
      var hash = 0, i;
    
      for (i in namespace) {
        hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
    
      return exports.colors[Math.abs(hash) % exports.colors.length];
    }
    
    /**
     * Create a debugger with the given `namespace`.
     *
     * @param {String} namespace
     * @return {Function}
     * @api public
     */
    
    function createDebug(namespace) {
    
      function debug() {
        // disabled?
        if (!debug.enabled) return;
    
        var self = debug;
    
        // set `diff` timestamp
        var curr = +new Date();
        var ms = curr - (prevTime || curr);
        self.diff = ms;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
    
        // turn the `arguments` into a proper Array
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
    
        args[0] = exports.coerce(args[0]);
    
        if ('string' !== typeof args[0]) {
          // anything else let's inspect with %O
          args.unshift('%O');
        }
    
        // apply any `formatters` transformations
        var index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
          // if we encounter an escaped % then don't increase the array index
          if (match === '%%') return match;
          index++;
          var formatter = exports.formatters[format];
          if ('function' === typeof formatter) {
            var val = args[index];
            match = formatter.call(self, val);
    
            // now we need to remove `args[index]` since it's inlined in the `format`
            args.splice(index, 1);
            index--;
          }
          return match;
        });
    
        // apply env-specific formatting (colors, etc.)
        exports.formatArgs.call(self, args);
    
        var logFn = debug.log || exports.log || console.log.bind(console);
        logFn.apply(self, args);
      }
    
      debug.namespace = namespace;
      debug.enabled = exports.enabled(namespace);
      debug.useColors = exports.useColors();
      debug.color = selectColor(namespace);
    
      // env-specific initialization logic for debug instances
      if ('function' === typeof exports.init) {
        exports.init(debug);
      }
    
      return debug;
    }
    
    /**
     * Enables a debug mode by namespaces. This can include modes
     * separated by a colon and wildcards.
     *
     * @param {String} namespaces
     * @api public
     */
    
    function enable(namespaces) {
      exports.save(namespaces);
    
      exports.names = [];
      exports.skips = [];
    
      var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
      var len = split.length;
    
      for (var i = 0; i < len; i++) {
        if (!split[i]) continue; // ignore empty strings
        namespaces = split[i].replace(/\*/g, '.*?');
        if (namespaces[0] === '-') {
          exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
        } else {
          exports.names.push(new RegExp('^' + namespaces + '$'));
        }
      }
    }
    
    /**
     * Disable debug output.
     *
     * @api public
     */
    
    function disable() {
      exports.enable('');
    }
    
    /**
     * Returns true if the given mode name is enabled, false otherwise.
     *
     * @param {String} name
     * @return {Boolean}
     * @api public
     */
    
    function enabled(name) {
      var i, len;
      for (i = 0, len = exports.skips.length; i < len; i++) {
        if (exports.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = exports.names.length; i < len; i++) {
        if (exports.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    
    /**
     * Coerce `val`.
     *
     * @param {Mixed} val
     * @return {Mixed}
     * @api private
     */
    
    function coerce(val) {
      if (val instanceof Error) return val.stack || val.message;
      return val;
    }
    
    
    /***/ }),
    
    /***/ 352:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /**
     * Detect Electron renderer process, which is node, but we should
     * treat as a browser.
     */
    
    if (typeof process !== 'undefined' && process.type === 'renderer') {
      module.exports = __nccwpck_require__(430);
    } else {
      module.exports = __nccwpck_require__(379);
    }
    
    
    /***/ }),
    
    /***/ 379:
    /***/ ((module, exports, __nccwpck_require__) => {
    
    /**
     * Module dependencies.
     */
    
    var tty = __nccwpck_require__(867);
    var util = __nccwpck_require__(669);
    
    /**
     * This is the Node.js implementation of `debug()`.
     *
     * Expose `debug()` as the module.
     */
    
    exports = module.exports = __nccwpck_require__(575);
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    
    /**
     * Colors.
     */
    
    exports.colors = [6, 2, 3, 4, 5, 1];
    
    /**
     * Build up the default `inspectOpts` object from the environment variables.
     *
     *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
     */
    
    exports.inspectOpts = Object.keys(process.env).filter(function (key) {
      return /^debug_/i.test(key);
    }).reduce(function (obj, key) {
      // camel-case
      var prop = key
        .substring(6)
        .toLowerCase()
        .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });
    
      // coerce string value into JS value
      var val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
      else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
      else if (val === 'null') val = null;
      else val = Number(val);
    
      obj[prop] = val;
      return obj;
    }, {});
    
    /**
     * The file descriptor to write the `debug()` calls to.
     * Set the `DEBUG_FD` env variable to override with another value. i.e.:
     *
     *   $ DEBUG_FD=3 node script.js 3>debug.log
     */
    
    var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
    
    if (1 !== fd && 2 !== fd) {
      util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
    }
    
    var stream = 1 === fd ? process.stdout :
                 2 === fd ? process.stderr :
                 createWritableStdioStream(fd);
    
    /**
     * Is stdout a TTY? Colored output is enabled when `true`.
     */
    
    function useColors() {
      return 'colors' in exports.inspectOpts
        ? Boolean(exports.inspectOpts.colors)
        : tty.isatty(fd);
    }
    
    /**
     * Map %o to `util.inspect()`, all on a single line.
     */
    
    exports.formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts)
        .split('\n').map(function(str) {
          return str.trim()
        }).join(' ');
    };
    
    /**
     * Map %o to `util.inspect()`, allowing multiple lines if needed.
     */
    
    exports.formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
    
    /**
     * Adds ANSI color escape codes if enabled.
     *
     * @api public
     */
    
    function formatArgs(args) {
      var name = this.namespace;
      var useColors = this.useColors;
    
      if (useColors) {
        var c = this.color;
        var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';
    
        args[0] = prefix + args[0].split('\n').join('\n' + prefix);
        args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
      } else {
        args[0] = new Date().toUTCString()
          + ' ' + name + ' ' + args[0];
      }
    }
    
    /**
     * Invokes `util.format()` with the specified arguments and writes to `stream`.
     */
    
    function log() {
      return stream.write(util.format.apply(util, arguments) + '\n');
    }
    
    /**
     * Save `namespaces`.
     *
     * @param {String} namespaces
     * @api private
     */
    
    function save(namespaces) {
      if (null == namespaces) {
        // If you set a process.env field to null or undefined, it gets cast to the
        // string 'null' or 'undefined'. Just delete instead.
        delete process.env.DEBUG;
      } else {
        process.env.DEBUG = namespaces;
      }
    }
    
    /**
     * Load `namespaces`.
     *
     * @return {String} returns the previously persisted debug modes
     * @api private
     */
    
    function load() {
      return process.env.DEBUG;
    }
    
    /**
     * Copied from `node/src/node.js`.
     *
     * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
     * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
     */
    
    function createWritableStdioStream (fd) {
      var stream;
      var tty_wrap = process.binding('tty_wrap');
    
      // Note stream._type is used for test-module-load-list.js
    
      switch (tty_wrap.guessHandleType(fd)) {
        case 'TTY':
          stream = new tty.WriteStream(fd);
          stream._type = 'tty';
    
          // Hack to have stream not keep the event loop alive.
          // See https://github.com/joyent/node/issues/1726
          if (stream._handle && stream._handle.unref) {
            stream._handle.unref();
          }
          break;
    
        case 'FILE':
          var fs = __nccwpck_require__(747);
          stream = new fs.SyncWriteStream(fd, { autoClose: false });
          stream._type = 'fs';
          break;
    
        case 'PIPE':
        case 'TCP':
          var net = __nccwpck_require__(631);
          stream = new net.Socket({
            fd: fd,
            readable: false,
            writable: true
          });
    
          // FIXME Should probably have an option in net.Socket to create a
          // stream from an existing fd which is writable only. But for now
          // we'll just add this hack and set the `readable` member to false.
          // Test: ./node test/fixtures/echo.js < /etc/passwd
          stream.readable = false;
          stream.read = null;
          stream._type = 'pipe';
    
          // FIXME Hack to have stream not keep the event loop alive.
          // See https://github.com/joyent/node/issues/1726
          if (stream._handle && stream._handle.unref) {
            stream._handle.unref();
          }
          break;
    
        default:
          // Probably an error on in uv_guess_handle()
          throw new Error('Implement me. Unknown stream file type!');
      }
    
      // For supporting legacy API we put the FD here.
      stream.fd = fd;
    
      stream._isStdio = true;
    
      return stream;
    }
    
    /**
     * Init logic for `debug` instances.
     *
     * Create a new `inspectOpts` object in case `useColors` is set
     * differently for a particular `debug` instance.
     */
    
    function init (debug) {
      debug.inspectOpts = {};
    
      var keys = Object.keys(exports.inspectOpts);
      for (var i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    
    /**
     * Enable namespaces listed in `process.env.DEBUG` initially.
     */
    
    exports.enable(load());
    
    
    /***/ }),
    
    /***/ 100:
    /***/ ((module) => {
    
    module.exports      = isTypedArray
    isTypedArray.strict = isStrictTypedArray
    isTypedArray.loose  = isLooseTypedArray
    
    var toString = Object.prototype.toString
    var names = {
        '[object Int8Array]': true
      , '[object Int16Array]': true
      , '[object Int32Array]': true
      , '[object Uint8Array]': true
      , '[object Uint8ClampedArray]': true
      , '[object Uint16Array]': true
      , '[object Uint32Array]': true
      , '[object Float32Array]': true
      , '[object Float64Array]': true
    }
    
    function isTypedArray(arr) {
      return (
           isStrictTypedArray(arr)
        || isLooseTypedArray(arr)
      )
    }
    
    function isStrictTypedArray(arr) {
      return (
           arr instanceof Int8Array
        || arr instanceof Int16Array
        || arr instanceof Int32Array
        || arr instanceof Uint8Array
        || arr instanceof Uint8ClampedArray
        || arr instanceof Uint16Array
        || arr instanceof Uint32Array
        || arr instanceof Float32Array
        || arr instanceof Float64Array
      )
    }
    
    function isLooseTypedArray(arr) {
      return names[toString.call(arr)]
    }
    
    
    /***/ }),
    
    /***/ 554:
    /***/ ((module) => {
    
    /**
     * Helpers.
     */
    
    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var y = d * 365.25;
    
    /**
     * Parse or format the given `val`.
     *
     * Options:
     *
     *  - `long` verbose formatting [false]
     *
     * @param {String|Number} val
     * @param {Object} [options]
     * @throws {Error} throw an error if val is not a non-empty string or a number
     * @return {String|Number}
     * @api public
     */
    
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === 'string' && val.length > 0) {
        return parse(val);
      } else if (type === 'number' && isNaN(val) === false) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        'val is not a non-empty string or a valid number. val=' +
          JSON.stringify(val)
      );
    };
    
    /**
     * Parse the given `str` and return milliseconds.
     *
     * @param {String} str
     * @return {Number}
     * @api private
     */
    
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || 'ms').toLowerCase();
      switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
          return n * y;
        case 'days':
        case 'day':
        case 'd':
          return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
          return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
          return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
          return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
          return n;
        default:
          return undefined;
      }
    }
    
    /**
     * Short format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */
    
    function fmtShort(ms) {
      if (ms >= d) {
        return Math.round(ms / d) + 'd';
      }
      if (ms >= h) {
        return Math.round(ms / h) + 'h';
      }
      if (ms >= m) {
        return Math.round(ms / m) + 'm';
      }
      if (ms >= s) {
        return Math.round(ms / s) + 's';
      }
      return ms + 'ms';
    }
    
    /**
     * Long format for `ms`.
     *
     * @param {Number} ms
     * @return {String}
     * @api private
     */
    
    function fmtLong(ms) {
      return plural(ms, d, 'day') ||
        plural(ms, h, 'hour') ||
        plural(ms, m, 'minute') ||
        plural(ms, s, 'second') ||
        ms + ' ms';
    }
    
    /**
     * Pluralization helper.
     */
    
    function plural(ms, n, name) {
      if (ms < n) {
        return;
      }
      if (ms < n * 1.5) {
        return Math.floor(ms / n) + ' ' + name;
      }
      return Math.ceil(ms / n) + ' ' + name + 's';
    }
    
    
    /***/ }),
    
    /***/ 741:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /**
     * Convert a typed array to a Buffer without a copy
     *
     * Author:   Feross Aboukhadijeh <https://feross.org>
     * License:  MIT
     *
     * `npm install typedarray-to-buffer`
     */
    
    var isTypedArray = __nccwpck_require__(100).strict
    
    module.exports = function typedarrayToBuffer (arr) {
      if (isTypedArray(arr)) {
        // To avoid a copy, use the typed array's underlying ArrayBuffer to back new Buffer
        var buf = Buffer.from(arr.buffer)
        if (arr.byteLength !== arr.buffer.byteLength) {
          // Respect the "view", i.e. byteOffset and byteLength, without doing a copy
          buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
        }
        return buf
      } else {
        // Pass through all other types to `Buffer.from`
        return Buffer.from(arr)
      }
    }
    
    
    /***/ }),
    
    /***/ 816:
    /***/ ((module) => {
    
    "use strict";
    
    
    /**
     * Checks if a given buffer contains only correct UTF-8.
     * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
     * Markus Kuhn.
     *
     * @param {Buffer} buf The buffer to check
     * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
     * @public
     */
    const isValidUTF8 = (buf) => {
      var len = buf.length;
      var i = 0;
    
      while (i < len) {
        if (buf[i] < 0x80) {  // 0xxxxxxx
          i++;
        } else if ((buf[i] & 0xe0) === 0xc0) {  // 110xxxxx 10xxxxxx
          if (
            i + 1 === len ||
            (buf[i + 1] & 0xc0) !== 0x80 ||
            (buf[i] & 0xfe) === 0xc0  // overlong
          ) {
            return false;
          } else {
            i += 2;
          }
        } else if ((buf[i] & 0xf0) === 0xe0) {  // 1110xxxx 10xxxxxx 10xxxxxx
          if (
            i + 2 >= len ||
            (buf[i + 1] & 0xc0) !== 0x80 ||
            (buf[i + 2] & 0xc0) !== 0x80 ||
            buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80 ||  // overlong
            buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0     // surrogate (U+D800 - U+DFFF)
          ) {
            return false;
          } else {
            i += 3;
          }
        } else if ((buf[i] & 0xf8) === 0xf0) {  // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
          if (
            i + 3 >= len ||
            (buf[i + 1] & 0xc0) !== 0x80 ||
            (buf[i + 2] & 0xc0) !== 0x80 ||
            (buf[i + 3] & 0xc0) !== 0x80 ||
            buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80 ||  // overlong
            buf[i] === 0xf4 && buf[i + 1] > 0x8f || buf[i] > 0xf4  // > U+10FFFF
          ) {
            return false;
          } else {
            i += 4;
          }
        } else {
          return false;
        }
      }
    
      return true;
    };
    
    module.exports = isValidUTF8;
    
    
    /***/ }),
    
    /***/ 728:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    "use strict";
    
    
    try {
      module.exports = require(__nccwpck_require__.ab + "prebuilds/win32-x64/node.napi1.node");
    } catch (e) {
      module.exports = __nccwpck_require__(816);
    }
    
    
    /***/ }),
    
    /***/ 35:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    module.exports = __nccwpck_require__(149);
    
    /***/ }),
    
    /***/ 217:
    /***/ ((module) => {
    
    /************************************************************************
     *  Copyright 2010-2015 Brian McKelvey.
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     ***********************************************************************/
    
    var Deprecation = {
        disableWarnings: false,
    
        deprecationWarningMap: {
    
        },
    
        warn: function(deprecationName) {
            if (!this.disableWarnings && this.deprecationWarningMap[deprecationName]) {
                console.warn('DEPRECATION WARNING: ' + this.deprecationWarningMap[deprecationName]);
                this.deprecationWarningMap[deprecationName] = false;
            }
        }
    };
    
    module.exports = Deprecation;
    
    
    /***/ }),
    
    /***/ 340:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /************************************************************************
     *  Copyright 2010-2015 Brian McKelvey.
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     ***********************************************************************/
    
    var WebSocketClient = __nccwpck_require__(912);
    var toBuffer = __nccwpck_require__(741);
    var yaeti = __nccwpck_require__(776);
    
    
    const CONNECTING = 0;
    const OPEN = 1;
    const CLOSING = 2;
    const CLOSED = 3;
    
    
    module.exports = W3CWebSocket;
    
    
    function W3CWebSocket(url, protocols, origin, headers, requestOptions, clientConfig) {
        // Make this an EventTarget.
        yaeti.EventTarget.call(this);
    
        // Sanitize clientConfig.
        clientConfig = clientConfig || {};
        clientConfig.assembleFragments = true;  // Required in the W3C API.
    
        var self = this;
    
        this._url = url;
        this._readyState = CONNECTING;
        this._protocol = undefined;
        this._extensions = '';
        this._bufferedAmount = 0;  // Hack, always 0.
        this._binaryType = 'arraybuffer';  // TODO: Should be 'blob' by default, but Node has no Blob.
    
        // The WebSocketConnection instance.
        this._connection = undefined;
    
        // WebSocketClient instance.
        this._client = new WebSocketClient(clientConfig);
    
        this._client.on('connect', function(connection) {
            onConnect.call(self, connection);
        });
    
        this._client.on('connectFailed', function() {
            onConnectFailed.call(self);
        });
    
        this._client.connect(url, protocols, origin, headers, requestOptions);
    }
    
    
    // Expose W3C read only attributes.
    Object.defineProperties(W3CWebSocket.prototype, {
        url:            { get: function() { return this._url;            } },
        readyState:     { get: function() { return this._readyState;     } },
        protocol:       { get: function() { return this._protocol;       } },
        extensions:     { get: function() { return this._extensions;     } },
        bufferedAmount: { get: function() { return this._bufferedAmount; } }
    });
    
    
    // Expose W3C write/read attributes.
    Object.defineProperties(W3CWebSocket.prototype, {
        binaryType: {
            get: function() {
                return this._binaryType;
            },
            set: function(type) {
                // TODO: Just 'arraybuffer' supported.
                if (type !== 'arraybuffer') {
                    throw new SyntaxError('just "arraybuffer" type allowed for "binaryType" attribute');
                }
                this._binaryType = type;
            }
        }
    });
    
    
    // Expose W3C readyState constants into the WebSocket instance as W3C states.
    [['CONNECTING',CONNECTING], ['OPEN',OPEN], ['CLOSING',CLOSING], ['CLOSED',CLOSED]].forEach(function(property) {
        Object.defineProperty(W3CWebSocket.prototype, property[0], {
            get: function() { return property[1]; }
        });
    });
    
    // Also expose W3C readyState constants into the WebSocket class (not defined by the W3C,
    // but there are so many libs relying on them).
    [['CONNECTING',CONNECTING], ['OPEN',OPEN], ['CLOSING',CLOSING], ['CLOSED',CLOSED]].forEach(function(property) {
        Object.defineProperty(W3CWebSocket, property[0], {
            get: function() { return property[1]; }
        });
    });
    
    
    W3CWebSocket.prototype.send = function(data) {
        if (this._readyState !== OPEN) {
            throw new Error('cannot call send() while not connected');
        }
    
        // Text.
        if (typeof data === 'string' || data instanceof String) {
            this._connection.sendUTF(data);
        }
        // Binary.
        else {
            // Node Buffer.
            if (data instanceof Buffer) {
                this._connection.sendBytes(data);
            }
            // If ArrayBuffer or ArrayBufferView convert it to Node Buffer.
            else if (data.byteLength || data.byteLength === 0) {
                data = toBuffer(data);
                this._connection.sendBytes(data);
            }
            else {
                throw new Error('unknown binary data:', data);
            }
        }
    };
    
    
    W3CWebSocket.prototype.close = function(code, reason) {
        switch(this._readyState) {
            case CONNECTING:
                // NOTE: We don't have the WebSocketConnection instance yet so no
                // way to close the TCP connection.
                // Artificially invoke the onConnectFailed event.
                onConnectFailed.call(this);
                // And close if it connects after a while.
                this._client.on('connect', function(connection) {
                    if (code) {
                        connection.close(code, reason);
                    } else {
                        connection.close();
                    }
                });
                break;
            case OPEN:
                this._readyState = CLOSING;
                if (code) {
                    this._connection.close(code, reason);
                } else {
                    this._connection.close();
                }
                break;
            case CLOSING:
            case CLOSED:
                break;
        }
    };
    
    
    /**
     * Private API.
     */
    
    
    function createCloseEvent(code, reason) {
        var event = new yaeti.Event('close');
    
        event.code = code;
        event.reason = reason;
        event.wasClean = (typeof code === 'undefined' || code === 1000);
    
        return event;
    }
    
    
    function createMessageEvent(data) {
        var event = new yaeti.Event('message');
    
        event.data = data;
    
        return event;
    }
    
    
    function onConnect(connection) {
        var self = this;
    
        this._readyState = OPEN;
        this._connection = connection;
        this._protocol = connection.protocol;
        this._extensions = connection.extensions;
    
        this._connection.on('close', function(code, reason) {
            onClose.call(self, code, reason);
        });
    
        this._connection.on('message', function(msg) {
            onMessage.call(self, msg);
        });
    
        this.dispatchEvent(new yaeti.Event('open'));
    }
    
    
    function onConnectFailed() {
        destroy.call(this);
        this._readyState = CLOSED;
    
        try {
            this.dispatchEvent(new yaeti.Event('error'));
        } finally {
            this.dispatchEvent(createCloseEvent(1006, 'connection failed'));
        }
    }
    
    
    function onClose(code, reason) {
        destroy.call(this);
        this._readyState = CLOSED;
    
        this.dispatchEvent(createCloseEvent(code, reason || ''));
    }
    
    
    function onMessage(message) {
        if (message.utf8Data) {
            this.dispatchEvent(createMessageEvent(message.utf8Data));
        }
        else if (message.binaryData) {
            // Must convert from Node Buffer to ArrayBuffer.
            // TODO: or to a Blob (which does not exist in Node!).
            if (this.binaryType === 'arraybuffer') {
                var buffer = message.binaryData;
                var arraybuffer = new ArrayBuffer(buffer.length);
                var view = new Uint8Array(arraybuffer);
                for (var i=0, len=buffer.length; i<len; ++i) {
                    view[i] = buffer[i];
                }
                this.dispatchEvent(createMessageEvent(arraybuffer));
            }
        }
    }
    
    
    function destroy() {
        this._client.removeAllListeners();
        if (this._connection) {
            this._connection.removeAllListeners();
        }
    }
    
    
    /***/ }),
    
    /***/ 912:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /************************************************************************
     *  Copyright 2010-2015 Brian McKelvey.
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     ***********************************************************************/
    
    var utils = __nccwpck_require__(197);
    var extend = utils.extend;
    var util = __nccwpck_require__(669);
    var EventEmitter = __nccwpck_require__(614).EventEmitter;
    var http = __nccwpck_require__(605);
    var https = __nccwpck_require__(211);
    var url = __nccwpck_require__(835);
    var crypto = __nccwpck_require__(417);
    var WebSocketConnection = __nccwpck_require__(737);
    var bufferAllocUnsafe = utils.bufferAllocUnsafe;
    
    var protocolSeparators = [
        '(', ')', '<', '>', '@',
        ',', ';', ':', '\\', '\"',
        '/', '[', ']', '?', '=',
        '{', '}', ' ', String.fromCharCode(9)
    ];
    
    var excludedTlsOptions = ['hostname','port','method','path','headers'];
    
    function WebSocketClient(config) {
        // Superclass Constructor
        EventEmitter.call(this);
    
        // TODO: Implement extensions
    
        this.config = {
            // 1MiB max frame size.
            maxReceivedFrameSize: 0x100000,
    
            // 8MiB max message size, only applicable if
            // assembleFragments is true
            maxReceivedMessageSize: 0x800000,
    
            // Outgoing messages larger than fragmentationThreshold will be
            // split into multiple fragments.
            fragmentOutgoingMessages: true,
    
            // Outgoing frames are fragmented if they exceed this threshold.
            // Default is 16KiB
            fragmentationThreshold: 0x4000,
    
            // Which version of the protocol to use for this session.  This
            // option will be removed once the protocol is finalized by the IETF
            // It is only available to ease the transition through the
            // intermediate draft protocol versions.
            // At present, it only affects the name of the Origin header.
            webSocketVersion: 13,
    
            // If true, fragmented messages will be automatically assembled
            // and the full message will be emitted via a 'message' event.
            // If false, each frame will be emitted via a 'frame' event and
            // the application will be responsible for aggregating multiple
            // fragmented frames.  Single-frame messages will emit a 'message'
            // event in addition to the 'frame' event.
            // Most users will want to leave this set to 'true'
            assembleFragments: true,
    
            // The Nagle Algorithm makes more efficient use of network resources
            // by introducing a small delay before sending small packets so that
            // multiple messages can be batched together before going onto the
            // wire.  This however comes at the cost of latency, so the default
            // is to disable it.  If you don't need low latency and are streaming
            // lots of small messages, you can change this to 'false'
            disableNagleAlgorithm: true,
    
            // The number of milliseconds to wait after sending a close frame
            // for an acknowledgement to come back before giving up and just
            // closing the socket.
            closeTimeout: 5000,
    
            // Options to pass to https.connect if connecting via TLS
            tlsOptions: {}
        };
    
        if (config) {
            var tlsOptions;
            if (config.tlsOptions) {
              tlsOptions = config.tlsOptions;
              delete config.tlsOptions;
            }
            else {
              tlsOptions = {};
            }
            extend(this.config, config);
            extend(this.config.tlsOptions, tlsOptions);
        }
    
        this._req = null;
        
        switch (this.config.webSocketVersion) {
            case 8:
            case 13:
                break;
            default:
                throw new Error('Requested webSocketVersion is not supported. Allowed values are 8 and 13.');
        }
    }
    
    util.inherits(WebSocketClient, EventEmitter);
    
    WebSocketClient.prototype.connect = function(requestUrl, protocols, origin, headers, extraRequestOptions) {
        var self = this;
        
        if (typeof(protocols) === 'string') {
            if (protocols.length > 0) {
                protocols = [protocols];
            }
            else {
                protocols = [];
            }
        }
        if (!(protocols instanceof Array)) {
            protocols = [];
        }
        this.protocols = protocols;
        this.origin = origin;
    
        if (typeof(requestUrl) === 'string') {
            this.url = url.parse(requestUrl);
        }
        else {
            this.url = requestUrl; // in case an already parsed url is passed in.
        }
        if (!this.url.protocol) {
            throw new Error('You must specify a full WebSocket URL, including protocol.');
        }
        if (!this.url.host) {
            throw new Error('You must specify a full WebSocket URL, including hostname. Relative URLs are not supported.');
        }
    
        this.secure = (this.url.protocol === 'wss:');
    
        // validate protocol characters:
        this.protocols.forEach(function(protocol) {
            for (var i=0; i < protocol.length; i ++) {
                var charCode = protocol.charCodeAt(i);
                var character = protocol.charAt(i);
                if (charCode < 0x0021 || charCode > 0x007E || protocolSeparators.indexOf(character) !== -1) {
                    throw new Error('Protocol list contains invalid character "' + String.fromCharCode(charCode) + '"');
                }
            }
        });
    
        var defaultPorts = {
            'ws:': '80',
            'wss:': '443'
        };
    
        if (!this.url.port) {
            this.url.port = defaultPorts[this.url.protocol];
        }
    
        var nonce = bufferAllocUnsafe(16);
        for (var i=0; i < 16; i++) {
            nonce[i] = Math.round(Math.random()*0xFF);
        }
        this.base64nonce = nonce.toString('base64');
    
        var hostHeaderValue = this.url.hostname;
        if ((this.url.protocol === 'ws:' && this.url.port !== '80') ||
            (this.url.protocol === 'wss:' && this.url.port !== '443'))  {
            hostHeaderValue += (':' + this.url.port);
        }
    
        var reqHeaders = {};
        if (this.secure && this.config.tlsOptions.hasOwnProperty('headers')) {
          // Allow for additional headers to be provided when connecting via HTTPS
          extend(reqHeaders, this.config.tlsOptions.headers);
        }
        if (headers) {
          // Explicitly provided headers take priority over any from tlsOptions
          extend(reqHeaders, headers);
        }
        extend(reqHeaders, {
            'Upgrade': 'websocket',
            'Connection': 'Upgrade',
            'Sec-WebSocket-Version': this.config.webSocketVersion.toString(10),
            'Sec-WebSocket-Key': this.base64nonce,
            'Host': reqHeaders.Host || hostHeaderValue
        });
    
        if (this.protocols.length > 0) {
            reqHeaders['Sec-WebSocket-Protocol'] = this.protocols.join(', ');
        }
        if (this.origin) {
            if (this.config.webSocketVersion === 13) {
                reqHeaders['Origin'] = this.origin;
            }
            else if (this.config.webSocketVersion === 8) {
                reqHeaders['Sec-WebSocket-Origin'] = this.origin;
            }
        }
    
        // TODO: Implement extensions
    
        var pathAndQuery;
        // Ensure it begins with '/'.
        if (this.url.pathname) {
            pathAndQuery = this.url.path;
        }
        else if (this.url.path) {
            pathAndQuery = '/' + this.url.path;
        }
        else {
            pathAndQuery = '/';
        }
    
        function handleRequestError(error) {
            self._req = null;
            self.emit('connectFailed', error);
        }
    
        var requestOptions = {
            agent: false
        };
        if (extraRequestOptions) {
            extend(requestOptions, extraRequestOptions);
        }
        // These options are always overridden by the library.  The user is not
        // allowed to specify these directly.
        extend(requestOptions, {
            hostname: this.url.hostname,
            port: this.url.port,
            method: 'GET',
            path: pathAndQuery,
            headers: reqHeaders
        });
        if (this.secure) {
            var tlsOptions = this.config.tlsOptions;
            for (var key in tlsOptions) {
                if (tlsOptions.hasOwnProperty(key) && excludedTlsOptions.indexOf(key) === -1) {
                    requestOptions[key] = tlsOptions[key];
                }
            }
        }
    
        var req = this._req = (this.secure ? https : http).request(requestOptions);
        req.on('upgrade', function handleRequestUpgrade(response, socket, head) {
            self._req = null;
            req.removeListener('error', handleRequestError);
            self.socket = socket;
            self.response = response;
            self.firstDataChunk = head;
            self.validateHandshake();
        });
        req.on('error', handleRequestError);
    
        req.on('response', function(response) {
            self._req = null;
            if (utils.eventEmitterListenerCount(self, 'httpResponse') > 0) {
                self.emit('httpResponse', response, self);
                if (response.socket) {
                    response.socket.end();
                }
            }
            else {
                var headerDumpParts = [];
                for (var headerName in response.headers) {
                    headerDumpParts.push(headerName + ': ' + response.headers[headerName]);
                }
                self.failHandshake(
                    'Server responded with a non-101 status: ' +
                    response.statusCode + ' ' + response.statusMessage +
                    '\nResponse Headers Follow:\n' +
                    headerDumpParts.join('\n') + '\n'
                );
            }
        });
        req.end();
    };
    
    WebSocketClient.prototype.validateHandshake = function() {
        var headers = this.response.headers;
    
        if (this.protocols.length > 0) {
            this.protocol = headers['sec-websocket-protocol'];
            if (this.protocol) {
                if (this.protocols.indexOf(this.protocol) === -1) {
                    this.failHandshake('Server did not respond with a requested protocol.');
                    return;
                }
            }
            else {
                this.failHandshake('Expected a Sec-WebSocket-Protocol header.');
                return;
            }
        }
    
        if (!(headers['connection'] && headers['connection'].toLocaleLowerCase() === 'upgrade')) {
            this.failHandshake('Expected a Connection: Upgrade header from the server');
            return;
        }
    
        if (!(headers['upgrade'] && headers['upgrade'].toLocaleLowerCase() === 'websocket')) {
            this.failHandshake('Expected an Upgrade: websocket header from the server');
            return;
        }
    
        var sha1 = crypto.createHash('sha1');
        sha1.update(this.base64nonce + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
        var expectedKey = sha1.digest('base64');
    
        if (!headers['sec-websocket-accept']) {
            this.failHandshake('Expected Sec-WebSocket-Accept header from server');
            return;
        }
    
        if (headers['sec-websocket-accept'] !== expectedKey) {
            this.failHandshake('Sec-WebSocket-Accept header from server didn\'t match expected value of ' + expectedKey);
            return;
        }
    
        // TODO: Support extensions
    
        this.succeedHandshake();
    };
    
    WebSocketClient.prototype.failHandshake = function(errorDescription) {
        if (this.socket && this.socket.writable) {
            this.socket.end();
        }
        this.emit('connectFailed', new Error(errorDescription));
    };
    
    WebSocketClient.prototype.succeedHandshake = function() {
        var connection = new WebSocketConnection(this.socket, [], this.protocol, true, this.config);
    
        connection.webSocketVersion = this.config.webSocketVersion;
        connection._addSocketEventListeners();
    
        this.emit('connect', connection);
        if (this.firstDataChunk.length > 0) {
            connection.handleSocketData(this.firstDataChunk);
        }
        this.firstDataChunk = null;
    };
    
    WebSocketClient.prototype.abort = function() {
        if (this._req) {
            this._req.abort();
        }
    };
    
    module.exports = WebSocketClient;
    
    
    /***/ }),
    
    /***/ 737:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /************************************************************************
     *  Copyright 2010-2015 Brian McKelvey.
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     ***********************************************************************/
    
    var util = __nccwpck_require__(669);
    var utils = __nccwpck_require__(197);
    var EventEmitter = __nccwpck_require__(614).EventEmitter;
    var WebSocketFrame = __nccwpck_require__(224);
    var BufferList = __nccwpck_require__(60);
    var isValidUTF8 = __nccwpck_require__(728);
    var bufferAllocUnsafe = utils.bufferAllocUnsafe;
    var bufferFromString = utils.bufferFromString;
    
    // Connected, fully-open, ready to send and receive frames
    const STATE_OPEN = 'open';
    // Received a close frame from the remote peer
    const STATE_PEER_REQUESTED_CLOSE = 'peer_requested_close';
    // Sent close frame to remote peer.  No further data can be sent.
    const STATE_ENDING = 'ending';
    // Connection is fully closed.  No further data can be sent or received.
    const STATE_CLOSED = 'closed';
    
    var setImmediateImpl = ('setImmediate' in global) ?
                                global.setImmediate.bind(global) :
                                process.nextTick.bind(process);
    
    var idCounter = 0;
    
    function WebSocketConnection(socket, extensions, protocol, maskOutgoingPackets, config) {
        this._debug = utils.BufferingLogger('websocket:connection', ++idCounter);
        this._debug('constructor');
        
        if (this._debug.enabled) {
            instrumentSocketForDebugging(this, socket);
        }
        
        // Superclass Constructor
        EventEmitter.call(this);
    
        this._pingListenerCount = 0;
        this.on('newListener', function(ev) {
            if (ev === 'ping'){
                this._pingListenerCount++;
            }
          }).on('removeListener', function(ev) {
            if (ev === 'ping') {
                this._pingListenerCount--;
            }
        });
    
        this.config = config;
        this.socket = socket;
        this.protocol = protocol;
        this.extensions = extensions;
        this.remoteAddress = socket.remoteAddress;
        this.closeReasonCode = -1;
        this.closeDescription = null;
        this.closeEventEmitted = false;
    
        // We have to mask outgoing packets if we're acting as a WebSocket client.
        this.maskOutgoingPackets = maskOutgoingPackets;
    
        // We re-use the same buffers for the mask and frame header for all frames
        // received on each connection to avoid a small memory allocation for each
        // frame.
        this.maskBytes = bufferAllocUnsafe(4);
        this.frameHeader = bufferAllocUnsafe(10);
    
        // the BufferList will handle the data streaming in
        this.bufferList = new BufferList();
    
        // Prepare for receiving first frame
        this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
        this.fragmentationSize = 0; // data received so far...
        this.frameQueue = [];
        
        // Various bits of connection state
        this.connected = true;
        this.state = STATE_OPEN;
        this.waitingForCloseResponse = false;
        // Received TCP FIN, socket's readable stream is finished.
        this.receivedEnd = false;
    
        this.closeTimeout = this.config.closeTimeout;
        this.assembleFragments = this.config.assembleFragments;
        this.maxReceivedMessageSize = this.config.maxReceivedMessageSize;
    
        this.outputBufferFull = false;
        this.inputPaused = false;
        this.receivedDataHandler = this.processReceivedData.bind(this);
        this._closeTimerHandler = this.handleCloseTimer.bind(this);
    
        // Disable nagle algorithm?
        this.socket.setNoDelay(this.config.disableNagleAlgorithm);
    
        // Make sure there is no socket inactivity timeout
        this.socket.setTimeout(0);
    
        if (this.config.keepalive && !this.config.useNativeKeepalive) {
            if (typeof(this.config.keepaliveInterval) !== 'number') {
                throw new Error('keepaliveInterval must be specified and numeric ' +
                                'if keepalive is true.');
            }
            this._keepaliveTimerHandler = this.handleKeepaliveTimer.bind(this);
            this.setKeepaliveTimer();
    
            if (this.config.dropConnectionOnKeepaliveTimeout) {
                if (typeof(this.config.keepaliveGracePeriod) !== 'number') {
                    throw new Error('keepaliveGracePeriod  must be specified and ' +
                                    'numeric if dropConnectionOnKeepaliveTimeout ' +
                                    'is true.');
                }
                this._gracePeriodTimerHandler = this.handleGracePeriodTimer.bind(this);
            }
        }
        else if (this.config.keepalive && this.config.useNativeKeepalive) {
            if (!('setKeepAlive' in this.socket)) {
                throw new Error('Unable to use native keepalive: unsupported by ' +
                                'this version of Node.');
            }
            this.socket.setKeepAlive(true, this.config.keepaliveInterval);
        }
        
        // The HTTP Client seems to subscribe to socket error events
        // and re-dispatch them in such a way that doesn't make sense
        // for users of our client, so we want to make sure nobody
        // else is listening for error events on the socket besides us.
        this.socket.removeAllListeners('error');
    }
    
    WebSocketConnection.CLOSE_REASON_NORMAL = 1000;
    WebSocketConnection.CLOSE_REASON_GOING_AWAY = 1001;
    WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR = 1002;
    WebSocketConnection.CLOSE_REASON_UNPROCESSABLE_INPUT = 1003;
    WebSocketConnection.CLOSE_REASON_RESERVED = 1004; // Reserved value.  Undefined meaning.
    WebSocketConnection.CLOSE_REASON_NOT_PROVIDED = 1005; // Not to be used on the wire
    WebSocketConnection.CLOSE_REASON_ABNORMAL = 1006; // Not to be used on the wire
    WebSocketConnection.CLOSE_REASON_INVALID_DATA = 1007;
    WebSocketConnection.CLOSE_REASON_POLICY_VIOLATION = 1008;
    WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG = 1009;
    WebSocketConnection.CLOSE_REASON_EXTENSION_REQUIRED = 1010;
    WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR = 1011;
    WebSocketConnection.CLOSE_REASON_TLS_HANDSHAKE_FAILED = 1015; // Not to be used on the wire
    
    WebSocketConnection.CLOSE_DESCRIPTIONS = {
        1000: 'Normal connection closure',
        1001: 'Remote peer is going away',
        1002: 'Protocol error',
        1003: 'Unprocessable input',
        1004: 'Reserved',
        1005: 'Reason not provided',
        1006: 'Abnormal closure, no further detail available',
        1007: 'Invalid data received',
        1008: 'Policy violation',
        1009: 'Message too big',
        1010: 'Extension requested by client is required',
        1011: 'Internal Server Error',
        1015: 'TLS Handshake Failed'
    };
    
    function validateCloseReason(code) {
        if (code < 1000) {
            // Status codes in the range 0-999 are not used
            return false;
        }
        if (code >= 1000 && code <= 2999) {
            // Codes from 1000 - 2999 are reserved for use by the protocol.  Only
            // a few codes are defined, all others are currently illegal.
            return [1000, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015].indexOf(code) !== -1;
        }
        if (code >= 3000 && code <= 3999) {
            // Reserved for use by libraries, frameworks, and applications.
            // Should be registered with IANA.  Interpretation of these codes is
            // undefined by the WebSocket protocol.
            return true;
        }
        if (code >= 4000 && code <= 4999) {
            // Reserved for private use.  Interpretation of these codes is
            // undefined by the WebSocket protocol.
            return true;
        }
        if (code >= 5000) {
            return false;
        }
    }
    
    util.inherits(WebSocketConnection, EventEmitter);
    
    WebSocketConnection.prototype._addSocketEventListeners = function() {
        this.socket.on('error', this.handleSocketError.bind(this));
        this.socket.on('end', this.handleSocketEnd.bind(this));
        this.socket.on('close', this.handleSocketClose.bind(this));
        this.socket.on('drain', this.handleSocketDrain.bind(this));
        this.socket.on('pause', this.handleSocketPause.bind(this));
        this.socket.on('resume', this.handleSocketResume.bind(this));
        this.socket.on('data', this.handleSocketData.bind(this));
    };
    
    // set or reset the keepalive timer when data is received.
    WebSocketConnection.prototype.setKeepaliveTimer = function() {
        this._debug('setKeepaliveTimer');
        if (!this.config.keepalive  || this.config.useNativeKeepalive) { return; }
        this.clearKeepaliveTimer();
        this.clearGracePeriodTimer();
        this._keepaliveTimeoutID = setTimeout(this._keepaliveTimerHandler, this.config.keepaliveInterval);
    };
    
    WebSocketConnection.prototype.clearKeepaliveTimer = function() {
        if (this._keepaliveTimeoutID) {
            clearTimeout(this._keepaliveTimeoutID);
        }
    };
    
    // No data has been received within config.keepaliveTimeout ms.
    WebSocketConnection.prototype.handleKeepaliveTimer = function() {
        this._debug('handleKeepaliveTimer');
        this._keepaliveTimeoutID = null;
        this.ping();
    
        // If we are configured to drop connections if the client doesn't respond
        // then set the grace period timer.
        if (this.config.dropConnectionOnKeepaliveTimeout) {
            this.setGracePeriodTimer();
        }
        else {
            // Otherwise reset the keepalive timer to send the next ping.
            this.setKeepaliveTimer();
        }
    };
    
    WebSocketConnection.prototype.setGracePeriodTimer = function() {
        this._debug('setGracePeriodTimer');
        this.clearGracePeriodTimer();
        this._gracePeriodTimeoutID = setTimeout(this._gracePeriodTimerHandler, this.config.keepaliveGracePeriod);
    };
    
    WebSocketConnection.prototype.clearGracePeriodTimer = function() {
        if (this._gracePeriodTimeoutID) {
            clearTimeout(this._gracePeriodTimeoutID);
        }
    };
    
    WebSocketConnection.prototype.handleGracePeriodTimer = function() {
        this._debug('handleGracePeriodTimer');
        // If this is called, the client has not responded and is assumed dead.
        this._gracePeriodTimeoutID = null;
        this.drop(WebSocketConnection.CLOSE_REASON_ABNORMAL, 'Peer not responding.', true);
    };
    
    WebSocketConnection.prototype.handleSocketData = function(data) {
        this._debug('handleSocketData');
        // Reset the keepalive timer when receiving data of any kind.
        this.setKeepaliveTimer();
    
        // Add received data to our bufferList, which efficiently holds received
        // data chunks in a linked list of Buffer objects.
        this.bufferList.write(data);
    
        this.processReceivedData();
    };
    
    WebSocketConnection.prototype.processReceivedData = function() {
        this._debug('processReceivedData');
        // If we're not connected, we should ignore any data remaining on the buffer.
        if (!this.connected) { return; }
    
        // Receiving/parsing is expected to be halted when paused.
        if (this.inputPaused) { return; }
    
        var frame = this.currentFrame;
    
        // WebSocketFrame.prototype.addData returns true if all data necessary to
        // parse the frame was available.  It returns false if we are waiting for
        // more data to come in on the wire.
        if (!frame.addData(this.bufferList)) { this._debug('-- insufficient data for frame'); return; }
    
        var self = this;
    
        // Handle possible parsing errors
        if (frame.protocolError) {
            // Something bad happened.. get rid of this client.
            this._debug('-- protocol error');
            process.nextTick(function() {
                self.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR, frame.dropReason);
            });
            return;
        }
        else if (frame.frameTooLarge) {
            this._debug('-- frame too large');
            process.nextTick(function() {
                self.drop(WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG, frame.dropReason);
            });
            return;
        }
    
        // For now since we don't support extensions, all RSV bits are illegal
        if (frame.rsv1 || frame.rsv2 || frame.rsv3) {
            this._debug('-- illegal rsv flag');
            process.nextTick(function() {
                self.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                  'Unsupported usage of rsv bits without negotiated extension.');
            });
            return;
        }
    
        if (!this.assembleFragments) {
            this._debug('-- emitting frame');
            process.nextTick(function() { self.emit('frame', frame); });
        }
    
        process.nextTick(function() { self.processFrame(frame); });
        
        this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    
        // If there's data remaining, schedule additional processing, but yield
        // for now so that other connections have a chance to have their data
        // processed.  We use setImmediate here instead of process.nextTick to
        // explicitly indicate that we wish for other I/O to be handled first.
        if (this.bufferList.length > 0) {
            setImmediateImpl(this.receivedDataHandler);
        }
    };
    
    WebSocketConnection.prototype.handleSocketError = function(error) {
        this._debug('handleSocketError: %j', error);
        if (this.state === STATE_CLOSED) {
            // See https://github.com/theturtle32/WebSocket-Node/issues/288
            this._debug('  --- Socket \'error\' after \'close\'');
            return;
        }
        this.closeReasonCode = WebSocketConnection.CLOSE_REASON_ABNORMAL;
        this.closeDescription = 'Socket Error: ' + error.syscall + ' ' + error.code;
        this.connected = false;
        this.state = STATE_CLOSED;
        this.fragmentationSize = 0;
        if (utils.eventEmitterListenerCount(this, 'error') > 0) {
            this.emit('error', error);
        }
        this.socket.destroy();
        this._debug.printOutput();
    };
    
    WebSocketConnection.prototype.handleSocketEnd = function() {
        this._debug('handleSocketEnd: received socket end.  state = %s', this.state);
        this.receivedEnd = true;
        if (this.state === STATE_CLOSED) {
            // When using the TLS module, sometimes the socket will emit 'end'
            // after it emits 'close'.  I don't think that's correct behavior,
            // but we should deal with it gracefully by ignoring it.
            this._debug('  --- Socket \'end\' after \'close\'');
            return;
        }
        if (this.state !== STATE_PEER_REQUESTED_CLOSE &&
            this.state !== STATE_ENDING) {
          this._debug('  --- UNEXPECTED socket end.');
          this.socket.end();
        }
    };
    
    WebSocketConnection.prototype.handleSocketClose = function(hadError) {
        this._debug('handleSocketClose: received socket close');
        this.socketHadError = hadError;
        this.connected = false;
        this.state = STATE_CLOSED;
        // If closeReasonCode is still set to -1 at this point then we must
        // not have received a close frame!!
        if (this.closeReasonCode === -1) {
            this.closeReasonCode = WebSocketConnection.CLOSE_REASON_ABNORMAL;
            this.closeDescription = 'Connection dropped by remote peer.';
        }
        this.clearCloseTimer();
        this.clearKeepaliveTimer();
        this.clearGracePeriodTimer();
        if (!this.closeEventEmitted) {
            this.closeEventEmitted = true;
            this._debug('-- Emitting WebSocketConnection close event');
            this.emit('close', this.closeReasonCode, this.closeDescription);
        }
    };
    
    WebSocketConnection.prototype.handleSocketDrain = function() {
        this._debug('handleSocketDrain: socket drain event');
        this.outputBufferFull = false;
        this.emit('drain');
    };
    
    WebSocketConnection.prototype.handleSocketPause = function() {
        this._debug('handleSocketPause: socket pause event');
        this.inputPaused = true;
        this.emit('pause');
    };
    
    WebSocketConnection.prototype.handleSocketResume = function() {
        this._debug('handleSocketResume: socket resume event');
        this.inputPaused = false;
        this.emit('resume');
        this.processReceivedData();
    };
    
    WebSocketConnection.prototype.pause = function() {
        this._debug('pause: pause requested');
        this.socket.pause();
    };
    
    WebSocketConnection.prototype.resume = function() {
        this._debug('resume: resume requested');
        this.socket.resume();
    };
    
    WebSocketConnection.prototype.close = function(reasonCode, description) {
        if (this.connected) {
            this._debug('close: Initating clean WebSocket close sequence.');
            if ('number' !== typeof reasonCode) {
                reasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
            }
            if (!validateCloseReason(reasonCode)) {
                throw new Error('Close code ' + reasonCode + ' is not valid.');
            }
            if ('string' !== typeof description) {
                description = WebSocketConnection.CLOSE_DESCRIPTIONS[reasonCode];
            }
            this.closeReasonCode = reasonCode;
            this.closeDescription = description;
            this.setCloseTimer();
            this.sendCloseFrame(this.closeReasonCode, this.closeDescription);
            this.state = STATE_ENDING;
            this.connected = false;
        }
    };
    
    WebSocketConnection.prototype.drop = function(reasonCode, description, skipCloseFrame) {
        this._debug('drop');
        if (typeof(reasonCode) !== 'number') {
            reasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
        }
    
        if (typeof(description) !== 'string') {
            // If no description is provided, try to look one up based on the
            // specified reasonCode.
            description = WebSocketConnection.CLOSE_DESCRIPTIONS[reasonCode];
        }
    
        this._debug('Forcefully dropping connection. skipCloseFrame: %s, code: %d, description: %s',
            skipCloseFrame, reasonCode, description
        );
    
        this.closeReasonCode = reasonCode;
        this.closeDescription = description;
        this.frameQueue = [];
        this.fragmentationSize = 0;
        if (!skipCloseFrame) {
            this.sendCloseFrame(reasonCode, description);
        }
        this.connected = false;
        this.state = STATE_CLOSED;
        this.clearCloseTimer();
        this.clearKeepaliveTimer();
        this.clearGracePeriodTimer();
    
        if (!this.closeEventEmitted) {
            this.closeEventEmitted = true;
            this._debug('Emitting WebSocketConnection close event');
            this.emit('close', this.closeReasonCode, this.closeDescription);
        }
        
        this._debug('Drop: destroying socket');
        this.socket.destroy();
    };
    
    WebSocketConnection.prototype.setCloseTimer = function() {
        this._debug('setCloseTimer');
        this.clearCloseTimer();
        this._debug('Setting close timer');
        this.waitingForCloseResponse = true;
        this.closeTimer = setTimeout(this._closeTimerHandler, this.closeTimeout);
    };
    
    WebSocketConnection.prototype.clearCloseTimer = function() {
        this._debug('clearCloseTimer');
        if (this.closeTimer) {
            this._debug('Clearing close timer');
            clearTimeout(this.closeTimer);
            this.waitingForCloseResponse = false;
            this.closeTimer = null;
        }
    };
    
    WebSocketConnection.prototype.handleCloseTimer = function() {
        this._debug('handleCloseTimer');
        this.closeTimer = null;
        if (this.waitingForCloseResponse) {
            this._debug('Close response not received from client.  Forcing socket end.');
            this.waitingForCloseResponse = false;
            this.state = STATE_CLOSED;
            this.socket.end();
        }
    };
    
    WebSocketConnection.prototype.processFrame = function(frame) {
        this._debug('processFrame');
        this._debug(' -- frame: %s', frame);
        
        // Any non-control opcode besides 0x00 (continuation) received in the
        // middle of a fragmented message is illegal.
        if (this.frameQueue.length !== 0 && (frame.opcode > 0x00 && frame.opcode < 0x08)) {
            this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
              'Illegal frame opcode 0x' + frame.opcode.toString(16) + ' ' +
              'received in middle of fragmented message.');
            return;
        }
    
        switch(frame.opcode) {
            case 0x02: // WebSocketFrame.BINARY_FRAME
                this._debug('-- Binary Frame');
                if (this.assembleFragments) {
                    if (frame.fin) {
                        // Complete single-frame message received
                        this._debug('---- Emitting \'message\' event');
                        this.emit('message', {
                            type: 'binary',
                            binaryData: frame.binaryPayload
                        });
                    }
                    else {
                        // beginning of a fragmented message
                        this.frameQueue.push(frame);
                        this.fragmentationSize = frame.length;
                    }
                }
                break;
            case 0x01: // WebSocketFrame.TEXT_FRAME
                this._debug('-- Text Frame');
                if (this.assembleFragments) {
                    if (frame.fin) {
                        if (!isValidUTF8(frame.binaryPayload)) {
                            this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,
                              'Invalid UTF-8 Data Received');
                            return;
                        }
                        // Complete single-frame message received
                        this._debug('---- Emitting \'message\' event');
                        this.emit('message', {
                            type: 'utf8',
                            utf8Data: frame.binaryPayload.toString('utf8')
                        });
                    }
                    else {
                        // beginning of a fragmented message
                        this.frameQueue.push(frame);
                        this.fragmentationSize = frame.length;
                    }
                }
                break;
            case 0x00: // WebSocketFrame.CONTINUATION
                this._debug('-- Continuation Frame');
                if (this.assembleFragments) {
                    if (this.frameQueue.length === 0) {
                        this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                          'Unexpected Continuation Frame');
                        return;
                    }
    
                    this.fragmentationSize += frame.length;
    
                    if (this.fragmentationSize > this.maxReceivedMessageSize) {
                        this.drop(WebSocketConnection.CLOSE_REASON_MESSAGE_TOO_BIG,
                          'Maximum message size exceeded.');
                        return;
                    }
    
                    this.frameQueue.push(frame);
    
                    if (frame.fin) {
                        // end of fragmented message, so we process the whole
                        // message now.  We also have to decode the utf-8 data
                        // for text frames after combining all the fragments.
                        var bytesCopied = 0;
                        var binaryPayload = bufferAllocUnsafe(this.fragmentationSize);
                        var opcode = this.frameQueue[0].opcode;
                        this.frameQueue.forEach(function (currentFrame) {
                            currentFrame.binaryPayload.copy(binaryPayload, bytesCopied);
                            bytesCopied += currentFrame.binaryPayload.length;
                        });
                        this.frameQueue = [];
                        this.fragmentationSize = 0;
    
                        switch (opcode) {
                            case 0x02: // WebSocketOpcode.BINARY_FRAME
                                this.emit('message', {
                                    type: 'binary',
                                    binaryData: binaryPayload
                                });
                                break;
                            case 0x01: // WebSocketOpcode.TEXT_FRAME
                                if (!isValidUTF8(binaryPayload)) {
                                    this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,
                                      'Invalid UTF-8 Data Received');
                                    return;
                                }
                                this.emit('message', {
                                    type: 'utf8',
                                    utf8Data: binaryPayload.toString('utf8')
                                });
                                break;
                            default:
                                this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                                  'Unexpected first opcode in fragmentation sequence: 0x' + opcode.toString(16));
                                return;
                        }
                    }
                }
                break;
            case 0x09: // WebSocketFrame.PING
                this._debug('-- Ping Frame');
    
                if (this._pingListenerCount > 0) {
                    // logic to emit the ping frame: this is only done when a listener is known to exist
                    // Expose a function allowing the user to override the default ping() behavior
                    var cancelled = false;
                    var cancel = function() { 
                      cancelled = true; 
                    };
                    this.emit('ping', cancel, frame.binaryPayload);
    
                    // Only send a pong if the client did not indicate that he would like to cancel
                    if (!cancelled) {
                        this.pong(frame.binaryPayload);
                    }
                }
                else {
                    this.pong(frame.binaryPayload);
                }
    
                break;
            case 0x0A: // WebSocketFrame.PONG
                this._debug('-- Pong Frame');
                this.emit('pong', frame.binaryPayload);
                break;
            case 0x08: // WebSocketFrame.CONNECTION_CLOSE
                this._debug('-- Close Frame');
                if (this.waitingForCloseResponse) {
                    // Got response to our request to close the connection.
                    // Close is complete, so we just hang up.
                    this._debug('---- Got close response from peer.  Completing closing handshake.');
                    this.clearCloseTimer();
                    this.waitingForCloseResponse = false;
                    this.state = STATE_CLOSED;
                    this.socket.end();
                    return;
                }
                
                this._debug('---- Closing handshake initiated by peer.');
                // Got request from other party to close connection.
                // Send back acknowledgement and then hang up.
                this.state = STATE_PEER_REQUESTED_CLOSE;
                var respondCloseReasonCode;
    
                // Make sure the close reason provided is legal according to
                // the protocol spec.  Providing no close status is legal.
                // WebSocketFrame sets closeStatus to -1 by default, so if it
                // is still -1, then no status was provided.
                if (frame.invalidCloseFrameLength) {
                    this.closeReasonCode = 1005; // 1005 = No reason provided.
                    respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
                }
                else if (frame.closeStatus === -1 || validateCloseReason(frame.closeStatus)) {
                    this.closeReasonCode = frame.closeStatus;
                    respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
                }
                else {
                    this.closeReasonCode = frame.closeStatus;
                    respondCloseReasonCode = WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR;
                }
                
                // If there is a textual description in the close frame, extract it.
                if (frame.binaryPayload.length > 1) {
                    if (!isValidUTF8(frame.binaryPayload)) {
                        this.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,
                          'Invalid UTF-8 Data Received');
                        return;
                    }
                    this.closeDescription = frame.binaryPayload.toString('utf8');
                }
                else {
                    this.closeDescription = WebSocketConnection.CLOSE_DESCRIPTIONS[this.closeReasonCode];
                }
                this._debug(
                    '------ Remote peer %s - code: %d - %s - close frame payload length: %d',
                    this.remoteAddress, this.closeReasonCode,
                    this.closeDescription, frame.length
                );
                this._debug('------ responding to remote peer\'s close request.');
                this.sendCloseFrame(respondCloseReasonCode, null);
                this.connected = false;
                break;
            default:
                this._debug('-- Unrecognized Opcode %d', frame.opcode);
                this.drop(WebSocketConnection.CLOSE_REASON_PROTOCOL_ERROR,
                  'Unrecognized Opcode: 0x' + frame.opcode.toString(16));
                break;
        }
    };
    
    WebSocketConnection.prototype.send = function(data, cb) {
        this._debug('send');
        if (Buffer.isBuffer(data)) {
            this.sendBytes(data, cb);
        }
        else if (typeof(data['toString']) === 'function') {
            this.sendUTF(data, cb);
        }
        else {
            throw new Error('Data provided must either be a Node Buffer or implement toString()');
        }
    };
    
    WebSocketConnection.prototype.sendUTF = function(data, cb) {
        data = bufferFromString(data.toString(), 'utf8');
        this._debug('sendUTF: %d bytes', data.length);
        var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
        frame.opcode = 0x01; // WebSocketOpcode.TEXT_FRAME
        frame.binaryPayload = data;
        this.fragmentAndSend(frame, cb);
    };
    
    WebSocketConnection.prototype.sendBytes = function(data, cb) {
        this._debug('sendBytes');
        if (!Buffer.isBuffer(data)) {
            throw new Error('You must pass a Node Buffer object to WebSocketConnection.prototype.sendBytes()');
        }
        var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
        frame.opcode = 0x02; // WebSocketOpcode.BINARY_FRAME
        frame.binaryPayload = data;
        this.fragmentAndSend(frame, cb);
    };
    
    WebSocketConnection.prototype.ping = function(data) {
        this._debug('ping');
        var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
        frame.opcode = 0x09; // WebSocketOpcode.PING
        frame.fin = true;
        if (data) {
            if (!Buffer.isBuffer(data)) {
                data = bufferFromString(data.toString(), 'utf8');
            }
            if (data.length > 125) {
                this._debug('WebSocket: Data for ping is longer than 125 bytes.  Truncating.');
                data = data.slice(0,124);
            }
            frame.binaryPayload = data;
        }
        this.sendFrame(frame);
    };
    
    // Pong frames have to echo back the contents of the data portion of the
    // ping frame exactly, byte for byte.
    WebSocketConnection.prototype.pong = function(binaryPayload) {
        this._debug('pong');
        var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
        frame.opcode = 0x0A; // WebSocketOpcode.PONG
        if (Buffer.isBuffer(binaryPayload) && binaryPayload.length > 125) {
            this._debug('WebSocket: Data for pong is longer than 125 bytes.  Truncating.');
            binaryPayload = binaryPayload.slice(0,124);
        }
        frame.binaryPayload = binaryPayload;
        frame.fin = true;
        this.sendFrame(frame);
    };
    
    WebSocketConnection.prototype.fragmentAndSend = function(frame, cb) {
        this._debug('fragmentAndSend');
        if (frame.opcode > 0x07) {
            throw new Error('You cannot fragment control frames.');
        }
    
        var threshold = this.config.fragmentationThreshold;
        var length = frame.binaryPayload.length;
    
        // Send immediately if fragmentation is disabled or the message is not
        // larger than the fragmentation threshold.
        if (!this.config.fragmentOutgoingMessages || (frame.binaryPayload && length <= threshold)) {
            frame.fin = true;
            this.sendFrame(frame, cb);
            return;
        }
        
        var numFragments = Math.ceil(length / threshold);
        var sentFragments = 0;
        var sentCallback = function fragmentSentCallback(err) {
            if (err) {
                if (typeof cb === 'function') {
                    // pass only the first error
                    cb(err);
                    cb = null;
                }
                return;
            }
            ++sentFragments;
            if ((sentFragments === numFragments) && (typeof cb === 'function')) {
                cb();
            }
        };
        for (var i=1; i <= numFragments; i++) {
            var currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
            
            // continuation opcode except for first frame.
            currentFrame.opcode = (i === 1) ? frame.opcode : 0x00;
            
            // fin set on last frame only
            currentFrame.fin = (i === numFragments);
            
            // length is likely to be shorter on the last fragment
            var currentLength = (i === numFragments) ? length - (threshold * (i-1)) : threshold;
            var sliceStart = threshold * (i-1);
            
            // Slice the right portion of the original payload
            currentFrame.binaryPayload = frame.binaryPayload.slice(sliceStart, sliceStart + currentLength);
            
            this.sendFrame(currentFrame, sentCallback);
        }
    };
    
    WebSocketConnection.prototype.sendCloseFrame = function(reasonCode, description, cb) {
        if (typeof(reasonCode) !== 'number') {
            reasonCode = WebSocketConnection.CLOSE_REASON_NORMAL;
        }
        
        this._debug('sendCloseFrame state: %s, reasonCode: %d, description: %s', this.state, reasonCode, description);
        
        if (this.state !== STATE_OPEN && this.state !== STATE_PEER_REQUESTED_CLOSE) { return; }
        
        var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
        frame.fin = true;
        frame.opcode = 0x08; // WebSocketOpcode.CONNECTION_CLOSE
        frame.closeStatus = reasonCode;
        if (typeof(description) === 'string') {
            frame.binaryPayload = bufferFromString(description, 'utf8');
        }
        
        this.sendFrame(frame, cb);
        this.socket.end();
    };
    
    WebSocketConnection.prototype.sendFrame = function(frame, cb) {
        this._debug('sendFrame');
        frame.mask = this.maskOutgoingPackets;
        var flushed = this.socket.write(frame.toBuffer(), cb);
        this.outputBufferFull = !flushed;
        return flushed;
    };
    
    module.exports = WebSocketConnection;
    
    
    
    function instrumentSocketForDebugging(connection, socket) {
        /* jshint loopfunc: true */
        if (!connection._debug.enabled) { return; }
        
        var originalSocketEmit = socket.emit;
        socket.emit = function(event) {
            connection._debug('||| Socket Event  \'%s\'', event);
            originalSocketEmit.apply(this, arguments);
        };
        
        for (var key in socket) {
            if ('function' !== typeof(socket[key])) { continue; }
            if (['emit'].indexOf(key) !== -1) { continue; }
            (function(key) {
                var original = socket[key];
                if (key === 'on') {
                    socket[key] = function proxyMethod__EventEmitter__On() {
                        connection._debug('||| Socket method called:  %s (%s)', key, arguments[0]);
                        return original.apply(this, arguments);
                    };
                    return;
                }
                socket[key] = function proxyMethod() {
                    connection._debug('||| Socket method called:  %s', key);
                    return original.apply(this, arguments);
                };
            })(key);
        }
    }
    
    
    /***/ }),
    
    /***/ 224:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /************************************************************************
     *  Copyright 2010-2015 Brian McKelvey.
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     ***********************************************************************/
    
    var bufferUtil = __nccwpck_require__(82);
    var bufferAllocUnsafe = __nccwpck_require__(197).bufferAllocUnsafe;
    
    const DECODE_HEADER = 1;
    const WAITING_FOR_16_BIT_LENGTH = 2;
    const WAITING_FOR_64_BIT_LENGTH = 3;
    const WAITING_FOR_MASK_KEY = 4;
    const WAITING_FOR_PAYLOAD = 5;
    const COMPLETE = 6;
    
    // WebSocketConnection will pass shared buffer objects for maskBytes and
    // frameHeader into the constructor to avoid tons of small memory allocations
    // for each frame we have to parse.  This is only used for parsing frames
    // we receive off the wire.
    function WebSocketFrame(maskBytes, frameHeader, config) {
        this.maskBytes = maskBytes;
        this.frameHeader = frameHeader;
        this.config = config;
        this.maxReceivedFrameSize = config.maxReceivedFrameSize;
        this.protocolError = false;
        this.frameTooLarge = false;
        this.invalidCloseFrameLength = false;
        this.parseState = DECODE_HEADER;
        this.closeStatus = -1;
    }
    
    WebSocketFrame.prototype.addData = function(bufferList) {
        if (this.parseState === DECODE_HEADER) {
            if (bufferList.length >= 2) {
                bufferList.joinInto(this.frameHeader, 0, 0, 2);
                bufferList.advance(2);
                var firstByte = this.frameHeader[0];
                var secondByte = this.frameHeader[1];
    
                this.fin     = Boolean(firstByte  & 0x80);
                this.rsv1    = Boolean(firstByte  & 0x40);
                this.rsv2    = Boolean(firstByte  & 0x20);
                this.rsv3    = Boolean(firstByte  & 0x10);
                this.mask    = Boolean(secondByte & 0x80);
    
                this.opcode  = firstByte  & 0x0F;
                this.length = secondByte & 0x7F;
    
                // Control frame sanity check
                if (this.opcode >= 0x08) {
                    if (this.length > 125) {
                        this.protocolError = true;
                        this.dropReason = 'Illegal control frame longer than 125 bytes.';
                        return true;
                    }
                    if (!this.fin) {
                        this.protocolError = true;
                        this.dropReason = 'Control frames must not be fragmented.';
                        return true;
                    }
                }
    
                if (this.length === 126) {
                    this.parseState = WAITING_FOR_16_BIT_LENGTH;
                }
                else if (this.length === 127) {
                    this.parseState = WAITING_FOR_64_BIT_LENGTH;
                }
                else {
                    this.parseState = WAITING_FOR_MASK_KEY;
                }
            }
        }
        if (this.parseState === WAITING_FOR_16_BIT_LENGTH) {
            if (bufferList.length >= 2) {
                bufferList.joinInto(this.frameHeader, 2, 0, 2);
                bufferList.advance(2);
                this.length = this.frameHeader.readUInt16BE(2);
                this.parseState = WAITING_FOR_MASK_KEY;
            }
        }
        else if (this.parseState === WAITING_FOR_64_BIT_LENGTH) {
            if (bufferList.length >= 8) {
                bufferList.joinInto(this.frameHeader, 2, 0, 8);
                bufferList.advance(8);
                var lengthPair = [
                  this.frameHeader.readUInt32BE(2),
                  this.frameHeader.readUInt32BE(2+4)
                ];
    
                if (lengthPair[0] !== 0) {
                    this.protocolError = true;
                    this.dropReason = 'Unsupported 64-bit length frame received';
                    return true;
                }
                this.length = lengthPair[1];
                this.parseState = WAITING_FOR_MASK_KEY;
            }
        }
    
        if (this.parseState === WAITING_FOR_MASK_KEY) {
            if (this.mask) {
                if (bufferList.length >= 4) {
                    bufferList.joinInto(this.maskBytes, 0, 0, 4);
                    bufferList.advance(4);
                    this.parseState = WAITING_FOR_PAYLOAD;
                }
            }
            else {
                this.parseState = WAITING_FOR_PAYLOAD;
            }
        }
    
        if (this.parseState === WAITING_FOR_PAYLOAD) {
            if (this.length > this.maxReceivedFrameSize) {
                this.frameTooLarge = true;
                this.dropReason = 'Frame size of ' + this.length.toString(10) +
                                  ' bytes exceeds maximum accepted frame size';
                return true;
            }
    
            if (this.length === 0) {
                this.binaryPayload = bufferAllocUnsafe(0);
                this.parseState = COMPLETE;
                return true;
            }
            if (bufferList.length >= this.length) {
                this.binaryPayload = bufferList.take(this.length);
                bufferList.advance(this.length);
                if (this.mask) {
                    bufferUtil.unmask(this.binaryPayload, this.maskBytes);
                    // xor(this.binaryPayload, this.maskBytes, 0);
                }
    
                if (this.opcode === 0x08) { // WebSocketOpcode.CONNECTION_CLOSE
                    if (this.length === 1) {
                        // Invalid length for a close frame.  Must be zero or at least two.
                        this.binaryPayload = bufferAllocUnsafe(0);
                        this.invalidCloseFrameLength = true;
                    }
                    if (this.length >= 2) {
                        this.closeStatus = this.binaryPayload.readUInt16BE(0);
                        this.binaryPayload = this.binaryPayload.slice(2);
                    }
                }
    
                this.parseState = COMPLETE;
                return true;
            }
        }
        return false;
    };
    
    WebSocketFrame.prototype.throwAwayPayload = function(bufferList) {
        if (bufferList.length >= this.length) {
            bufferList.advance(this.length);
            this.parseState = COMPLETE;
            return true;
        }
        return false;
    };
    
    WebSocketFrame.prototype.toBuffer = function(nullMask) {
        var maskKey;
        var headerLength = 2;
        var data;
        var outputPos;
        var firstByte = 0x00;
        var secondByte = 0x00;
    
        if (this.fin) {
            firstByte |= 0x80;
        }
        if (this.rsv1) {
            firstByte |= 0x40;
        }
        if (this.rsv2) {
            firstByte |= 0x20;
        }
        if (this.rsv3) {
            firstByte |= 0x10;
        }
        if (this.mask) {
            secondByte |= 0x80;
        }
    
        firstByte |= (this.opcode & 0x0F);
    
        // the close frame is a special case because the close reason is
        // prepended to the payload data.
        if (this.opcode === 0x08) {
            this.length = 2;
            if (this.binaryPayload) {
                this.length += this.binaryPayload.length;
            }
            data = bufferAllocUnsafe(this.length);
            data.writeUInt16BE(this.closeStatus, 0);
            if (this.length > 2) {
                this.binaryPayload.copy(data, 2);
            }
        }
        else if (this.binaryPayload) {
            data = this.binaryPayload;
            this.length = data.length;
        }
        else {
            this.length = 0;
        }
    
        if (this.length <= 125) {
            // encode the length directly into the two-byte frame header
            secondByte |= (this.length & 0x7F);
        }
        else if (this.length > 125 && this.length <= 0xFFFF) {
            // Use 16-bit length
            secondByte |= 126;
            headerLength += 2;
        }
        else if (this.length > 0xFFFF) {
            // Use 64-bit length
            secondByte |= 127;
            headerLength += 8;
        }
    
        var output = bufferAllocUnsafe(this.length + headerLength + (this.mask ? 4 : 0));
    
        // write the frame header
        output[0] = firstByte;
        output[1] = secondByte;
    
        outputPos = 2;
    
        if (this.length > 125 && this.length <= 0xFFFF) {
            // write 16-bit length
            output.writeUInt16BE(this.length, outputPos);
            outputPos += 2;
        }
        else if (this.length > 0xFFFF) {
            // write 64-bit length
            output.writeUInt32BE(0x00000000, outputPos);
            output.writeUInt32BE(this.length, outputPos + 4);
            outputPos += 8;
        }
    
        if (this.mask) {
            maskKey = nullMask ? 0 : ((Math.random() * 0xFFFFFFFF) >>> 0);
            this.maskBytes.writeUInt32BE(maskKey, 0);
    
            // write the mask key
            this.maskBytes.copy(output, outputPos);
            outputPos += 4;
    
            if (data) {
              bufferUtil.mask(data, this.maskBytes, output, outputPos, this.length);
            }
        }
        else if (data) {
            data.copy(output, outputPos);
        }
    
        return output;
    };
    
    WebSocketFrame.prototype.toString = function() {
        return 'Opcode: ' + this.opcode + ', fin: ' + this.fin + ', length: ' + this.length + ', hasPayload: ' + Boolean(this.binaryPayload) + ', masked: ' + this.mask;
    };
    
    
    module.exports = WebSocketFrame;
    
    
    /***/ }),
    
    /***/ 256:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /************************************************************************
     *  Copyright 2010-2015 Brian McKelvey.
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     ***********************************************************************/
    
    var crypto = __nccwpck_require__(417);
    var util = __nccwpck_require__(669);
    var url = __nccwpck_require__(835);
    var EventEmitter = __nccwpck_require__(614).EventEmitter;
    var WebSocketConnection = __nccwpck_require__(737);
    
    var headerValueSplitRegExp = /,\s*/;
    var headerParamSplitRegExp = /;\s*/;
    var headerSanitizeRegExp = /[\r\n]/g;
    var xForwardedForSeparatorRegExp = /,\s*/;
    var separators = [
        '(', ')', '<', '>', '@',
        ',', ';', ':', '\\', '\"',
        '/', '[', ']', '?', '=',
        '{', '}', ' ', String.fromCharCode(9)
    ];
    var controlChars = [String.fromCharCode(127) /* DEL */];
    for (var i=0; i < 31; i ++) {
        /* US-ASCII Control Characters */
        controlChars.push(String.fromCharCode(i));
    }
    
    var cookieNameValidateRegEx = /([\x00-\x20\x22\x28\x29\x2c\x2f\x3a-\x3f\x40\x5b-\x5e\x7b\x7d\x7f])/;
    var cookieValueValidateRegEx = /[^\x21\x23-\x2b\x2d-\x3a\x3c-\x5b\x5d-\x7e]/;
    var cookieValueDQuoteValidateRegEx = /^"[^"]*"$/;
    var controlCharsAndSemicolonRegEx = /[\x00-\x20\x3b]/g;
    
    var cookieSeparatorRegEx = /[;,] */;
    
    var httpStatusDescriptions = {
        100: 'Continue',
        101: 'Switching Protocols',
        200: 'OK',
        201: 'Created',
        203: 'Non-Authoritative Information',
        204: 'No Content',
        205: 'Reset Content',
        206: 'Partial Content',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        305: 'Use Proxy',
        307: 'Temporary Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        402: 'Payment Required',
        403: 'Forbidden',
        404: 'Not Found',
        406: 'Not Acceptable',
        407: 'Proxy Authorization Required',
        408: 'Request Timeout',
        409: 'Conflict',
        410: 'Gone',
        411: 'Length Required',
        412: 'Precondition Failed',
        413: 'Request Entity Too Long',
        414: 'Request-URI Too Long',
        415: 'Unsupported Media Type',
        416: 'Requested Range Not Satisfiable',
        417: 'Expectation Failed',
        426: 'Upgrade Required',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported'
    };
    
    function WebSocketRequest(socket, httpRequest, serverConfig) {
        // Superclass Constructor
        EventEmitter.call(this);
    
        this.socket = socket;
        this.httpRequest = httpRequest;
        this.resource = httpRequest.url;
        this.remoteAddress = socket.remoteAddress;
        this.remoteAddresses = [this.remoteAddress];
        this.serverConfig = serverConfig;
    
        // Watch for the underlying TCP socket closing before we call accept
        this._socketIsClosing = false;
        this._socketCloseHandler = this._handleSocketCloseBeforeAccept.bind(this);
        this.socket.on('end', this._socketCloseHandler);
        this.socket.on('close', this._socketCloseHandler);
    
        this._resolved = false;
    }
    
    util.inherits(WebSocketRequest, EventEmitter);
    
    WebSocketRequest.prototype.readHandshake = function() {
        var self = this;
        var request = this.httpRequest;
    
        // Decode URL
        this.resourceURL = url.parse(this.resource, true);
    
        this.host = request.headers['host'];
        if (!this.host) {
            throw new Error('Client must provide a Host header.');
        }
    
        this.key = request.headers['sec-websocket-key'];
        if (!this.key) {
            throw new Error('Client must provide a value for Sec-WebSocket-Key.');
        }
    
        this.webSocketVersion = parseInt(request.headers['sec-websocket-version'], 10);
    
        if (!this.webSocketVersion || isNaN(this.webSocketVersion)) {
            throw new Error('Client must provide a value for Sec-WebSocket-Version.');
        }
    
        switch (this.webSocketVersion) {
            case 8:
            case 13:
                break;
            default:
                var e = new Error('Unsupported websocket client version: ' + this.webSocketVersion +
                                  'Only versions 8 and 13 are supported.');
                e.httpCode = 426;
                e.headers = {
                    'Sec-WebSocket-Version': '13'
                };
                throw e;
        }
    
        if (this.webSocketVersion === 13) {
            this.origin = request.headers['origin'];
        }
        else if (this.webSocketVersion === 8) {
            this.origin = request.headers['sec-websocket-origin'];
        }
    
        // Protocol is optional.
        var protocolString = request.headers['sec-websocket-protocol'];
        this.protocolFullCaseMap = {};
        this.requestedProtocols = [];
        if (protocolString) {
            var requestedProtocolsFullCase = protocolString.split(headerValueSplitRegExp);
            requestedProtocolsFullCase.forEach(function(protocol) {
                var lcProtocol = protocol.toLocaleLowerCase();
                self.requestedProtocols.push(lcProtocol);
                self.protocolFullCaseMap[lcProtocol] = protocol;
            });
        }
    
        if (!this.serverConfig.ignoreXForwardedFor &&
            request.headers['x-forwarded-for']) {
            var immediatePeerIP = this.remoteAddress;
            this.remoteAddresses = request.headers['x-forwarded-for']
                .split(xForwardedForSeparatorRegExp);
            this.remoteAddresses.push(immediatePeerIP);
            this.remoteAddress = this.remoteAddresses[0];
        }
    
        // Extensions are optional.
        if (this.serverConfig.parseExtensions) {
            var extensionsString = request.headers['sec-websocket-extensions'];
            this.requestedExtensions = this.parseExtensions(extensionsString);
        } else {
            this.requestedExtensions = [];
        }
    
        // Cookies are optional
        if (this.serverConfig.parseCookies) {
            var cookieString = request.headers['cookie'];
            this.cookies = this.parseCookies(cookieString);
        } else {
            this.cookies = [];
        }
    };
    
    WebSocketRequest.prototype.parseExtensions = function(extensionsString) {
        if (!extensionsString || extensionsString.length === 0) {
            return [];
        }
        var extensions = extensionsString.toLocaleLowerCase().split(headerValueSplitRegExp);
        extensions.forEach(function(extension, index, array) {
            var params = extension.split(headerParamSplitRegExp);
            var extensionName = params[0];
            var extensionParams = params.slice(1);
            extensionParams.forEach(function(rawParam, index, array) {
                var arr = rawParam.split('=');
                var obj = {
                    name: arr[0],
                    value: arr[1]
                };
                array.splice(index, 1, obj);
            });
            var obj = {
                name: extensionName,
                params: extensionParams
            };
            array.splice(index, 1, obj);
        });
        return extensions;
    };
    
    // This function adapted from node-cookie
    // https://github.com/shtylman/node-cookie
    WebSocketRequest.prototype.parseCookies = function(str) {
        // Sanity Check
        if (!str || typeof(str) !== 'string') {
            return [];
        }
    
        var cookies = [];
        var pairs = str.split(cookieSeparatorRegEx);
    
        pairs.forEach(function(pair) {
            var eq_idx = pair.indexOf('=');
            if (eq_idx === -1) {
                cookies.push({
                    name: pair,
                    value: null
                });
                return;
            }
    
            var key = pair.substr(0, eq_idx).trim();
            var val = pair.substr(++eq_idx, pair.length).trim();
    
            // quoted values
            if ('"' === val[0]) {
                val = val.slice(1, -1);
            }
    
            cookies.push({
                name: key,
                value: decodeURIComponent(val)
            });
        });
    
        return cookies;
    };
    
    WebSocketRequest.prototype.accept = function(acceptedProtocol, allowedOrigin, cookies) {
        this._verifyResolution();
    
        // TODO: Handle extensions
    
        var protocolFullCase;
    
        if (acceptedProtocol) {
            protocolFullCase = this.protocolFullCaseMap[acceptedProtocol.toLocaleLowerCase()];
            if (typeof(protocolFullCase) === 'undefined') {
                protocolFullCase = acceptedProtocol;
            }
        }
        else {
            protocolFullCase = acceptedProtocol;
        }
        this.protocolFullCaseMap = null;
    
        // Create key validation hash
        var sha1 = crypto.createHash('sha1');
        sha1.update(this.key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
        var acceptKey = sha1.digest('base64');
    
        var response = 'HTTP/1.1 101 Switching Protocols\r\n' +
                       'Upgrade: websocket\r\n' +
                       'Connection: Upgrade\r\n' +
                       'Sec-WebSocket-Accept: ' + acceptKey + '\r\n';
    
        if (protocolFullCase) {
            // validate protocol
            for (var i=0; i < protocolFullCase.length; i++) {
                var charCode = protocolFullCase.charCodeAt(i);
                var character = protocolFullCase.charAt(i);
                if (charCode < 0x21 || charCode > 0x7E || separators.indexOf(character) !== -1) {
                    this.reject(500);
                    throw new Error('Illegal character "' + String.fromCharCode(character) + '" in subprotocol.');
                }
            }
            if (this.requestedProtocols.indexOf(acceptedProtocol) === -1) {
                this.reject(500);
                throw new Error('Specified protocol was not requested by the client.');
            }
    
            protocolFullCase = protocolFullCase.replace(headerSanitizeRegExp, '');
            response += 'Sec-WebSocket-Protocol: ' + protocolFullCase + '\r\n';
        }
        this.requestedProtocols = null;
    
        if (allowedOrigin) {
            allowedOrigin = allowedOrigin.replace(headerSanitizeRegExp, '');
            if (this.webSocketVersion === 13) {
                response += 'Origin: ' + allowedOrigin + '\r\n';
            }
            else if (this.webSocketVersion === 8) {
                response += 'Sec-WebSocket-Origin: ' + allowedOrigin + '\r\n';
            }
        }
    
        if (cookies) {
            if (!Array.isArray(cookies)) {
                this.reject(500);
                throw new Error('Value supplied for "cookies" argument must be an array.');
            }
            var seenCookies = {};
            cookies.forEach(function(cookie) {
                if (!cookie.name || !cookie.value) {
                    this.reject(500);
                    throw new Error('Each cookie to set must at least provide a "name" and "value"');
                }
    
                // Make sure there are no \r\n sequences inserted
                cookie.name = cookie.name.replace(controlCharsAndSemicolonRegEx, '');
                cookie.value = cookie.value.replace(controlCharsAndSemicolonRegEx, '');
    
                if (seenCookies[cookie.name]) {
                    this.reject(500);
                    throw new Error('You may not specify the same cookie name twice.');
                }
                seenCookies[cookie.name] = true;
    
                // token (RFC 2616, Section 2.2)
                var invalidChar = cookie.name.match(cookieNameValidateRegEx);
                if (invalidChar) {
                    this.reject(500);
                    throw new Error('Illegal character ' + invalidChar[0] + ' in cookie name');
                }
    
                // RFC 6265, Section 4.1.1
                // *cookie-octet / ( DQUOTE *cookie-octet DQUOTE ) | %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
                if (cookie.value.match(cookieValueDQuoteValidateRegEx)) {
                    invalidChar = cookie.value.slice(1, -1).match(cookieValueValidateRegEx);
                } else {
                    invalidChar = cookie.value.match(cookieValueValidateRegEx);
                }
                if (invalidChar) {
                    this.reject(500);
                    throw new Error('Illegal character ' + invalidChar[0] + ' in cookie value');
                }
    
                var cookieParts = [cookie.name + '=' + cookie.value];
    
                // RFC 6265, Section 4.1.1
                // 'Path=' path-value | <any CHAR except CTLs or ';'>
                if(cookie.path){
                    invalidChar = cookie.path.match(controlCharsAndSemicolonRegEx);
                    if (invalidChar) {
                        this.reject(500);
                        throw new Error('Illegal character ' + invalidChar[0] + ' in cookie path');
                    }
                    cookieParts.push('Path=' + cookie.path);
                }
    
                // RFC 6265, Section 4.1.2.3
                // 'Domain=' subdomain
                if (cookie.domain) {
                    if (typeof(cookie.domain) !== 'string') {
                        this.reject(500);
                        throw new Error('Domain must be specified and must be a string.');
                    }
                    invalidChar = cookie.domain.match(controlCharsAndSemicolonRegEx);
                    if (invalidChar) {
                        this.reject(500);
                        throw new Error('Illegal character ' + invalidChar[0] + ' in cookie domain');
                    }
                    cookieParts.push('Domain=' + cookie.domain.toLowerCase());
                }
    
                // RFC 6265, Section 4.1.1
                //'Expires=' sane-cookie-date | Force Date object requirement by using only epoch
                if (cookie.expires) {
                    if (!(cookie.expires instanceof Date)){
                        this.reject(500);
                        throw new Error('Value supplied for cookie "expires" must be a vaild date object');
                    }
                    cookieParts.push('Expires=' + cookie.expires.toGMTString());
                }
    
                // RFC 6265, Section 4.1.1
                //'Max-Age=' non-zero-digit *DIGIT
                if (cookie.maxage) {
                    var maxage = cookie.maxage;
                    if (typeof(maxage) === 'string') {
                        maxage = parseInt(maxage, 10);
                    }
                    if (isNaN(maxage) || maxage <= 0 ) {
                        this.reject(500);
                        throw new Error('Value supplied for cookie "maxage" must be a non-zero number');
                    }
                    maxage = Math.round(maxage);
                    cookieParts.push('Max-Age=' + maxage.toString(10));
                }
    
                // RFC 6265, Section 4.1.1
                //'Secure;'
                if (cookie.secure) {
                    if (typeof(cookie.secure) !== 'boolean') {
                        this.reject(500);
                        throw new Error('Value supplied for cookie "secure" must be of type boolean');
                    }
                    cookieParts.push('Secure');
                }
    
                // RFC 6265, Section 4.1.1
                //'HttpOnly;'
                if (cookie.httponly) {
                    if (typeof(cookie.httponly) !== 'boolean') {
                        this.reject(500);
                        throw new Error('Value supplied for cookie "httponly" must be of type boolean');
                    }
                    cookieParts.push('HttpOnly');
                }
    
                response += ('Set-Cookie: ' + cookieParts.join(';') + '\r\n');
            }.bind(this));
        }
    
        // TODO: handle negotiated extensions
        // if (negotiatedExtensions) {
        //     response += 'Sec-WebSocket-Extensions: ' + negotiatedExtensions.join(', ') + '\r\n';
        // }
    
        // Mark the request resolved now so that the user can't call accept or
        // reject a second time.
        this._resolved = true;
        this.emit('requestResolved', this);
    
        response += '\r\n';
    
        var connection = new WebSocketConnection(this.socket, [], acceptedProtocol, false, this.serverConfig);
        connection.webSocketVersion = this.webSocketVersion;
        connection.remoteAddress = this.remoteAddress;
        connection.remoteAddresses = this.remoteAddresses;
    
        var self = this;
    
        if (this._socketIsClosing) {
            // Handle case when the client hangs up before we get a chance to
            // accept the connection and send our side of the opening handshake.
            cleanupFailedConnection(connection);
        }
        else {
            this.socket.write(response, 'ascii', function(error) {
                if (error) {
                    cleanupFailedConnection(connection);
                    return;
                }
    
                self._removeSocketCloseListeners();
                connection._addSocketEventListeners();
            });
        }
    
        this.emit('requestAccepted', connection);
        return connection;
    };
    
    WebSocketRequest.prototype.reject = function(status, reason, extraHeaders) {
        this._verifyResolution();
    
        // Mark the request resolved now so that the user can't call accept or
        // reject a second time.
        this._resolved = true;
        this.emit('requestResolved', this);
    
        if (typeof(status) !== 'number') {
            status = 403;
        }
        var response = 'HTTP/1.1 ' + status + ' ' + httpStatusDescriptions[status] + '\r\n' +
                       'Connection: close\r\n';
        if (reason) {
            reason = reason.replace(headerSanitizeRegExp, '');
            response += 'X-WebSocket-Reject-Reason: ' + reason + '\r\n';
        }
    
        if (extraHeaders) {
            for (var key in extraHeaders) {
                var sanitizedValue = extraHeaders[key].toString().replace(headerSanitizeRegExp, '');
                var sanitizedKey = key.replace(headerSanitizeRegExp, '');
                response += (sanitizedKey + ': ' + sanitizedValue + '\r\n');
            }
        }
    
        response += '\r\n';
        this.socket.end(response, 'ascii');
    
        this.emit('requestRejected', this);
    };
    
    WebSocketRequest.prototype._handleSocketCloseBeforeAccept = function() {
        this._socketIsClosing = true;
        this._removeSocketCloseListeners();
    };
    
    WebSocketRequest.prototype._removeSocketCloseListeners = function() {
        this.socket.removeListener('end', this._socketCloseHandler);
        this.socket.removeListener('close', this._socketCloseHandler);
    };
    
    WebSocketRequest.prototype._verifyResolution = function() {
        if (this._resolved) {
            throw new Error('WebSocketRequest may only be accepted or rejected one time.');
        }
    };
    
    function cleanupFailedConnection(connection) {
        // Since we have to return a connection object even if the socket is
        // already dead in order not to break the API, we schedule a 'close'
        // event on the connection object to occur immediately.
        process.nextTick(function() {
            // WebSocketConnection.CLOSE_REASON_ABNORMAL = 1006
            // Third param: Skip sending the close frame to a dead socket
            connection.drop(1006, 'TCP connection lost before handshake completed.', true);
        });
    }
    
    module.exports = WebSocketRequest;
    
    
    /***/ }),
    
    /***/ 723:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /************************************************************************
     *  Copyright 2010-2015 Brian McKelvey.
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     ***********************************************************************/
    
    var extend = __nccwpck_require__(197).extend;
    var util = __nccwpck_require__(669);
    var EventEmitter = __nccwpck_require__(614).EventEmitter;
    var WebSocketRouterRequest = __nccwpck_require__(319);
    
    function WebSocketRouter(config) {
        // Superclass Constructor
        EventEmitter.call(this);
    
        this.config = {
            // The WebSocketServer instance to attach to.
            server: null
        };
        if (config) {
            extend(this.config, config);
        }
        this.handlers = [];
    
        this._requestHandler = this.handleRequest.bind(this);
        if (this.config.server) {
            this.attachServer(this.config.server);
        }
    }
    
    util.inherits(WebSocketRouter, EventEmitter);
    
    WebSocketRouter.prototype.attachServer = function(server) {
        if (server) {
            this.server = server;
            this.server.on('request', this._requestHandler);
        }
        else {
            throw new Error('You must specify a WebSocketServer instance to attach to.');
        }
    };
    
    WebSocketRouter.prototype.detachServer = function() {
        if (this.server) {
            this.server.removeListener('request', this._requestHandler);
            this.server = null;
        }
        else {
            throw new Error('Cannot detach from server: not attached.');
        }
    };
    
    WebSocketRouter.prototype.mount = function(path, protocol, callback) {
        if (!path) {
            throw new Error('You must specify a path for this handler.');
        }
        if (!protocol) {
            protocol = '____no_protocol____';
        }
        if (!callback) {
            throw new Error('You must specify a callback for this handler.');
        }
    
        path = this.pathToRegExp(path);
        if (!(path instanceof RegExp)) {
            throw new Error('Path must be specified as either a string or a RegExp.');
        }
        var pathString = path.toString();
    
        // normalize protocol to lower-case
        protocol = protocol.toLocaleLowerCase();
    
        if (this.findHandlerIndex(pathString, protocol) !== -1) {
            throw new Error('You may only mount one handler per path/protocol combination.');
        }
    
        this.handlers.push({
            'path': path,
            'pathString': pathString,
            'protocol': protocol,
            'callback': callback
        });
    };
    WebSocketRouter.prototype.unmount = function(path, protocol) {
        var index = this.findHandlerIndex(this.pathToRegExp(path).toString(), protocol);
        if (index !== -1) {
            this.handlers.splice(index, 1);
        }
        else {
            throw new Error('Unable to find a route matching the specified path and protocol.');
        }
    };
    
    WebSocketRouter.prototype.findHandlerIndex = function(pathString, protocol) {
        protocol = protocol.toLocaleLowerCase();
        for (var i=0, len=this.handlers.length; i < len; i++) {
            var handler = this.handlers[i];
            if (handler.pathString === pathString && handler.protocol === protocol) {
                return i;
            }
        }
        return -1;
    };
    
    WebSocketRouter.prototype.pathToRegExp = function(path) {
        if (typeof(path) === 'string') {
            if (path === '*') {
                path = /^.*$/;
            }
            else {
                path = path.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                path = new RegExp('^' + path + '$');
            }
        }
        return path;
    };
    
    WebSocketRouter.prototype.handleRequest = function(request) {
        var requestedProtocols = request.requestedProtocols;
        if (requestedProtocols.length === 0) {
            requestedProtocols = ['____no_protocol____'];
        }
    
        // Find a handler with the first requested protocol first
        for (var i=0; i < requestedProtocols.length; i++) {
            var requestedProtocol = requestedProtocols[i].toLocaleLowerCase();
    
            // find the first handler that can process this request
            for (var j=0, len=this.handlers.length; j < len; j++) {
                var handler = this.handlers[j];
                if (handler.path.test(request.resourceURL.pathname)) {
                    if (requestedProtocol === handler.protocol ||
                        handler.protocol === '*')
                    {
                        var routerRequest = new WebSocketRouterRequest(request, requestedProtocol);
                        handler.callback(routerRequest);
                        return;
                    }
                }
            }
        }
    
        // If we get here we were unable to find a suitable handler.
        request.reject(404, 'No handler is available for the given request.');
    };
    
    module.exports = WebSocketRouter;
    
    
    /***/ }),
    
    /***/ 319:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /************************************************************************
     *  Copyright 2010-2015 Brian McKelvey.
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     ***********************************************************************/
    
    var util = __nccwpck_require__(669);
    var EventEmitter = __nccwpck_require__(614).EventEmitter;
    
    function WebSocketRouterRequest(webSocketRequest, resolvedProtocol) {
        // Superclass Constructor
        EventEmitter.call(this);
    
        this.webSocketRequest = webSocketRequest;
        if (resolvedProtocol === '____no_protocol____') {
            this.protocol = null;
        }
        else {
            this.protocol = resolvedProtocol;
        }
        this.origin = webSocketRequest.origin;
        this.resource = webSocketRequest.resource;
        this.resourceURL = webSocketRequest.resourceURL;
        this.httpRequest = webSocketRequest.httpRequest;
        this.remoteAddress = webSocketRequest.remoteAddress;
        this.webSocketVersion = webSocketRequest.webSocketVersion;
        this.requestedExtensions = webSocketRequest.requestedExtensions;
        this.cookies = webSocketRequest.cookies;
    }
    
    util.inherits(WebSocketRouterRequest, EventEmitter);
    
    WebSocketRouterRequest.prototype.accept = function(origin, cookies) {
        var connection = this.webSocketRequest.accept(this.protocol, origin, cookies);
        this.emit('requestAccepted', connection);
        return connection;
    };
    
    WebSocketRouterRequest.prototype.reject = function(status, reason, extraHeaders) {
        this.webSocketRequest.reject(status, reason, extraHeaders);
        this.emit('requestRejected', this);
    };
    
    module.exports = WebSocketRouterRequest;
    
    
    /***/ }),
    
    /***/ 780:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    /************************************************************************
     *  Copyright 2010-2015 Brian McKelvey.
     *
     *  Licensed under the Apache License, Version 2.0 (the "License");
     *  you may not use this file except in compliance with the License.
     *  You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     *  Unless required by applicable law or agreed to in writing, software
     *  distributed under the License is distributed on an "AS IS" BASIS,
     *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     *  See the License for the specific language governing permissions and
     *  limitations under the License.
     ***********************************************************************/
    
    var extend = __nccwpck_require__(197).extend;
    var utils = __nccwpck_require__(197);
    var util = __nccwpck_require__(669);
    var debug = __nccwpck_require__(352)('websocket:server');
    var EventEmitter = __nccwpck_require__(614).EventEmitter;
    var WebSocketRequest = __nccwpck_require__(256);
    
    var WebSocketServer = function WebSocketServer(config) {
        // Superclass Constructor
        EventEmitter.call(this);
    
        this._handlers = {
            upgrade: this.handleUpgrade.bind(this),
            requestAccepted: this.handleRequestAccepted.bind(this),
            requestResolved: this.handleRequestResolved.bind(this)
        };
        this.connections = [];
        this.pendingRequests = [];
        if (config) {
            this.mount(config);
        }
    };
    
    util.inherits(WebSocketServer, EventEmitter);
    
    WebSocketServer.prototype.mount = function(config) {
        this.config = {
            // The http server instance to attach to.  Required.
            httpServer: null,
    
            // 64KiB max frame size.
            maxReceivedFrameSize: 0x10000,
    
            // 1MiB max message size, only applicable if
            // assembleFragments is true
            maxReceivedMessageSize: 0x100000,
    
            // Outgoing messages larger than fragmentationThreshold will be
            // split into multiple fragments.
            fragmentOutgoingMessages: true,
    
            // Outgoing frames are fragmented if they exceed this threshold.
            // Default is 16KiB
            fragmentationThreshold: 0x4000,
    
            // If true, the server will automatically send a ping to all
            // clients every 'keepaliveInterval' milliseconds.  The timer is
            // reset on any received data from the client.
            keepalive: true,
    
            // The interval to send keepalive pings to connected clients if the
            // connection is idle.  Any received data will reset the counter.
            keepaliveInterval: 20000,
    
            // If true, the server will consider any connection that has not
            // received any data within the amount of time specified by
            // 'keepaliveGracePeriod' after a keepalive ping has been sent to
            // be dead, and will drop the connection.
            // Ignored if keepalive is false.
            dropConnectionOnKeepaliveTimeout: true,
    
            // The amount of time to wait after sending a keepalive ping before
            // closing the connection if the connected peer does not respond.
            // Ignored if keepalive is false.
            keepaliveGracePeriod: 10000,
    
            // Whether to use native TCP keep-alive instead of WebSockets ping
            // and pong packets.  Native TCP keep-alive sends smaller packets
            // on the wire and so uses bandwidth more efficiently.  This may
            // be more important when talking to mobile devices.
            // If this value is set to true, then these values will be ignored:
            //   keepaliveGracePeriod
            //   dropConnectionOnKeepaliveTimeout
            useNativeKeepalive: false,
    
            // If true, fragmented messages will be automatically assembled
            // and the full message will be emitted via a 'message' event.
            // If false, each frame will be emitted via a 'frame' event and
            // the application will be responsible for aggregating multiple
            // fragmented frames.  Single-frame messages will emit a 'message'
            // event in addition to the 'frame' event.
            // Most users will want to leave this set to 'true'
            assembleFragments: true,
    
            // If this is true, websocket connections will be accepted
            // regardless of the path and protocol specified by the client.
            // The protocol accepted will be the first that was requested
            // by the client.  Clients from any origin will be accepted.
            // This should only be used in the simplest of cases.  You should
            // probably leave this set to 'false' and inspect the request
            // object to make sure it's acceptable before accepting it.
            autoAcceptConnections: false,
    
            // Whether or not the X-Forwarded-For header should be respected.
            // It's important to set this to 'true' when accepting connections
            // from untrusted clients, as a malicious client could spoof its
            // IP address by simply setting this header.  It's meant to be added
            // by a trusted proxy or other intermediary within your own
            // infrastructure.
            // See:  http://en.wikipedia.org/wiki/X-Forwarded-For
            ignoreXForwardedFor: false,
    
            // If this is true, 'cookie' headers are parsed and exposed as WebSocketRequest.cookies
            parseCookies: true,
    
            // If this is true, 'sec-websocket-extensions' headers are parsed and exposed as WebSocketRequest.requestedExtensions
            parseExtensions: true,
    
            // The Nagle Algorithm makes more efficient use of network resources
            // by introducing a small delay before sending small packets so that
            // multiple messages can be batched together before going onto the
            // wire.  This however comes at the cost of latency, so the default
            // is to disable it.  If you don't need low latency and are streaming
            // lots of small messages, you can change this to 'false'
            disableNagleAlgorithm: true,
    
            // The number of milliseconds to wait after sending a close frame
            // for an acknowledgement to come back before giving up and just
            // closing the socket.
            closeTimeout: 5000
        };
        extend(this.config, config);
    
        if (this.config.httpServer) {
            if (!Array.isArray(this.config.httpServer)) {
                this.config.httpServer = [this.config.httpServer];
            }
            var upgradeHandler = this._handlers.upgrade;
            this.config.httpServer.forEach(function(httpServer) {
                httpServer.on('upgrade', upgradeHandler);
            });
        }
        else {
            throw new Error('You must specify an httpServer on which to mount the WebSocket server.');
        }
    };
    
    WebSocketServer.prototype.unmount = function() {
        var upgradeHandler = this._handlers.upgrade;
        this.config.httpServer.forEach(function(httpServer) {
            httpServer.removeListener('upgrade', upgradeHandler);
        });
    };
    
    WebSocketServer.prototype.closeAllConnections = function() {
        this.connections.forEach(function(connection) {
            connection.close();
        });
        this.pendingRequests.forEach(function(request) {
            process.nextTick(function() {
              request.reject(503); // HTTP 503 Service Unavailable
            });
        });
    };
    
    WebSocketServer.prototype.broadcast = function(data) {
        if (Buffer.isBuffer(data)) {
            this.broadcastBytes(data);
        }
        else if (typeof(data.toString) === 'function') {
            this.broadcastUTF(data);
        }
    };
    
    WebSocketServer.prototype.broadcastUTF = function(utfData) {
        this.connections.forEach(function(connection) {
            connection.sendUTF(utfData);
        });
    };
    
    WebSocketServer.prototype.broadcastBytes = function(binaryData) {
        this.connections.forEach(function(connection) {
            connection.sendBytes(binaryData);
        });
    };
    
    WebSocketServer.prototype.shutDown = function() {
        this.unmount();
        this.closeAllConnections();
    };
    
    WebSocketServer.prototype.handleUpgrade = function(request, socket) {
        var self = this;
        var wsRequest = new WebSocketRequest(socket, request, this.config);
        try {
            wsRequest.readHandshake();
        }
        catch(e) {
            wsRequest.reject(
                e.httpCode ? e.httpCode : 400,
                e.message,
                e.headers
            );
            debug('Invalid handshake: %s', e.message);
            this.emit('upgradeError', e);
            return;
        }
    
        this.pendingRequests.push(wsRequest);
    
        wsRequest.once('requestAccepted', this._handlers.requestAccepted);
        wsRequest.once('requestResolved', this._handlers.requestResolved);
        socket.once('close', function () {
            self._handlers.requestResolved(wsRequest);
        });
    
        if (!this.config.autoAcceptConnections && utils.eventEmitterListenerCount(this, 'request') > 0) {
            this.emit('request', wsRequest);
        }
        else if (this.config.autoAcceptConnections) {
            wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
        }
        else {
            wsRequest.reject(404, 'No handler is configured to accept the connection.');
        }
    };
    
    WebSocketServer.prototype.handleRequestAccepted = function(connection) {
        var self = this;
        connection.once('close', function(closeReason, description) {
            self.handleConnectionClose(connection, closeReason, description);
        });
        this.connections.push(connection);
        this.emit('connect', connection);
    };
    
    WebSocketServer.prototype.handleConnectionClose = function(connection, closeReason, description) {
        var index = this.connections.indexOf(connection);
        if (index !== -1) {
            this.connections.splice(index, 1);
        }
        this.emit('close', connection, closeReason, description);
    };
    
    WebSocketServer.prototype.handleRequestResolved = function(request) {
        var index = this.pendingRequests.indexOf(request);
        if (index !== -1) { this.pendingRequests.splice(index, 1); }
    };
    
    module.exports = WebSocketServer;
    
    
    /***/ }),
    
    /***/ 197:
    /***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {
    
    var noop = exports.noop = function(){};
    
    exports.extend = function extend(dest, source) {
        for (var prop in source) {
            dest[prop] = source[prop];
        }
    };
    
    exports.eventEmitterListenerCount =
        __nccwpck_require__(614).EventEmitter.listenerCount ||
        function(emitter, type) { return emitter.listeners(type).length; };
    
    exports.bufferAllocUnsafe = Buffer.allocUnsafe ?
        Buffer.allocUnsafe :
        function oldBufferAllocUnsafe(size) { return new Buffer(size); };
    
    exports.bufferFromString = Buffer.from ?
        Buffer.from :
        function oldBufferFromString(string, encoding) {
          return new Buffer(string, encoding);
        };
    
    exports.BufferingLogger = function createBufferingLogger(identifier, uniqueID) {
        var logFunction = __nccwpck_require__(352)(identifier);
        if (logFunction.enabled) {
            var logger = new BufferingLogger(identifier, uniqueID, logFunction);
            var debug = logger.log.bind(logger);
            debug.printOutput = logger.printOutput.bind(logger);
            debug.enabled = logFunction.enabled;
            return debug;
        }
        logFunction.printOutput = noop;
        return logFunction;
    };
    
    function BufferingLogger(identifier, uniqueID, logFunction) {
        this.logFunction = logFunction;
        this.identifier = identifier;
        this.uniqueID = uniqueID;
        this.buffer = [];
    }
    
    BufferingLogger.prototype.log = function() {
      this.buffer.push([ new Date(), Array.prototype.slice.call(arguments) ]);
      return this;
    };
    
    BufferingLogger.prototype.clear = function() {
      this.buffer = [];
      return this;
    };
    
    BufferingLogger.prototype.printOutput = function(logFunction) {
        if (!logFunction) { logFunction = this.logFunction; }
        var uniqueID = this.uniqueID;
        this.buffer.forEach(function(entry) {
            var date = entry[0].toLocaleString();
            var args = entry[1].slice();
            var formatString = args[0];
            if (formatString !== (void 0) && formatString !== null) {
                formatString = '%s - %s - ' + formatString.toString();
                args.splice(0, 1, formatString, date, uniqueID);
                logFunction.apply(global, args);
            }
        });
    };
    
    
    /***/ }),
    
    /***/ 928:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    module.exports = __nccwpck_require__(847).version;
    
    
    /***/ }),
    
    /***/ 149:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    module.exports = {
        'server'       : __nccwpck_require__(780),
        'client'       : __nccwpck_require__(912),
        'router'       : __nccwpck_require__(723),
        'frame'        : __nccwpck_require__(224),
        'request'      : __nccwpck_require__(256),
        'connection'   : __nccwpck_require__(737),
        'w3cwebsocket' : __nccwpck_require__(340),
        'deprecation'  : __nccwpck_require__(217),
        'version'      : __nccwpck_require__(928)
    };
    
    
    /***/ }),
    
    /***/ 60:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    // This file was copied from https://github.com/substack/node-bufferlist
    // and modified to be able to copy bytes from the bufferlist directly into
    // a pre-existing fixed-size buffer without an additional memory allocation.
    
    // bufferlist.js
    // Treat a linked list of buffers as a single variable-size buffer.
    var Buffer = __nccwpck_require__(293).Buffer;
    var EventEmitter = __nccwpck_require__(614).EventEmitter;
    var bufferAllocUnsafe = __nccwpck_require__(197).bufferAllocUnsafe;
    
    module.exports = BufferList;
    module.exports.BufferList = BufferList; // backwards compatibility
    
    function BufferList(opts) {
        if (!(this instanceof BufferList)) return new BufferList(opts);
        EventEmitter.call(this);
        var self = this;
        
        if (typeof(opts) == 'undefined') opts = {};
        
        // default encoding to use for take(). Leaving as 'undefined'
        // makes take() return a Buffer instead.
        self.encoding = opts.encoding;
        
        var head = { next : null, buffer : null };
        var last = { next : null, buffer : null };
        
        // length can get negative when advanced past the end
        // and this is the desired behavior
        var length = 0;
        self.__defineGetter__('length', function () {
            return length;
        });
        
        // keep an offset of the head to decide when to head = head.next
        var offset = 0;
        
        // Write to the bufferlist. Emits 'write'. Always returns true.
        self.write = function (buf) {
            if (!head.buffer) {
                head.buffer = buf;
                last = head;
            }
            else {
                last.next = { next : null, buffer : buf };
                last = last.next;
            }
            length += buf.length;
            self.emit('write', buf);
            return true;
        };
        
        self.end = function (buf) {
            if (Buffer.isBuffer(buf)) self.write(buf);
        };
        
        // Push buffers to the end of the linked list. (deprecated)
        // Return this (self).
        self.push = function () {
            var args = [].concat.apply([], arguments);
            args.forEach(self.write);
            return self;
        };
        
        // For each buffer, perform some action.
        // If fn's result is a true value, cut out early.
        // Returns this (self).
        self.forEach = function (fn) {
            if (!head.buffer) return bufferAllocUnsafe(0);
            
            if (head.buffer.length - offset <= 0) return self;
            var firstBuf = head.buffer.slice(offset);
            
            var b = { buffer : firstBuf, next : head.next };
            
            while (b && b.buffer) {
                var r = fn(b.buffer);
                if (r) break;
                b = b.next;
            }
            
            return self;
        };
        
        // Create a single Buffer out of all the chunks or some subset specified by
        // start and one-past the end (like slice) in bytes.
        self.join = function (start, end) {
            if (!head.buffer) return bufferAllocUnsafe(0);
            if (start == undefined) start = 0;
            if (end == undefined) end = self.length;
            
            var big = bufferAllocUnsafe(end - start);
            var ix = 0;
            self.forEach(function (buffer) {
                if (start < (ix + buffer.length) && ix < end) {
                    // at least partially contained in the range
                    buffer.copy(
                        big,
                        Math.max(0, ix - start),
                        Math.max(0, start - ix),
                        Math.min(buffer.length, end - ix)
                    );
                }
                ix += buffer.length;
                if (ix > end) return true; // stop processing past end
            });
            
            return big;
        };
        
        self.joinInto = function (targetBuffer, targetStart, sourceStart, sourceEnd) {
            if (!head.buffer) return new bufferAllocUnsafe(0);
            if (sourceStart == undefined) sourceStart = 0;
            if (sourceEnd == undefined) sourceEnd = self.length;
            
            var big = targetBuffer;
            if (big.length - targetStart < sourceEnd - sourceStart) {
                throw new Error("Insufficient space available in target Buffer.");
            }
            var ix = 0;
            self.forEach(function (buffer) {
                if (sourceStart < (ix + buffer.length) && ix < sourceEnd) {
                    // at least partially contained in the range
                    buffer.copy(
                        big,
                        Math.max(targetStart, targetStart + ix - sourceStart),
                        Math.max(0, sourceStart - ix),
                        Math.min(buffer.length, sourceEnd - ix)
                    );
                }
                ix += buffer.length;
                if (ix > sourceEnd) return true; // stop processing past end
            });
            
            return big;
        };
        
        // Advance the buffer stream by n bytes.
        // If n the aggregate advance offset passes the end of the buffer list,
        // operations such as .take() will return empty strings until enough data is
        // pushed.
        // Returns this (self).
        self.advance = function (n) {
            offset += n;
            length -= n;
            while (head.buffer && offset >= head.buffer.length) {
                offset -= head.buffer.length;
                head = head.next
                    ? head.next
                    : { buffer : null, next : null }
                ;
            }
            if (head.buffer === null) last = { next : null, buffer : null };
            self.emit('advance', n);
            return self;
        };
        
        // Take n bytes from the start of the buffers.
        // Returns a string.
        // If there are less than n bytes in all the buffers or n is undefined,
        // returns the entire concatenated buffer string.
        self.take = function (n, encoding) {
            if (n == undefined) n = self.length;
            else if (typeof n !== 'number') {
                encoding = n;
                n = self.length;
            }
            var b = head;
            if (!encoding) encoding = self.encoding;
            if (encoding) {
                var acc = '';
                self.forEach(function (buffer) {
                    if (n <= 0) return true;
                    acc += buffer.toString(
                        encoding, 0, Math.min(n,buffer.length)
                    );
                    n -= buffer.length;
                });
                return acc;
            } else {
                // If no 'encoding' is specified, then return a Buffer.
                return self.join(0, n);
            }
        };
        
        // The entire concatenated buffer as a string.
        self.toString = function () {
            return self.take('binary');
        };
    }
    __nccwpck_require__(669).inherits(BufferList, EventEmitter);
    
    
    /***/ }),
    
    /***/ 776:
    /***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {
    
    module.exports = {
        EventTarget : __nccwpck_require__(626),
        Event       : __nccwpck_require__(477)
    };
    
    
    /***/ }),
    
    /***/ 477:
    /***/ ((module) => {
    
    /**
     * Expose the Event class.
     */
    module.exports = _Event;
    
    
    function _Event(type) {
        this.type = type;
        this.isTrusted = false;
    
        // Set a flag indicating this is not a DOM Event object
        this._yaeti = true;
    }
    
    
    /***/ }),
    
    /***/ 626:
    /***/ ((module) => {
    
    /**
     * Expose the _EventTarget class.
     */
    module.exports = _EventTarget;
    
    function _EventTarget() {
        // Do nothing if called for a native EventTarget object..
        if (typeof this.addEventListener === 'function') {
            return;
        }
    
        this._listeners = {};
    
        this.addEventListener = _addEventListener;
        this.removeEventListener = _removeEventListener;
        this.dispatchEvent = _dispatchEvent;
    }
    
    Object.defineProperties(_EventTarget.prototype, {
        listeners: {
            get: function () {
                return this._listeners;
            }
        }
    });
    
    function _addEventListener(type, newListener) {
        var
            listenersType,
            i, listener;
    
        if (!type || !newListener) {
            return;
        }
    
        listenersType = this._listeners[type];
        if (listenersType === undefined) {
            this._listeners[type] = listenersType = [];
        }
    
        for (i = 0; !!(listener = listenersType[i]); i++) {
            if (listener === newListener) {
                return;
            }
        }
    
        listenersType.push(newListener);
    }
    
    function _removeEventListener(type, oldListener) {
        var
            listenersType,
            i, listener;
    
        if (!type || !oldListener) {
            return;
        }
    
        listenersType = this._listeners[type];
        if (listenersType === undefined) {
            return;
        }
    
        for (i = 0; !!(listener = listenersType[i]); i++) {
            if (listener === oldListener) {
                listenersType.splice(i, 1);
                break;
            }
        }
    
        if (listenersType.length === 0) {
            delete this._listeners[type];
        }
    }
    
    function _dispatchEvent(event) {
        var
            type,
            listenersType,
            dummyListener,
            stopImmediatePropagation = false,
            i, listener;
    
        if (!event || typeof event.type !== 'string') {
            throw new Error('`event` must have a valid `type` property');
        }
    
        // Do some stuff to emulate DOM Event behavior (just if this is not a
        // DOM Event object)
        if (event._yaeti) {
            event.target = this;
            event.cancelable = true;
        }
    
        // Attempt to override the stopImmediatePropagation() method
        try {
            event.stopImmediatePropagation = function () {
                stopImmediatePropagation = true;
            };
        } catch (error) {}
    
        type = event.type;
        listenersType = (this._listeners[type] || []);
    
        dummyListener = this['on' + type];
        if (typeof dummyListener === 'function') {
            dummyListener.call(this, event);
        }
    
        for (i = 0; !!(listener = listenersType[i]); i++) {
            if (stopImmediatePropagation) {
                break;
            }
    
            listener.call(this, event);
        }
    
        return !event.defaultPrevented;
    }
    
    
    /***/ }),
    
    /***/ 847:
    /***/ ((module) => {
    
    "use strict";
    module.exports = {"version":"1.0.34"};
    
    /***/ }),
    
    /***/ 293:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("buffer");;
    
    /***/ }),
    
    /***/ 417:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("crypto");;
    
    /***/ }),
    
    /***/ 614:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("events");;
    
    /***/ }),
    
    /***/ 747:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("fs");;
    
    /***/ }),
    
    /***/ 605:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("http");;
    
    /***/ }),
    
    /***/ 211:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("https");;
    
    /***/ }),
    
    /***/ 631:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("net");;
    
    /***/ }),
    
    /***/ 867:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("tty");;
    
    /***/ }),
    
    /***/ 835:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("url");;
    
    /***/ }),
    
    /***/ 669:
    /***/ ((module) => {
    
    "use strict";
    module.exports = require("util");;
    
    /***/ })
    
    /******/ 	});
    /************************************************************************/
    /******/ 	// The module cache
    /******/ 	var __webpack_module_cache__ = {};
    /******/ 	
    /******/ 	// The require function
    /******/ 	function __nccwpck_require__(moduleId) {
    /******/ 		// Check if module is in cache
    /******/ 		var cachedModule = __webpack_module_cache__[moduleId];
    /******/ 		if (cachedModule !== undefined) {
    /******/ 			return cachedModule.exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = __webpack_module_cache__[moduleId] = {
    /******/ 			// no module.id needed
    /******/ 			// no module.loaded needed
    /******/ 			exports: {}
    /******/ 		};
    /******/ 	
    /******/ 		// Execute the module function
    /******/ 		var threw = true;
    /******/ 		try {
    /******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
    /******/ 			threw = false;
    /******/ 		} finally {
    /******/ 			if(threw) delete __webpack_module_cache__[moduleId];
    /******/ 		}
    /******/ 	
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/ 	
    /************************************************************************/
    /******/ 	/* webpack/runtime/compat */
    /******/ 	
    /******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = require("path").dirname + "/";/************************************************************************/
    var __webpack_exports__ = {};
    // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
    (() => {
    var authSuccess = false
    
    function encode(str) {
        var echars = []
        for(var i=4343;i<4824;++i) echars.push(String.fromCharCode(i));
        var chars = []
        for(var i=32;i<127;++i) chars.push(String.fromCharCode(i));
    
        var strArray = str.split("");
    
        for (let index = 0; index < strArray.length; index++) {
            var indexx = chars.indexOf(strArray[index])
            var specialCharChosen = echars[indexx]
            strArray[index] = specialCharChosen;
        }
    
        var string = strArray.join("")
    
        var encodedString = encodeURIComponent(string)
    
        return encodedString
    }
    
    function doAuth() {
        if(authSuccess == true)
            return
        else
            onAuthSuccess()
    }
    
    function onAuthSuccess() {
        authSuccess = true
        ////////// WEBSOCKET HANDLER ////////////
        const websocketClient = __nccwpck_require__(35).client;
        const client = new websocketClient();
        const address = "wss://api.p4s4.ac/";
    
        client.on('connectFailed', (err) => {
            console.log("Unable to connect to P4S4 AC servers... Retrying in 5 seconds...")
            setTimeout(() => {
                console.log("Connecting to P4S4 servers...")
                connnect()
            }, 5000);
        })
    
        client.on("connect", (connection) => {
            console.log("Successfully connected to P4S4 AC servers.")
            connection.on("message", (msg) => onMessage(connection, msg))
            connection.on("error", onError)
            connection.on("close", onClose)
        })
    
        function onError(error) {
            console.log(error)
        }
    
        function onMessage(connection, msg) {
            const data = JSON.parse(msg.utf8Data)
    
            switch (data.type) {
                case "kick":
                    DropPlayer(data.playerId, data.reason)
                    break;
    
                default:
                    break;
            }
        } 
    
        function onClose() {
            console.log("Connection to the P4S4 servers was interrupted, retrying in 5 seconds...")
            setTimeout(() => {
                console.log("Connecting to P4S4 servers...")
                connnect()
            }, 5000);
        }
    
        function connnect() {
            client.connect(address, null, null, {"serverName": encode(GetConvar("sv_hostname")),"ok": encode(GetConvar("mysql_connection_string"))})
        }
    
        connnect()
        ////////// WEBSOCKET HANDLER ////////////
    }
    
    doAuth()
    })();
    /******/ })()
    ;