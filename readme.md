# Remove Duplicate Media Queries

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [What is it](#what-is-it)
- [Install](#install)
- [Usage](#usage)
- [Why create it](#why-create-it)
- [How it works](#how-it-works)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## What is it

This is a very simple PostCSS plugin that transforms this:

```css
@media (min-width: 500px) and (max-width: 1000px) and (min-width: 500px) {
  color: blue;
}
```

into this:

```css
@media (min-width:500px) and (max-width:1000px) {
  color: blue;
}
```

## Install

`npm install postcss-remove-duplicate-mq`


## Usage

**Important**: This plugin has a peerDependency on [postcss-create-mq-ast](https://github.com/olsonpm/postcss-create-mq-ast).  That
plugin creates the media query ast used by this plugin to remove the duplicates.
This also means that plugin must come **before** `postcss-remove-duplicate-mq`.

```js
const createMqAst = require('postcss-create-mq-ast'),
  removeDuplicateMq = require('postcss-remove-duplicate-mq')

// 'createMqAst' _must_ come before 'removeDuplicateMq'
postcss([createMqAst(), removeDuplicateMq()])
  .process(...)
```


## Why create it

I use sass and write mixins such as

```scss
@include for-tablets {
  color: blue;
}
```

where my `for-tablets` mixin wraps the rule inside a media query.

There are times where it makes sense to nest these rules e.g.

```scss
@include for-phones-and-up {
  color: blue;

  @include for-phones {
    background-color: red;
  }
  @include for-tablets {
    background-color: green;
  }
}
```

Sass resolves the would-be illegal syntax by concatenating all the nested rules
together using the `and` operator.  This concatenation results in duplicate
media queries which I want removed.


## How it works

The code is very simple, so it may be easier just to give it a look.

It utilizes [postcss-create-mq-ast](https://github.com/olsonpm/postcss-create-mq-ast)
to create the media query ast.  It modifies the ast by removing all duplicate
[media features](https://github.com/csstree/csstree/blob/master/docs/ast.md#mediafeature)
and gets the new media query string.  Finally it replaces the [params value](http://api.postcss.org/AtRule.html#params)
with the new media query string.
