var test = require("tape").test
var concat = require("concat-stream")
var spigot = require("stream-spigot")

var ops = require("../")

function input() {
  return spigot({objectMode: true}, [
    {v: 0, foo: 0, bar: "hi"},
    {v: 1, foo: -1.1},
    {v: 2, foo: 2.2},
    {v: 3, foo: 3.3},
    {v: 4, foo: 4.4},
    {v: 5, foo: 5.5},
    {v: 7, foo: 6.6006},
  ])
}

test("apply", function (t) {
  t.plan(1)

  function inverse(val) {
    if (!isNaN(val)) return val * -1
    return val
  }

  function check(records) {
    var expected = [
      {v: 0, foo: 0, bar: "hi"},
      {v: 1, foo: 1.1},
      {v: 2, foo: -2.2},
      {v: 3, foo: -3.3},
      {v: 4, foo: -4.4},
      {v: 5, foo: -5.5},
      {v: 7, foo: -6.6006},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.apply("v", inverse)).pipe(concat(check))
})

test("ceil", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0, bar: "hi"},
      {v: 1, foo: -1},
      {v: 2, foo: 3},
      {v: 3, foo: 4},
      {v: 4, foo: 5},
      {v: 5, foo: 6},
      {v: 7, foo: 7},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.ceil("v")).pipe(concat(check))
})

test("floor", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0, bar: "hi"},
      {v: 1, foo: -2},
      {v: 2, foo: 2},
      {v: 3, foo: 3},
      {v: 4, foo: 4},
      {v: 5, foo: 5},
      {v: 7, foo: 6},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.floor("v")).pipe(concat(check))
})

test("round", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0, bar: "hi"},
      {v: 1, foo: -1.1},
      {v: 2, foo: 2.2},
      {v: 3, foo: 3.3},
      {v: 4, foo: 4.4},
      {v: 5, foo: 5.5},
      {v: 7, foo: 6.6},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.round("v", 0.1)).pipe(concat(check))
})

test("abs", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0, bar: "hi"},
      {v: 1, foo: 1.1},
      {v: 2, foo: 2.2},
      {v: 3, foo: 3.3},
      {v: 4, foo: 4.4},
      {v: 5, foo: 5.5},
      {v: 7, foo: 6.6006},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.abs("v")).pipe(concat(check))
})

test("log", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      // log n where n <= 0 == null
      // {v: 0, foo: Math.log(0), bar: "hi"},
      // {v: 1, foo: Math.log(-1.1)},
      {v: 2, foo: Math.log(2.2)},
      {v: 3, foo: Math.log(3.3)},
      {v: 4, foo: Math.log(4.4)},
      {v: 5, foo: Math.log(5.5)},
      {v: 7, foo: Math.log(6.6006)},
    ]
    t.deepEquals(records.splice(2), expected)
  }

  input().pipe(ops.log("v")).pipe(concat(check))
})

test("pow", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: Math.pow(0, 3), bar: "hi"},
      {v: 1, foo: Math.pow(-1.1, 3)},
      {v: 2, foo: Math.pow(2.2, 3)},
      {v: 3, foo: Math.pow(3.3, 3)},
      {v: 4, foo: Math.pow(4.4, 3)},
      {v: 5, foo: Math.pow(5.5, 3)},
      {v: 7, foo: Math.pow(6.6006, 3)},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.pow("v", 3)).pipe(concat(check))
})

test("sqrt", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: Math.sqrt(0), bar: "hi"},
      {v: 1, foo: Math.sqrt(1.1)}, // ran through abs() first
      {v: 2, foo: Math.sqrt(2.2)},
      {v: 3, foo: Math.sqrt(3.3)},
      {v: 4, foo: Math.sqrt(4.4)},
      {v: 5, foo: Math.sqrt(5.5)},
      {v: 7, foo: Math.sqrt(6.6006)},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.abs("v")).pipe(ops.sqrt("v", 3)).pipe(concat(check))
})

test("sin", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: Math.sin(0), bar: "hi"},
      {v: 1, foo: Math.sin(-1.1)},
      {v: 2, foo: Math.sin(2.2)},
      {v: 3, foo: Math.sin(3.3)},
      {v: 4, foo: Math.sin(4.4)},
      {v: 5, foo: Math.sin(5.5)},
      {v: 7, foo: Math.sin(6.6006)},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.sin("v")).pipe(concat(check))
})

test("cos", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: Math.cos(0), bar: "hi"},
      {v: 1, foo: Math.cos(-1.1)},
      {v: 2, foo: Math.cos(2.2)},
      {v: 3, foo: Math.cos(3.3)},
      {v: 4, foo: Math.cos(4.4)},
      {v: 5, foo: Math.cos(5.5)},
      {v: 7, foo: Math.cos(6.6006)},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.cos("v")).pipe(concat(check))
})

test("plus", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 2, bar: "hi"},
      {v: 1, foo: 0},
      {v: 2, foo: 4},
      {v: 3, foo: 5},
      {v: 4, foo: 6},
      {v: 5, foo: 7},
      {v: 7, foo: 8},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.floor("v")).pipe(ops.plus("v", 2)).pipe(concat(check))
})

test("minus", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0 - 2, bar: "hi"},
      {v: 1, foo: -2 - 2},
      {v: 2, foo: 2 - 2},
      {v: 3, foo: 3 - 2},
      {v: 4, foo: 4 - 2},
      {v: 5, foo: 5 - 2},
      {v: 7, foo: 6 - 2},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.floor("v")).pipe(ops.minus("v", 2)).pipe(concat(check))
})

test("times", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0 * 2, bar: "hi"},
      {v: 1, foo: -2 * 2},
      {v: 2, foo: 2 * 2},
      {v: 3, foo: 3 * 2},
      {v: 4, foo: 4 * 2},
      {v: 5, foo: 5 * 2},
      {v: 7, foo: 6 * 2},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.floor("v")).pipe(ops.times("v", 2)).pipe(concat(check))
})

test("divide", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0 / 2, bar: "hi"},
      {v: 1, foo: -2 / 2},
      {v: 2, foo: 2 / 2},
      {v: 3, foo: 3 / 2},
      {v: 4, foo: 4 / 2},
      {v: 5, foo: 5 / 2},
      {v: 7, foo: 6 / 2},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.floor("v")).pipe(ops.divide("v", 2)).pipe(concat(check))
})

test("elapsed", function (t) {
  t.plan(2)

  function check(records) {
    var expected = [
      //{v: 0, foo: 0, bar: "hi", elapsed: null},
      {v: 1, foo: -1.1, elapsed: 1},
      {v: 2, foo: 2.2, elapsed: 1},
      {v: 3, foo: 3.3, elapsed: 1},
      {v: 4, foo: 4.4, elapsed: 1},
      {v: 5, foo: 5.5, elapsed: 1},
      {v: 7, foo: 6.6006, elapsed: 2},
    ]
    t.ok(records[0].elapsed === null)
    t.deepEquals(records.splice(1), expected)
  }

  input().pipe(ops.elapsed("v")).pipe(concat(check))
})

test("dt", function (t) {
  t.plan(2)

  function check(records) {
    var expected = [
      //{v: 0, foo: 0, bar: "hi"},
      {v: 1, foo: -1.1},
      {v: 2, foo: 2.2 - -1.1},
      {v: 3, foo: 3.3 - 2.2},
      {v: 4, foo: 4.4 - 3.3},
      {v: 5, foo: 5.5 - 4.4},
      {v: 7, foo: 6.6006 - 5.5},
    ]
    t.ok(records[0].foo === null)
    t.deepEquals(records.splice(1), expected)
  }

  input().pipe(ops.dt("v")).pipe(concat(check))
})

test("cumsum", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0},
      {v: 1, foo: -1.1},
      {v: 2, foo: 1.1},
      {v: 3, foo: 4.4},
      {v: 4, foo: 8.8},
      {v: 5, foo: 14.3},
      {v: 7, foo: 20.9006},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.cumsum("v")).pipe(concat(check))
})


test("sma", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0},
      {v: 1, foo: -0.55},
      {v: 2, foo: (0 + -1.1 + 2.2) / 3},
      {v: 3, foo: (-1.1 + 2.2 + 3.3) / 3},
      {v: 4, foo: (2.2 + 3.3 + 4.4) / 3},
      {v: 5, foo: (3.3 + 4.4 + 5.5) / 3},
      {v: 7, foo: (4.4 + 5.5 + 6.6006) / 3},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.sma("v", 3)).pipe(concat(check))
})

test("keep", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, bar: "hi"},
      {v: 1},
      {v: 2},
      {v: 3},
      {v: 4},
      {v: 5},
      {v: 7},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.keep("v", ["bar"])).pipe(concat(check))
})

test("rename", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, zzz: 0, bar: "hi"},
      {v: 1, zzz: -1.1},
      {v: 2, zzz: 2.2},
      {v: 3, zzz: 3.3},
      {v: 4, zzz: 4.4},
      {v: 5, zzz: 5.5},
      {v: 7, zzz: 6.6006},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.rename("foo", "zzz")).pipe(concat(check))
})

test("numbers", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, foo: 0},
      {v: 1, foo: -1.1},
      {v: 2, foo: 2.2},
      {v: 3, foo: 3.3},
      {v: 4, foo: 4.4},
      {v: 5, foo: 5.5},
      {v: 7, foo: 6.6006},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.numbers("v")).pipe(concat(check))
})

test("slide", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 10, foo: 0, bar: "hi"},
      {v: 11, foo: -1.1},
      {v: 12, foo: 2.2},
      {v: 13, foo: 3.3},
      {v: 14, foo: 4.4},
      {v: 15, foo: 5.5},
      {v: 17, foo: 6.6006},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.slide("v", 10)).pipe(concat(check))
})

test("map", function (t) {
  t.plan(1)

  function appendString(record) {
    record.foo = "foo" + record.foo
    return record
  }

  function check(records) {
    var expected = [
      {v: 0, foo: "foo0", bar: "hi"},
      {v: 1, foo: "foo-1.1"},
      {v: 2, foo: "foo2.2"},
      {v: 3, foo: "foo3.3"},
      {v: 4, foo: "foo4.4"},
      {v: 5, foo: "foo5.5"},
      {v: 7, foo: "foo6.6006"},
    ]
    t.deepEquals(records, expected)
  }

  input().pipe(ops.map(appendString)).pipe(concat(check))
})