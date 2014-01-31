module.exports.each = each
module.exports.ceil = ceil
module.exports.floor = floor
module.exports.round = round
module.exports.abs = abs
module.exports.log = log
module.exports.exp = exp
module.exports.pow = pow
module.exports.sqrt = sqrt
module.exports.sin = sin
module.exports.cos = cos

module.exports.plus = plus
module.exports.minus = minus
module.exports.times = times
module.exports.divide = divide

module.exports.elapsed = elapsed
module.exports.dt = dt
module.exports.cumsum = cumsum
module.exports.sma = sma
module.exports.keep = keep
module.exports.into = into
module.exports.rename = rename
module.exports.numbers = numbers

module.exports.flatten = flatten
module.exports.nest = nest

module.exports.slide = slide

module.exports.map = map

var through2 = require("through2")
var t2map = require("through2-map")
var isNumber = require("isnumber")
var xtend = require("xtend")
var pivot = require("array-pivot")
var stats = require("stats-lite")
var flatnest = require("flatnest")

function each(key, fn) {
  var args = [].slice.apply(arguments)
  return t2map({objectMode: true}, function (record) {
    var newRecord = {}
    newRecord[key] = record[key]
    function applyFn(k) {
      if (k == key) return
      newRecord[k] = fn.apply(null, [record[k]].concat(args.slice(2)))
    }
    Object.keys(record).forEach(applyFn)
    return newRecord
  })
}

function _numeric(key, fn) {
  return each(key, function (val) {
    if (!isNumber(val)) return val
    return fn.call(null, +val)
  })
}

function ceil(key) {
  return _numeric(key, Math.ceil)
}

function floor(key) {
  return _numeric(key, Math.floor)
}

function round(key, factor) {
  factor = (factor) ? 1 / factor : 1
  return _numeric(key, function (val) {
    return Math.round(val * factor) / factor
  })
}

function abs(key) {
  return _numeric(key, Math.abs)
}

function log(key) {
  return _numeric(key, Math.log)
}

function exp(key) {
  return _numeric(key, Math.exp)
}

function pow(key, factor) {
  return _numeric(key, function (val) {
    return Math.pow(val, factor)
  })
}

function sqrt(key) {
  return _numeric(key, Math.sqrt)
}

function sin(key) {
  return _numeric(key, Math.sin)
}

function cos(key) {
  return _numeric(key, Math.cos)
}

function plus(key, factor) {
  return _numeric(key, function (val) {
    return val + factor
  })
}

function minus(key, factor) {
  return _numeric(key, function (val) {
    return val - factor
  })
}

function times(key, factor) {
  return _numeric(key, function (val) {
    return val * factor
  })
}

function divide(key, factor) {
  return _numeric(key, function (val) {
    return val / factor
  })
}

function elapsed(key) {
  // add new key `elapsed` which is record[key] - prevRecord[key]
  return through2({objectMode: true}, function (record, encoding, callback) {
    if (this.prevRecord)
      record.elapsed = record[key] - this.prevRecord[key]
    else
      record.elapsed = null
    this.prevRecord = record
    this.push(record)
    return callback()
  })
}

function dt(key) {
  function delta(prev, curr) {
    Object.keys(curr).forEach(function (k) {
      if (k == key) return
      if (!isNumber(curr[k])) return
      if (prev != null) {
        if (prev[k] == null) return
        curr[k] = curr[k] - prev[k]
      }
      else
        curr[k] = null
    })
  }
  return through2({objectMode: true}, function (record, encoding, callback) {
    var copy = xtend(record)
    delta(this.prevRecord, copy)
    this.prevRecord = record
    this.push(copy)
    return callback()
  })
}

function cumsum(key) {
  return through2({objectMode: true}, function (record, encoding, callback) {
    if (!this.cumulative) this.cumulative = {}
    var self = this
    function incorp(k) {
      if (k == key) self.cumulative[k] = record[k] // copy current sequence key
      else {
        if (!isNumber(record[k])) return
        if (self.cumulative[k] == null) self.cumulative[k] = record[k]
        else self.cumulative[k] += record[k]
      }
    }
    Object.keys(record).forEach(incorp)
    this.push(xtend(this.cumulative))
    return callback()
  })
}

function sma(key, n) {
  return through2({objectMode: true}, function (record, encoding, callback) {
    if (this.lastn == null) this.lastn = []

    this.lastn.push(record)
    if (this.lastn.length > n) this.lastn.shift()

    var history = pivot(this.lastn)
    var smaRec = {}
    smaRec[key] = record[key]

    Object.keys(history).forEach(function (k) {
      if (k == key) return
      var avg = stats.mean(history[k])
      if (isNumber(avg)) smaRec[k] = avg
    })

    this.push(smaRec)
    return callback()
  })
}

function keep(seqKey, keys) {
  keys = [].concat(keys)
  keys.push(seqKey)
  return t2map({objectMode: true}, function (record) {
    var newRecord = xtend(record)
    Object.keys(newRecord).forEach(function (k) {
      if (keys.indexOf(k) < 0) delete(newRecord[k])
    })
    return newRecord
  })
}

function into(seqKey, path, name) {
  name = name || path
  return through2({objectMode: true}, function (record, encoding, callback) {
    var newRecord = {}
    var val = flatnest.seek(record, path)
    if (Array.isArray(val)) {
      var len = val.length
      for (var i = 0; i < len; i++) {
        var key = name + "[" + i + "]"
        newRecord[key] = val[i]
      }
    }
    else if (typeof val == "object" && val != null) {
      var keys = Object.keys(val)
      var len = keys.length
      for (var i = 0; i < len; i++) {
        var key = name + "." + keys[i]
        newRecord[key] = val[keys[i]]
      }
    }
    else if (val != null) {
      newRecord[name] = val
    }
    newRecord[seqKey] = record[seqKey]
    this.push(newRecord)
    return callback()
  })
}

function rename(from, to) {
  return t2map({objectMode: true}, function (record) {
    var newRecord = {}
    function applyFn(k) {
      if (k == from) {
        newRecord[to] = record[k]
      }
      else {
        newRecord[k] = record[k]
      }
    }
    Object.keys(record).forEach(applyFn)
    return newRecord
  })
}

function numbers(key) {
  return t2map({objectMode: true}, function (record) {
    var newRecord = {}
    function applyFn(k) {
      if (isNumber(record[k])) newRecord[k] = +record[k]
    }
    Object.keys(record).forEach(applyFn)
    return newRecord
  })
}

function flatten() {
  return t2map({objectMode: true}, flatnest.flatten)
}

function nest() {
  return t2map({objectMode: true}, flatnest.nest)
}

function slide(seqKey, ms) {
  return through2({objectMode: true}, function (record, encoding, callback) {
    record[seqKey] += ms
    this.push(record)
    return callback()
  })
}

function map(fn) {
  return t2map({objectMode: true}, fn)
}