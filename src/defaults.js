export default {

    classes: {
        item: 'circle__item',
        items: 'circle__items',
        connection: 'circle__connection',
        connections: 'circle__connections',
        background: 'circle__background'
    },
    radius: 200,
    startAngle: function (items) { return items.length == 4 ? 'top-left' : 'top'; },
    clockwise: true,
    center: null,
    enableRotation: false,
    rotationDuration: 3000,
    includeItemSizeInBackground: false,
    loglevel: 'error'
}