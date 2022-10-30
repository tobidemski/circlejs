# circle.js
circle.js is a dependency-free JavaScript ES6 circle component.
All items are aligned in a circle and can be rotated and resized.
Optionally you can add a connection line to connect each item.
A perfect module to highlight your key features.

## Getting started

Pull-in a latest version with NPM ...

```bash
npm install @tobidemski/circlejs
```

... provide `<link>` to the required core stylesheet.

```html
<!-- Required Core stylesheet -->
<link rel="stylesheet" href="node_modules/@tobidemski/circlejs/dist/css/circlejs.core.min.css">
```

... then, prepare a little bit of necessary markup ...

```html
<div class="circle example-circle">
    <div class="circle__items">
        <div class="circle__item circle__item--center">
            Item 1
        </div>
        <div class="circle__item circle__item--center">
            Item 2
        </div>
        <div class="circle__item circle__item--center">
            Item 3
        </div>
    </div>
    <!-- Optionally if you want to connect each circle item with a line -->
    <div class="circle__connections"></div>
    <!-- Optionally if you want to have a circle background in the size of the diameter -->
    <div class="circle__background"></div>
</div>
```

... and finally, initialize circlejs.

```js
import circle from '@tobidemski/circlejs'

new circle('.example-circle');
```

### Advanced

```js
import circle from '@tobidemski/circlejs'

let options = {
  startAngle: 'top',
  clockwise: false,
  center: 'full-center',
  enableRotation: true
}

let circle = new circle('.example-circle', options);

/**
 * Event which gets triggered if a new item is added.
 * @param {any} data
 * data.item: new added item
 * data.length: total items count
 */
circle.on('item.added', function (data) {
  data.item.textContent = `Item ${data.length}`;
});
        
circle.add(); // Adds a new circle item
```

See more in [Wiki](../../wiki)

#### Result

3 Items with connections

![3 items result](images/circlejs-3-items.png?raw=true)

4 Items with connections

![4 items result](images/circlejs-4-items.png?raw=true)

5 Items with connections

![5 items result](images/circlejs-5-items.png?raw=true)

## Contributing

Feel free to contribute to this module.

## Browser Support
 - Chrome
 - Edge
 - Firefox

## Building

Build using NPM scripts. The following scripts are available:
- `build:css` - Outputs CSS files from SASS files.
- `build:js` - Outputs all destination variants of the script.
- `build` - Comprehensively builds the entire library.
- `run:examples-server` - Starts a simple node.js express server to see some examples.

## Todos
- Bug: Changing the direction while rotating loses the current position and jumps to the new calculated position
- Bug: Changing the speed of rotation while rotating loses the current position and jumps to the new calculated position

## Credits
- [Tobi Demski](https://github.com/tobidemski) - Creator
- [Contributors](../../contributors)

## License

Copyright (c) 2022-present, [Tobi Demski](https://www.tobidemski.de/). Licensed under the terms of the [MIT License](https://opensource.org/licenses/MIT).