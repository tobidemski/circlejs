
export default class EventHandler {
    constructor(events = {}) {
        this.events = events
    }

    /**
    * Adds listener to the specifed event.
    *
    * @param {String|Array} event
    * @param {Function} handler
    */
    on(event, handler) {

        if (Array.isArray(event)) {
            for (let i = 0; i < event.length; i++) {
                this.on(event[i], handler)
            }

            return
        }

        if (!this.events.hasOwnProperty(event)) {
            this.events[event] = [];
        }

        // Add the handler to queue
        var index = this.events[event].push(handler) - 1;

        // Provide handle back for removal of event
        return {
            remove() {
                delete this.events[event][index]
            }
        }
    }

    /**
    * Runs registered handlers for specified event.
    *
    * @param {String|Array} event
    * @param {Object=} context
    */
    emit(event, context) {

        if (Array.isArray(event)) {
            for (let i = 0; i < event.length; i++) {
                this.emit(event[i], context)
            }
            return
        }

        // If the event doesn't exist, or there's no handlers in queue, just leave
        if (!this.events.hasOwnProperty(event)) {
            return
        }

        // Cycle through events queue, fire!
        this.events[event].forEach((item) => {
            item(context || {})
        })
    }
}