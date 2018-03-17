//---------//
// Imports //
//---------//

const postcss = require('postcss'),
  mediaQueryParser = require('postcss-media-query-parser')

//
//------//
// Main //
//------//

const plugin = postcss.plugin('postcss-remove-duplicate-mq', () => {
  return root => {
    root.walkAtRules('media', atRule => {
      // atRule.params = atRule.params.replace(' and (min-width: 500px)', '')
      const duplicates = getDuplicateMinMaxRules(atRule.params)
      if (isEmpty(duplicates)) return

      const declWalker = createDeclWalker(duplicates)
      atRule.walkDecls(declWalker)
    })
  }
})

//
//------------------//
// Helper Functions //
//------------------//

function createDeclWalker(duplicates) {
  return decl => {
    const css = getAtPath(decl, ['source', 'input', 'css'])

    if (css) {
      const after = css.replace(' and (min-width: 500px)', '')
      decl.source.input.css = after
    }

    // const css = getAtPath(decl, ['source', 'input', 'css']) || ''
    // //
    // // TODO: find if this will always return true.  Needs a larger codebase
    // //   to walk/verify for me to feel confident without it
    // //
    // if (stringIncludes(css, '@media ')) {
    //   removeDuplicates(decl, css, duplicates)
    // }
  }
}

function removeDuplicates(decl, css, duplicates) {
  decl.source.input.css
}

function isEmpty(hasLength) {
  return hasLength.length === 0
}

function getDuplicateMinMaxRules(mediaParams) {
  return passThrough(mediaParams, [
    mediaQueryParser,
    getAllMinMaxRules,
    getDuplicates,
  ])
}

function getDuplicates(anArray) {
  let duplicateFound = false,
    i = 0,
    currentElement

  const addedAlready = new Set(),
    duplicates = new Set()

  while (!duplicateFound && i < anArray.length) {
    currentElement = anArray[i]
    duplicateFound = addedAlready.has(currentElement)
    if (duplicateFound) duplicates.add(duplicateFound)
    else addedAlready.add(currentElement)
    i += 1
  }

  return [...duplicates]
}

function passThrough(arg, functionArray) {
  return functionArray.reduce((result, aFunction) => aFunction(result), arg)
}

function getAllMinMaxRules(aString) {
  let match
  const result = []
  do {
    match = minMaxRuleRegex.exec(aString)
    if (match && match[1]) result.push(match[1])
  } while (match != null)

  return result
}

function getAtPath(anObject, aPath) {
  let i = 0,
    keyMatches = true

  while (keyMatches && i < aPath.length) {
    const key = aPath[i]
    keyMatches = hasKey(anObject, key)
    if (keyMatches) anObject = anObject[key]
    i += 1
  }

  return keyMatches && i === aPath.length ? anObject : undefined
}

function hasKey(anObject, key) {
  if (anObject == null) return false

  return (
    anObject[key] !== undefined ||
    (typeof anObject === 'object' && key in anObject)
  )
}

//
//---------//
// Exports //
//---------//

module.exports = plugin
