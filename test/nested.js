var test = require("tape").test
var concat = require("concat-stream")
var spigot = require("stream-spigot")

var ops = require("../")

function nested() {
  return spigot({objectMode: true}, [
    {v: 0, abc: {def: ["v0", "v0.1"]}, zyx: ["aa", "ab"]},
    {v: 1, abc: {def: ["v1", "v1.1"]}, zyx: ["ba", "bb"]},
    {v: 2, abc: {def: ["v2", "v2.1"]}, zyx: ["ca", "cb"]},
    {v: 3, abc: {def: ["v3", "v3.1"]}, zyx: ["da", "db"]},
    {v: 4, abc: {def: ["v4", "v4.1"]}, zyx: ["ea", "eb"]},
    {v: 5, abc: {def: ["v5", "v5.1"]}, zyx: ["fa", "fb"]},
    {v: 6},
  ])
}

test("into shallow", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
    {v: 0, "abc.def[0]": "v0", "abc.def[1]": "v0.1"},
    {v: 1, "abc.def[0]": "v1", "abc.def[1]": "v1.1"},
    {v: 2, "abc.def[0]": "v2", "abc.def[1]": "v2.1"},
    {v: 3, "abc.def[0]": "v3", "abc.def[1]": "v3.1"},
    {v: 4, "abc.def[0]": "v4", "abc.def[1]": "v4.1"},
    {v: 5, "abc.def[0]": "v5", "abc.def[1]": "v5.1"},
    {v: 6},
    ]
    t.deepEquals(records, expected)
  }

  nested().pipe(ops.into("v", "abc.def")).pipe(concat(check))
})

test("into shallow rename", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
    {v: 0, "bar[0]": "v0", "bar[1]": "v0.1"},
    {v: 1, "bar[0]": "v1", "bar[1]": "v1.1"},
    {v: 2, "bar[0]": "v2", "bar[1]": "v2.1"},
    {v: 3, "bar[0]": "v3", "bar[1]": "v3.1"},
    {v: 4, "bar[0]": "v4", "bar[1]": "v4.1"},
    {v: 5, "bar[0]": "v5", "bar[1]": "v5.1"},
    {v: 6},
    ]
    t.deepEquals(records, expected)
  }

  nested().pipe(ops.into("v", "abc.def", "bar")).pipe(concat(check))
})

test("into array rename", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, "foo": "ab"},
      {v: 1, "foo": "bb"},
      {v: 2, "foo": "cb"},
      {v: 3, "foo": "db"},
      {v: 4, "foo": "eb"},
      {v: 5, "foo": "fb"},
      {v: 6},
    ]
    t.deepEquals(records, expected)
  }

  nested().pipe(ops.into("v", "zyx[1]", "foo")).pipe(concat(check))
})

test("into deep", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {v: 0, "abc.def[1]": "v0.1"},
      {v: 1, "abc.def[1]": "v1.1"},
      {v: 2, "abc.def[1]": "v2.1"},
      {v: 3, "abc.def[1]": "v3.1"},
      {v: 4, "abc.def[1]": "v4.1"},
      {v: 5, "abc.def[1]": "v5.1"},
      {v: 6},
    ]
    t.deepEquals(records, expected)
  }

  nested().pipe(ops.into("v", "abc.def[1]")).pipe(concat(check))
})

test("flatten", function (t) {
  t.plan(1)

  function check(records) {
    var expected = [
      {"v":0,"abc.def[0]":"v0","abc.def[1]":"v0.1","zyx[0]":"aa","zyx[1]":"ab"},
      {"v":1,"abc.def[0]":"v1","abc.def[1]":"v1.1","zyx[0]":"ba","zyx[1]":"bb"},
      {"v":2,"abc.def[0]":"v2","abc.def[1]":"v2.1","zyx[0]":"ca","zyx[1]":"cb"},
      {"v":3,"abc.def[0]":"v3","abc.def[1]":"v3.1","zyx[0]":"da","zyx[1]":"db"},
      {"v":4,"abc.def[0]":"v4","abc.def[1]":"v4.1","zyx[0]":"ea","zyx[1]":"eb"},
      {"v":5,"abc.def[0]":"v5","abc.def[1]":"v5.1","zyx[0]":"fa","zyx[1]":"fb"},
      {"v":6}
    ]
    t.deepEquals(records, expected)
  }

  nested().pipe(ops.flatten()).pipe(concat(check))
})

test("nest", function (t) {
  t.plan(1)

  var input = [
    {"v":0,"abc.def[0]":"v0","abc.def[1]":"v0.1","zyx[0]":"aa","zyx[1]":"ab"},
    {"v":1,"abc.def[0]":"v1","abc.def[1]":"v1.1","zyx[0]":"ba","zyx[1]":"bb"},
    {"v":2,"abc.def[0]":"v2","abc.def[1]":"v2.1","zyx[0]":"ca","zyx[1]":"cb"},
    {"v":3,"abc.def[0]":"v3","abc.def[1]":"v3.1","zyx[0]":"da","zyx[1]":"db"},
    {"v":4,"abc.def[0]":"v4","abc.def[1]":"v4.1","zyx[0]":"ea","zyx[1]":"eb"},
    {"v":5,"abc.def[0]":"v5","abc.def[1]":"v5.1","zyx[0]":"fa","zyx[1]":"fb"},
    {"v":6}
  ]

  function check(records) {
    var expected = [
      {v: 0, abc: {def: ["v0", "v0.1"]}, zyx: ["aa", "ab"]},
      {v: 1, abc: {def: ["v1", "v1.1"]}, zyx: ["ba", "bb"]},
      {v: 2, abc: {def: ["v2", "v2.1"]}, zyx: ["ca", "cb"]},
      {v: 3, abc: {def: ["v3", "v3.1"]}, zyx: ["da", "db"]},
      {v: 4, abc: {def: ["v4", "v4.1"]}, zyx: ["ea", "eb"]},
      {v: 5, abc: {def: ["v5", "v5.1"]}, zyx: ["fa", "fb"]},
      {v: 6},
    ]
    t.deepEquals(records, expected)
  }

  spigot({objectMode: true}, input).pipe(ops.nest()).pipe(concat(check))
})