import defaults from './defaults'
import { mergeOptions } from './utils/object'
import * as logger from './utils/log'
import math from './utils/math'
import dom from './utils/dom'
import EventHandler from './utils/eventHandler'

export default class Circle {
    #root;
    #connections;
    #handler = new EventHandler();

    #previousAngle = null;
    #startAngle;
    #startRadius;

    #isRotationRunning = false;
    #isRotationStopped = true;
    #startTime = null;
    #pTime = 0;
    #timeElapsed = 0;
    #rotationDuration = 0;
    #isClockwiseDirection = true;


    constructor(selector, options = {}) {
        this.settings = mergeOptions(defaults, options);
        this.#root = typeof selector === 'string' ? document.querySelector(selector) : selector;
        this.#connections = this.#root.querySelector('.' + this.settings.classes.connections);

        this.#isRotationRunning = this.settings.enableRotation;
        this.#isRotationStopped = !this.#isRotationRunning;
        this.#rotationDuration = this.settings.rotationDuration;
        this.#isClockwiseDirection = this.settings.clockwise;

        this.#startAngle = this.settings.startAngle;
        this.#startRadius = this.settings.radius;

        this.#mount();
    }

    #mount() {
        this.#root.style.visibility = 'hidden';

        this.refresh();

        this.#root.classList.add('circle--initialized');
        this.#root.style.removeProperty('visibility');

        window.addEventListener('resize', () => {
            this.refresh();
        });

        if (this.#isRotationRunning) {
            window.requestAnimationFrame(this.#rotateAnimationFrame);
        }
    }

    startRotation() {
        this.#isRotationRunning = true;
        this.#startTime = null;
        this.#pTime = 0;
        this.#timeElapsed = 0;

        if (this.#isRotationStopped) {
            this.#isRotationStopped = false;
            window.requestAnimationFrame(this.#rotateAnimationFrame);
        }

    }

    pauseRotation() {
        this.#isRotationRunning = false;
    }

    stopRotation() {
        this.#isRotationStopped = true;
        this.#isRotationRunning = false;
        this.#startTime = null;
        this.#pTime = 0;
        this.#timeElapsed = 0;
        this.#previousAngle = null;
        this.refresh();
    }

    changeRotationDuration(seconds) {
        let duration = parseFloat(seconds);

        if (duration != this.#rotationDuration) {

            let items = this.#getItems();
            let step = 2 * Math.PI / items.length;

            let currentAngle = this.#previousAngle;
            let timeElapsed = 0;
            let isFound = false;
            let ts = Date.now();

            do {
                let delta = ts - this.#startTime;
                timeElapsed = delta - this.#pTime;

                let angle = this.#getNextAngle(items, timeElapsed, duration);

                if (currentAngle >= angle) {
                    isFound = true;
                }

                ts += 1;
            } while (!isFound);

            this.#timeElapsed = timeElapsed;
            this.#rotationDuration = duration;
        }

    }

    changeRotationDirection(clockwise) {
        this.#isClockwiseDirection = clockwise === true;
    }

    add() {

        let item = this.#addItem();

        this.#handler.emit('item.added', { item: item, length: this.#getItems().length });

        this.refresh();
    }

    remove() {
        let items = this.#getItems();

        this.#log(`Found ${items.length} items.`);

        if (items.length > 0) {

            this.#removeItem();

            this.refresh();

            this.#handler.emit('item.deleted', { itemCount: items.length });
        }
    }

    reset() {
        this.#log(`Reset circle.`);
        this.#handler.emit('reset.started', {});

        this.#previousAngle = null;
        this.#startAngle = this.settings.startAngle;
        this.#startRadius = this.settings.radius;
        this.#rotationDuration = this.settings.rotationDuration;
        this.#isClockwiseDirection = this.settings.clockwise;


        this.#isRotationRunning = this.settings.enableRotation;
        this.#isRotationStopped = !this.#isRotationRunning;
        this.#startTime = null;
        this.#pTime = 0;
        this.#timeElapsed = 0;

        if (this.#isRotationRunning) {
            this.startRotation();
        }

        this.refresh();

        this.#handler.emit('reset.finished', {});
    }

    refresh() {
        this.#log(`Refreshing circle.`);
        this.#handler.emit('refresh.started', {});

        let items = this.#getItems();
        let diameter = this.#resolveRadius(items, this.#startRadius) * 2;

        let item = items.length == 0 ? null : items[0];
        let isNewItemNeeded = item == null;

        /* Spawn an item to get the width / height from one item */
        if (isNewItemNeeded) {
            item = this.#addItem(true);
        }

        let itemRect = item.getBoundingClientRect();

        if (isNewItemNeeded) {
            this.#removeItem(item);
        }

        if (!this.#isFullCenter()) {
            this.#root.style.width = diameter + itemRect.width + 'px';
        }

        this.#root.style.height = diameter + itemRect.height + 'px';

        if (!this.#isFullCenter() && this.settings.center === 'center') {
            this.#root.style.marginLeft = 'auto';
            this.#root.style.marginRight = 'auto';
        } else {
            this.#root.style.removeProperty('marginLeft');
            this.#root.style.removeProperty('marginRight');
        }

        this.#calculateAndRenderItems(this.#timeElapsed);
        this.#renderConnections();
        this.#renderCircleBackground({ width: itemRect.width, height: itemRect.height });


        this.#handler.emit('refresh.finished', {});
    }

    rotate(deg) {
        this.#startAngle = parseFloat(deg);
        this.#startTime = null;
        this.#pTime = 0;
        this.#timeElapsed = 0;
        this.#previousAngle = null;
        this.refresh();
        this.#previousAngle = null;
    }

    setRadius(radius) {
        this.#startRadius = parseFloat(radius);

        this.refresh();
    }

    resetRadius() {
        this.#startRadius = this.settings.radius;

        this.refresh();
    }

    /**
    * Adds listener to the specifed event.
    *
    * @param {String|Array} event
    * @param {Function} handler
    */
    on(event, handler) {

        this.#handler.on(event, handler);

        return this;
    }

    #getItems() {
        return this.#root.querySelectorAll(`.${this.settings.classes.items} > .` + this.settings.classes.item);
    }

    #removeItem(item) {
        let items = this.#getItems();

        if (items.length > 0) {
            let lastItem = item || items[items.length - 1];
            lastItem.parentNode.removeChild(lastItem);

            if (this.#connections != null) {
                let connectionItems = this.#root.querySelectorAll(`.${this.settings.classes.connections} > .${this.settings.classes.connection}`);
                let lastConnectionItem = connectionItems[connectionItems.length - 1];
                lastConnectionItem.parentNode.removeChild(lastConnectionItem);
            }
        }
    }

    #addItem(hideItem) {
        let item = document.createElement('div');
        item.classList.add(this.settings.classes.item);

        if (hideItem === true) {
            item.style.visibility = 'hidden';
        }

        let items = this.#root.querySelector(`.${this.settings.classes.items}`);
        items.appendChild(item);

        if (this.#connections != null) {
            let connection = document.createElement('div');
            connection.classList.add(this.settings.classes.connection);
            this.#connections.append(connection);
        }

        return item;
    }

    #resolveValue(items, obj, defaultValue, strFunc) {

        if (obj == null) {
            return defaultValue;
        }

        if (typeof obj === 'number') {
            return obj;
        }

        if (typeof obj === 'function') {
            let funcResult = obj(items);

            return this.#resolveValue(items, funcResult, defaultValue, strFunc);
        }


        if (typeof obj === 'string') {
            /* resolve string value with string function */
            if (typeof strFunc === 'function') {
                return strFunc(obj);
            }

            return obj;
        }

        return defaultValue;
    }

    #resolveRadius(items, radiusObj) {
        let defaultValue = 200;

        return this.#resolveValue(items, radiusObj, defaultValue, function (strRad) {
            let rad = parseFloat(strRad);

            if (!isNaN(rad)) {
                return rad;
            }

            return defaultValue;
        });
    }

    #resolveStartAngle(items, startAngleObj) {

        var resolveStringAngle = function (strAngle) {
            switch (strAngle) {
                case 'bottom-left':
                    return 225;
                case 'top-left':
                    return 315;
                case 'right':
                    return 90;
                case 'left':
                    return 270;
                case 'bottom-right':
                    return 135;
                case 'top-right':
                    return 45;
                case 'bottom':
                    return 180;
                case 'top':
                default:
                    return 0;
            }
        }

        let angle = this.#resolveValue(items, startAngleObj, 0, resolveStringAngle);

        return angle;
    }

    #calcRadAngle(radius, delta, duration, startDegAngle) {

        // https://stackoverflow.com/a/33385159
        let defaultAngle = math.degToRad(startDegAngle);
        let circumference = radius * 2 * Math.PI;
        let vector = circumference / duration;

        if (!this.#isClockwiseDirection) {
            this.#log('Negate delta for counter clockwise', 'debug');
            delta *= -1;
        }

        let angleInRad = (vector * delta / radius) + defaultAngle;
        let normalizedRadAngle = math.normalizeRadAngle(angleInRad);

        return normalizedRadAngle;
    }

    #renderCircleBackground(itemSize) {
        var element = this.#root.querySelector(`.${this.settings.classes.background}`);

        if (element == null) {
            return;
        }

        let includeItemSize = this.settings.includeItemSizeInBackground;

        let items = this.#getItems();
        let radius = this.#resolveRadius(items, this.#startRadius);

        let itemWidth = itemSize.width;
        let itemHeight = itemSize.height;

        let finalRadius = radius;
        let x = itemWidth / 2;
        let y = itemHeight / 2;


        if (includeItemSize) {
            y -= itemWidth / 2;
            finalRadius += itemWidth / 2;
        }
        if (this.#isFullCenter()) {

            x = (dom.getRect(this.#root).width / 2) - finalRadius;
        }

        element.style.top = y + 'px';
        element.style.left = x + 'px';
        element.style.borderTopWidth = finalRadius + 'px';
        element.style.borderRightWidth = finalRadius + 'px';
        element.style.borderBottomWidth = finalRadius + 'px';
        element.style.borderLeftWidth = finalRadius + 'px';
    }

    #isFullCenter() {
        return this.settings.center === 'full-center';
    }

    /**
     * Rotation animation function
     * @param {any} timestamp
     */
    #rotateAnimationFrame = (timestamp) => {

        if (this.#isRotationStopped) {
            return;
        }

        var ts = Date.now();

        if (!this.#startTime) {
            this.#startTime = ts;
        }

        let delta = ts - this.#startTime;

        /* If animation is paused save the pause time */
        if (!(this.#isRotationRunning === true)) {
            this.#pTime = delta - this.#timeElapsed;
        }

        this.#timeElapsed = delta - this.#pTime;

        if (this.#isRotationRunning === true && delta != 0) {
            this.refresh();
        }

        window.requestAnimationFrame(this.#rotateAnimationFrame);
    };

    #getNextAngle(items, delta, duration, startRadius, startAngle) {
        let radius = this.#resolveRadius(items, startRadius);
        let currentStartAngle = this.#resolveStartAngle(items, startAngle);

        let radAngle = this.#calcRadAngle(radius, delta, duration, currentStartAngle);

        var currentStartAnglePositive = math.toFixedNumber(math.convertDegAngleTo360Based(currentStartAngle), 6);
        var newAnglePositive = math.toFixedNumber(math.convertDegAngleTo360Based(math.radToDeg(radAngle)), 6);

        let currentRelativeAngle = math.toFixedNumber(360 - currentStartAnglePositive + newAnglePositive, 6);
        let currentRelativeAnglePositive = math.toFixedNumber(math.convertDegAngleTo360Based(currentRelativeAngle), 6);

        if (!this.#isClockwiseDirection) {
            currentRelativeAnglePositive = (currentRelativeAnglePositive - 360) * -1;

            if (currentRelativeAnglePositive == 360) {
                currentRelativeAnglePositive = 0;
            }
        }

        return currentRelativeAnglePositive;
    }

    #isRotatedByDeg(previusAngle, angle, degrees) {

        if (isNaN(previusAngle)) {
            return false;
        }

        if (degrees == 0 || degrees == 360) {
            return previusAngle > angle;
        }

        return previusAngle < degrees && angle >= degrees;
    }

    #calculateAndRenderItems(delta) {
        let items = this.#getItems();

        if (items.length == 0) {
            this.#log(`No items found.`);
            return;
        }

        this.#log(`Calculte item positions.`);

        let radius = this.#resolveRadius(items, this.#startRadius);
        let currentStartAngle = this.#resolveStartAngle(items, this.#startAngle);
        var currentStartAnglePositive = math.toFixedNumber(math.convertDegAngleTo360Based(currentStartAngle), 6);

        let radAngle = this.#calcRadAngle(radius, delta, this.#rotationDuration, currentStartAngle);

        var newAnglePositive = math.toFixedNumber(math.convertDegAngleTo360Based(math.radToDeg(radAngle)), 6);

        let newRelativeAngle = math.toFixedNumber(360 - currentStartAnglePositive + newAnglePositive, 6);
        let newRelativeAnglePositive = math.toFixedNumber(math.convertDegAngleTo360Based(newRelativeAngle), 6);

        if (!this.#isClockwiseDirection) {
            newRelativeAnglePositive = (newRelativeAnglePositive - 360) * -1;

            if (newRelativeAnglePositive == 360) {
                newRelativeAnglePositive = 0;
            }
        }

        let is360 = this.#isRotatedByDeg(this.#previousAngle, newRelativeAnglePositive, 360);
        let is180 = this.#isRotatedByDeg(this.#previousAngle, newRelativeAnglePositive, 180);

        this.#previousAngle = newRelativeAnglePositive;

        this.#renderItems(items, radius, radAngle);

        if (is360) {
            this.#handler.emit('rotated.360', {});
            /* reset start time due to no difference anymore */
            //this.#startTime = null;
            //this.#previousAngle = null;
        }

        if (is180) {
            this.#handler.emit('rotated.180', {});
        }

        this.#log(`Items rendered.`);
    }

    #renderItems(items, radius, startRadAngle) {

        /* remove 90 degree from rad angle to ensure top is 0 degree (default is right) */
        let angle = (startRadAngle || 0) - math.degToRad(90);
        let step = 2 * Math.PI / items.length;
        let width = radius;

        if (this.#isFullCenter()) {
            width = dom.getRect(this.#root).width / 2;
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemRect = dom.getRect(item);

            let x = width + (radius * Math.cos(angle));

            if (this.#isFullCenter()) {
                x -= (itemRect.width / 2);
            }

            let y = radius + (radius * Math.sin(angle));

            item.style.left = x + 'px';
            item.style.top = y + 'px';

            angle += step;
        }

        this.#log(`Items rendered.`);
    }

    #renderConnections(forceRecreate) {

        if (this.#connections == null) {
            this.#log('No connections element found', 'debug');
            return;
        }

        let items = this.#getItems();

        if (forceRecreate === true) {
            this.#connections.innerHTML = '';
        }

        let connectionItems = Array.from(this.#root.querySelectorAll(`.${this.settings.classes.connections} > .${this.settings.classes.connection}`));

        if (connectionItems.length == 0) {

            for (let i = 0; i < items.length; i++) {
                let connection = document.createElement('div');
                connection.classList.add(this.settings.classes.connection);
                this.#connections.append(connection);

                connectionItems.push(connection);
            }
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            let nextItem = dom.getNextElement(items, i);
            let connection = connectionItems[i];

            let itemRect = dom.getRect(item);
            let midpointX1 = itemRect.width / 2;
            let midpointY1 = itemRect.height / 2;
            let top1 = itemRect.top - midpointY1;
            let left1 = itemRect.left - midpointX1;

            let nextItemRect = dom.getRect(nextItem);
            let midpointX2 = nextItemRect.width / 2;
            let midpointY2 = nextItemRect.height / 2;
            let top2 = nextItemRect.top - midpointY2;
            let left2 = nextItemRect.left - midpointX2;

            let triangle = this.#buildTriangle(left1, top1, left2, top2);

            connection.style.width = "" + triangle.hypotenuse + "px";
            connection.style.transform = "rotate(" + triangle.angle + "deg)";
            connection.style.transformOrigin = "right center";
            connection.style.left = parseFloat(item.style.left) + midpointX1 - triangle.hypotenuse + 'px';
            connection.style.top = parseFloat(item.style.top) + midpointY1 + 'px';

            if (items.length == 1 || (items.length == 2 && i == 1)) {
                connection.style.visibility = 'hidden';
            }
            else {
                connection.style.removeProperty('visibility');
            }
        }
    }

    #buildTriangle(x1, y1, x2, y2) {

        this.#log('---- Find triangle data for item1 and item2 ----', 'debug');

        let opposite = Math.abs(x1 - x2);
        let adjacent = Math.abs(y1 - y2);

        let hypotenuse = math.calcHypotenuse(opposite, adjacent);
        let angle = math.calcDegAngle(adjacent, opposite);

        this.#log('Raw angle value: ' + angle, 'debug');

        if (x1 > x2 && y1 < y2) {
            this.#log('Case 1 - Modify angle (*-1)', 'debug');
            angle *= -1;
        }
        else if (x1 <= x2 && y1 < y2) {
            this.#log('Case 2 - Modify angle (+180)', 'debug');
            angle += 180;
        }
        else if (x1 < x2 && y1 == y2) {
            this.#log('Case 3 - Modify angle (+180)', 'debug');
            angle += 180;
        }
        else if (x1 < x2 && y1 > y2) {
            this.#log('Case 4 - Modify angle ((angle+180) *-1)', 'debug');
            angle = (angle + 180) * -1;
        }
        else {
            this.#log('Default Case - Angle not touched', 'debug');
        }

        this.#log(`Triangle data: angle: ${angle} | adjacent: ${adjacent} | opposite: ${opposite} | hypotenuse length: ${hypotenuse}`, 'debug');

        return { opposite: opposite, adjacent: adjacent, hypotenuse: hypotenuse, angle: angle };
    }

    #log(msg, level) {
        level = level ?? 'info';

        level = level.toLowerCase();

        if (!logger.isLoggable(this.settings.loglevel, level)) {
            return;
        }

        if (level == 'debug') {
            logger.debug(msg);
        }
        else if (level == 'info') {
            logger.info(msg);
        }
        else if (level == 'warn') {
            logger.warn(msg);
        }
        else if (level == 'error') {
            logger.error(msg);
        }
        else {
            logger.info(msg);
        }
    }
}