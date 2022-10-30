
/**
 * 
 * @param {any} element HTMLElement to get the rect for.
 * @param {any} basedOnDocument if true window page(X/Y)Offet will be added
 */
function getRect(element, basedOnDocument) {
    let box = element.getBoundingClientRect();

    let top = box.top;
    let left = box.left;
    let bottom = box.bottom;
    let right = box.right;

    if (basedOnDocument === true) {
        top += window.pageYOffset;
        left += window.pageXOffset;
        bottom += window.pageYOffset;
        right += window.pageXOffset;
    }

    return {
        top: top,
        right: right,
        bottom: bottom,
        left: left,
        width: box.width,
        height: box.height
    };
}

function getNextElement(list, currentIndex) {

    let targetItem = null;

    if (currentIndex + 1 <= list.length - 1) {
        targetItem = list[currentIndex + 1];
    }
    else if (list.length != 0 && currentIndex == list.length - 1) {
        targetItem = list[0];
    }

    return targetItem;
}

export default {
    getRect,
    getNextElement
}