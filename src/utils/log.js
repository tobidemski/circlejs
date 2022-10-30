
function warn(msg) {
    console.warn(`[graph.js warn]: ${msg}`)
}

function error(msg) {
    console.error(`[graph.js error]: ${msg}`)
}

function info(msg) {
    console.info(`[graph.js]: ${msg}`)
}

function debug(msg) {
    console.debug(`[graph.js debug]: ${msg}`)
}

function isLoggable(currentLevel, level) {

    currentLevel = currentLevel || 'info';
    currentLevel = currentLevel.toLowerCase();

    level = level || 'info';
    level = level.toLowerCase();

    if (currentLevel == 'debug' && (level == 'debug' || level == 'info' || level == 'warn' || level == 'error')) {
        return true;
    }

    if (currentLevel == 'info' && (level == 'info' || level == 'warn' || level == 'error')) {
        return true;
    }

    if (currentLevel == 'warn' && (level == 'warn' || level == 'error')) {
        return true;
    }

    if (currentLevel == 'error' && (level == 'error')) {
        return true;
    }

    return false;
}

export { error, warn, info, debug, isLoggable };