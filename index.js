'use strict'

//---------//
// Imports //
//---------//

const cssTree = require('css-tree'),
  List = require('css-tree/lib/utils/list'),
  packageJson = require('./package.json'),
  postcss = require('postcss')

//
//------//
// Init //
//------//

const issueUrl = packageJson.bugs.url

//
//------//
// Main //
//------//

const plugin = postcss.plugin('postcss-remove-duplicate-mq', () => {
  return (root, result) => {
    root.walkAtRules('media', atRule => {
      if (!atRule.preludeCssTreeAst) {
        createWarning(result, atRule)
        return false
      }

      // mutates the media features in the ast
      atRule.preludeCssTreeAst.children
        .first()
        .children.forEach(removeDuplicateMediaFeatures)

      const newPreludeString = cssTree.generate(atRule.preludeCssTreeAst)

      atRule.params = newPreludeString
    })
  }
})

//
//------------------//
// Helper Functions //
//------------------//

function createWarning(result, atRule) {
  atRule.warn(
    result,
    "Error: expected 'preludeCssTreeAst' on media AtRule.  This means" +
      " you either\n  1. Don't have the peerDependency" +
      " 'postcss-create-mq-ast' installed.\n  2. Didn't add it to your" +
      " list of postcss plugins.\n  3. Didn't place that plugin before" +
      ' this one (postcss-remove-duplicate-mq).\n\nIf you did all three' +
      ` of those then please file a github issue at ${issueUrl} so I` +
      ' can figure out what went wrong.'
  )
}

function removeDuplicateMediaFeatures(mediaQuery) {
  const result = new List(),
    alreadyAdded = new Set()

  let cursor = mediaQuery.children.head

  while (cursor !== null) {
    if (cursor.data.type !== 'MediaFeature') {
      result.appendData(cursor.data)
    } else {
      const id = cssTree.generate(cursor.data)
      if (!alreadyAdded.has(id)) {
        result.appendData(cursor.data)
        alreadyAdded.add(id)
      } else {
        while (result.last().type !== 'MediaFeature') {
          result.remove(result.tail)
        }
      }
    }

    cursor = cursor.next
  }

  mediaQuery.children = result
}

//
//---------//
// Exports //
//---------//

module.exports = plugin
