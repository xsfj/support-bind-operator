'use strict'

const assert = require('assert')
const isObject = require('is-object')
const supportBindOperator = require('.')

describe('supportBindOperator()', function () {
  it('should have no effect if `this` is not bound', function () {
    const val = 'test'
    let arg
    supportBindOperator((a) => { arg = a })(val)
    assert.strictEqual(arg, val)
  })

  it('should have no effect if `this` is null', function () {
    const val = 'test'
    let arg
    supportBindOperator((a) => { arg = a }).call(null, val) // eslint-disable-line no-useless-call
    assert.strictEqual(arg, val)
  })

  it('should have no effect if `this` is undefined', function () {
    const val = 'test'
    let arg
    supportBindOperator((a) => { arg = a }).call(undefined, val) // eslint-disable-line no-undefined, no-useless-call
    assert.strictEqual(arg, val)
  })

  it('should make a bound `this` the first argument to the wrapped function', function () {
    const _this = {}
    const val = 'test'
    let args
    supportBindOperator((...a) => { args = a }).call(_this, val)
    assert.strictEqual(args[0], _this)
    assert.strictEqual(args[1], val)
  })

  it('should support making `this` the nth argument', function () {
    const _this = {}
    const val1 = 'test1'
    const val2 = 'test2'
    let args
    supportBindOperator({arg: 1}, (...a) => { args = a }).call(_this, val1, val2)
    assert.strictEqual(args[0], val1)
    assert.strictEqual(args[1], _this)
    assert.strictEqual(args[2], val2)
  })

  it('should support making `this` the nth argument (backcompat API)', function () {
    const _this = {}
    const val1 = 'test1'
    const val2 = 'test2'
    let args
    supportBindOperator(1, (...a) => { args = a }).call(_this, val1, val2)
    assert.strictEqual(args[0], val1)
    assert.strictEqual(args[1], _this)
    assert.strictEqual(args[2], val2)
  })

  it('should assign `this` to object arg via dot path', function () {
    const _this = {}
    const val1 = 'test1'
    const val2 = 'test2'
    let args
    supportBindOperator({arg: 2, path: 'options.context'}, (...a) => { args = a }).call(_this, val1, val2)
    assert.strictEqual(args[0], val1)
    assert.strictEqual(args[1], val2)
    assert(isObject(args[2]))
    assert(isObject(args[2].options))
    assert.strictEqual(args[2].options.context, _this)
  })

  it('should assign `this` to object arg via dot path (backcompat API)', function () {
    const _this = {}
    const val1 = 'test1'
    const val2 = 'test2'
    let args
    supportBindOperator(2, 'options.context', (...a) => { args = a }).call(_this, val1, val2)
    assert.strictEqual(args[0], val1)
    assert.strictEqual(args[1], val2)
    assert(isObject(args[2]))
    assert(isObject(args[2].options))
    assert.strictEqual(args[2].options.context, _this)
  })

  it('should ignore `this` if it’s blacklisted', function () {
    const _this = {}
    let arg
    supportBindOperator((a) => { arg = a }).call(_this)
    assert.strictEqual(arg, _this)
    supportBindOperator({ignoreThis: {}}, (a) => { arg = a }).call(_this)
    assert.strictEqual(arg, _this)
    supportBindOperator({ignoreThis: _this}, (a) => { arg = a }).call(_this)
    assert.notStrictEqual(arg, _this)
  })

  it('should ignore `this` if it’s in a blacklist array', function () {
    const _this = {}
    let arg
    supportBindOperator({ignoreThis: [_this]}, (a) => { arg = a }).call(_this)
    assert.notStrictEqual(arg, _this)
  })

  it('should ignore `this` if a blacklist function returns true', function () {
    const _this = {}
    let arg
    supportBindOperator({ignoreThis: x => x === _this}, (a) => { arg = a }).call(_this)
    assert.notStrictEqual(arg, _this)
  })
})