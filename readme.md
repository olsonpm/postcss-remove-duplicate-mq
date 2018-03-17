# Remove duplicate media queries

This is a very simple postcss plugin that transforms this:
```css
@media (min-width: 500px) and (max-width: 1000px) and (min-width: 500px) {
  color: blue;
}
```

into this:
```css
@media (min-width: 500px) and (max-width: 1000px) {
  color: blue;
}
```

**Note the following assumptions**.  These fit my personal use-case and simplify
the code a ton.
- only removes duplicate min and max width queries
- doesn't care about logical operators.

The code just checks for strings that match `/(\((?:min|max)-width: [^\)]\)))/`.
Any duplicates are then removed along with their preceding operator

## Usage

```js
postcss([ require('postcss-mq-remove-duplicates')() ])
```
