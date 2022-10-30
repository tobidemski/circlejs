
/**
 * Merges passed settings object with default options.
 *
 * @param  {Object} defaults
 * @param  {Object} settings
 * @return {Object}
 */
export function mergeOptions(defaults, settings) {
    let options = Object.assign({}, defaults, settings)

    // `Object.assign` do not deeply merge objects, so we
    // have to do it manually for every nested object
    // in options. Although it does not look smart,
    // it's smaller and faster than some fancy
    // merging deep-merge algorithm script.
    if (settings.hasOwnProperty('classes')) {
        options.classes = Object.assign({}, defaults.classes, settings.classes)
    }

    return options
}