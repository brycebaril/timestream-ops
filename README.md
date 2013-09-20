timestream-ops
=====

[![NPM](https://nodei.co/npm/timestream-ops.png)](https://nodei.co/npm/timestream-ops/)

Mapped operation Transforms for sequential objectMode streams (e.g. timeseries data). Contains a set of stream Transforms that accept ordered objectMode streams with a sequenceKey perform an operation on each value in each record.

Most of these operations are shallow, that is they will not descend into nested keys at each record.

```javascript
var tsops = require("timestream-ops")
var spigot = require("stream-spigot")
var concat = require("concat-stream")

var source = spigot({objectMode: true}, [
  {v: 0, foo: 0, bar: "hi"},
  {v: 1, foo: -1.1},
  {v: 2, foo: 2.2},
  {v: 3, foo: 3.3},
  {v: 4, foo: 4.4},
  {v: 5, foo: 5.5},
  {v: 7, foo: 6.6006},
])

source.pipe(tsops.sin("v")).pipe(concat(console.log))

/*
[ { v: 0, foo: 0, bar: 'hi' },
  { v: 1, foo: -0.8912073600614354 },
  { v: 2, foo: 0.8084964038195901 },
  { v: 3, foo: -0.1577456941432482 },
  { v: 4, foo: -0.951602073889516 },
  { v: 5, foo: -0.7055403255703919 },
  { v: 7, foo: 0.3121114469569012 } ]
 */
```

API
===

This library includes a whole pile of transforms that operate on each record. All operations skip the specified sequence key, if appliccable or unless otherwise noted.

* apply
* ceil
* floor
* round
* abs
* log
* exp
* pow
* sqrt
* sin
* cos
* plus
* minus
* times
* divide
* elapsed
* dt
* cumsum
* sma
* keep
* into
* rename
* numbers
* flatten
* nest
* slide
* map

`apply(seqKey, fn)`
---

Apply `fn` to each value in each record, leaving the sequence key `seqKey` alone. Walks through each record calling `fn` for each value, so `fn` should accept a value and return what you would like the new value to be.

`ceil(seqKey)`
---

Apply `Math.ceil` to each numeric value in each record.

`floor(seqKey)`
---

Apply `Math.floor` to each numeric value in each record.

`round(seqKey, factor)`
---

Round each numeric value in each record to the specified factor. E.g. if the factor is `10` it will round to the tens place `333 -> 330`.

`abs(seqKey)`
---

Apply `Math.abs` to each numeric value in each record.

`log(seqKey)`
---

Apply `Math.log` to each numeric value in each record.

`exp(seqKey)`
---

Apply `Math.exp` to each numeric value in each record.

`pow(seqKey, factor)`
---

Apply `Math.pow(number, factor)` to each numeric value in each record.

`sqrt(seqKey)`
---

Apply `Math.sqrt` to each numeric value in each record.

`sin(seqKey)`
---

Apply `Math.sin` to each numeric value in each record.

`cos(seqKey)`
---

Apply `Math.cos` to each numeric value in each record.

`plus(seqKey, addend)`
---

Add the value `addend` to each numeric value in each record.

`minus(seqKey, addend)`
---

Subtract the value `addend` from each numeric value in each record.

`times(seqKey, factor)`
---

Multiply the value `factor` by each numeric value in each record.

`divide(seqKey, factor)`
---

Divide each numeric value in each record by the value `factor`.

`elapsed(seqKey)`
---

Insert a new key `elapsed` in each record, which is the difference in time since the previous record in the timeseries.

`dt(seqKey)`
---

For each numeric value in each record, replace the value with its difference from the previous value. This can be considered similar to a differential.

`cumsum(seqKey)`
---

Replace each numeric value with the cumulative sum of all numeric values at that key prior to this record.

`sma(key, n)`
---

Replace each numeric value with the Simple Moving Average (mean) of that value for the previous `n` records.

`keep(seqKey, keys)`
---

Keep only the keys specified by the array `keys` in each record.

`into(seqKey, path [,name])`
---

Replace the record with a new record which is at the key or key path specified by `path` and optionally rename the key to `name`. Use this to convert timeseries with partitioned or nested data into specific portions of each record only. `path` accepts js dot notation, e.g. `into("v", "foo.bar[2]")` would find in each record a property named `foo`, in each of those objects a property named `bar` which stores an array, then from that array take the 3rd element only.

`rename(from, to)`
---

Rename the key `from` to the name `to` at each record. This will operate on any property of the record, including the sequence key.

`numbers(seqKey)`
---

Remove all non-numeric values from each record.

`flatten()`
---

Flatten the record (using [flatnest](http://npm.im/flatnest)) into a record with no nested structures, preserving content.

E.g.
```
[
  {v: 0, abc: {def: ["v0", "v0.1"]}, zyx: ["aa", "ab"]},
  {v: 1, abc: {def: ["v1", "v1.1"]}, zyx: ["ba", "bb"]},
  {v: 2, abc: {def: ["v2", "v2.1"]}, zyx: ["ca", "cb"]},
  {v: 3, abc: {def: ["v3", "v3.1"]}, zyx: ["da", "db"]},
  {v: 4, abc: {def: ["v4", "v4.1"]}, zyx: ["ea", "eb"]},
  {v: 5, abc: {def: ["v5", "v5.1"]}, zyx: ["fa", "fb"]},
  {v: 6},
]
```

Becomes:
```
[
  {"v":0,"abc.def[0]":"v0","abc.def[1]":"v0.1","zyx[0]":"aa","zyx[1]":"ab"},
  {"v":1,"abc.def[0]":"v1","abc.def[1]":"v1.1","zyx[0]":"ba","zyx[1]":"bb"},
  {"v":2,"abc.def[0]":"v2","abc.def[1]":"v2.1","zyx[0]":"ca","zyx[1]":"cb"},
  {"v":3,"abc.def[0]":"v3","abc.def[1]":"v3.1","zyx[0]":"da","zyx[1]":"db"},
  {"v":4,"abc.def[0]":"v4","abc.def[1]":"v4.1","zyx[0]":"ea","zyx[1]":"eb"},
  {"v":5,"abc.def[0]":"v5","abc.def[1]":"v5.1","zyx[0]":"fa","zyx[1]":"fb"},
  {"v":6}
]

```

`nest()`
---

Nest the record (using [flatnest](http://npm.im/flatnest)) into a nested structure based on the key names. Typically used to undo a `flatten()` operation.

`slide(seqKey, value)`
---

Add `value` to `seqKey` at each record, effectively sliding it in time.

`map(fn)`
---

Do it yourself! Full control of each record, using [through2-map](http://npm.im/through2-map). Provide a function that accepts a record, and return a new record to send downstream.

LICENSE
=======

MIT
