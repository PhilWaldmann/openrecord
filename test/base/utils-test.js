const Store = require('../../store/base')

describe('Utils', function() {
  const store = new Store()
  const utils = store.utils

  before(function() {
    return store.ready()
  })

  describe('compareObjects', function() {
    it('compare primitives', function() {
      utils.compareObjects('a', 'a').should.be.equal(true)
      utils.compareObjects('a', 'b').should.be.equal(false)
    })

    it('compare arrays', function() {
      utils.compareObjects(['a'], ['a']).should.be.equal(true)
      utils.compareObjects(['a'], ['b']).should.be.equal(false)
      utils.compareObjects(['a'], ['a', 'b']).should.be.equal(false)
      utils.compareObjects(['a'], 'a').should.be.equal(false)
      utils.compareObjects(['a'], '[a]').should.be.equal(false)
    })

    it('compare objects', function() {
      utils.compareObjects({ foo: 'a' }, { foo: 'a' }).should.be.equal(true)
      utils.compareObjects({ foo: 'a' }, true).should.be.equal(false)
      utils.compareObjects({ foo: 'a' }, { foo: 'b' }).should.be.equal(false)
      utils
        .compareObjects({ foo: 'a' }, { foo: 'a', bar: 'a' })
        .should.be.equal(false)
      utils.compareObjects({ foo: 'a' }, '{"foo": "a"}').should.be.equal(false)
    })

    it('compare deep objects', function() {
      utils
        .compareObjects({ foo: { x: 'a' } }, { foo: { x: 'a' } }, true)
        .should.be.equal(true)
      utils
        .compareObjects({ foo: { x: 'a' } }, true, true)
        .should.be.equal(false)
      utils
        .compareObjects({ foo: { x: 'a' } }, { foo: 'b' }, true)
        .should.be.equal(false)
      utils
        .compareObjects(
          { foo: { x: 'a' } },
          { foo: { x: 'a' }, bar: { x: 'a' } },
          true
        )
        .should.be.equal(false)
    })
  })

  describe('addedArrayValues', function() {
    it('returns array with new elements', function() {
      utils.addedArrayValues(['a'], ['a', 'b']).should.be.eql(['b'])
      utils.addedArrayValues(['a'], ['a', 'b', 'c']).should.be.eql(['b', 'c'])
    })

    it('returns empty array on missing params', function() {
      utils.addedArrayValues(['a']).should.be.eql([])
    })
  })

  describe('removedArrayValues', function() {
    it('returns array with removed elements', function() {
      utils.removedArrayValues(['a', 'c'], ['a', 'b']).should.be.eql(['c'])
      utils
        .removedArrayValues(['a', 'b', 'd', 'e'], ['a', 'b', 'c'])
        .should.be.eql(['d', 'e'])
    })

    it('returns right result on missing params', function() {
      utils.removedArrayValues(['a']).should.be.eql(['a'])
    })
  })
})
