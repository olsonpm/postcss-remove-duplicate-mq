'use strict'

//
// README
// - The tests are very simple for now.  I'm assuming this plugin won't be used
//   often enough to warrant heavy testing, but the framework is in place to
//   expand if/when needed
//

//---------//
// Imports //
//---------//

const pify = require('pify')

const _ = require('lodash'),
  chai = require('chai'),
  createMqAst = require('postcss-create-mq-ast')(),
  pFs = pify(require('fs')),
  path = require('path'),
  postcss = require('postcss'),
  removeDuplicateMq = require('../index')()

//
//------//
// Init //
//------//

chai.should()

const simpleFixturesDir = path.join(__dirname, 'fixtures/simple')

const fixtures = {
  simple: {
    in: {
      formatted: '',
      messy: '',
      multipleMq: '',
    },
    out: {
      formatted: '',
      messy: '',
    },
  },
}

//
//------//
// Main //
//------//

populateFixtures().then(() => {
  suite('it should create a warning when', () => {
    const css = fixtures.simple.in.formatted

    test("postcss-create-mq-ast isn't added to the list of plugins", () => {
      return postcss([removeDuplicateMq])
        .process(css, { from: undefined })
        .then(testWarning)
    })

    test('postcss-create-mq-ast is placed after this plugin', () => {
      return postcss([removeDuplicateMq, createMqAst])
        .process(css, { from: undefined })
        .then(testWarning)
    })
  })

  suite('misc', () => {
    const css = fixtures.simple.in.multipleMq

    test('only a single warning should prompt', () => {
      return postcss([removeDuplicateMq, createMqAst])
        .process(css, { from: undefined })
        .then(testWarning)
    })
  })

  suite('success - simple', () => {
    const processor = postcss([createMqAst, removeDuplicateMq])

    test('formatted', () => {
      const css = {
        in: fixtures.simple.in.formatted,
        out: fixtures.simple.out.formatted,
      }
      return processor.process(css.in, { from: undefined }).then(result => {
        result.toString().should.equal(css.out)
      })
    })
    test('messy', () => {
      const css = {
        in: fixtures.simple.in.messy,
        out: fixtures.simple.out.messy,
      }
      return processor.process(css.in, { from: undefined }).then(result => {
        result.toString().should.equal(css.out)
      })
    })
  })

  run()
})

//
//------------------//
// Helper Functions //
//------------------//

function populateFixtures() {
  return pFs
    .readdir(simpleFixturesDir)
    .then(fileNames => {
      const readContentFileNamePairs = fileNames.map(aFileName => {
        const filePath = path.join(simpleFixturesDir, aFileName)
        return Promise.all([pFs.readFile(filePath, 'utf8'), aFileName])
      })

      return Promise.all(readContentFileNamePairs)
    })
    .then(contentFileNamePairs => {
      _.each(contentFileNamePairs, ([content, fileName]) => {
        if (fileName === 'multiple-mq.in.css') {
          fixtures.simple.in.multipleMq = content
          return
        }

        const [
          ,
          inOrOut,
          formattedOrMessy,
        ] = /\.(in|out)-(formatted|messy)\./.exec(fileName)

        fixtures.simple[inOrOut][formattedOrMessy] = content
      })
    })
}

function testWarning({ messages }) {
  messages.should.have.lengthOf(1)

  const warning = messages[0]

  warning.should.include({
    type: 'warning',
    line: 1,
    column: 1,
  })

  warning.text.should.match(
    /^Error: expected 'preludeCssTreeAst' on media AtRule/
  )
}
