export function load() {
    if (localStorage.getItem("events")) return JSON.parse(localStorage.getItem("events"))
    return []
}

export function save(event) {
    var events = []
    if (localStorage.getItem("events")) {
        events = JSON.parse(localStorage.getItem("events"))
        var index = -1
        var existingEvent = events.find(function(d, i) { 
            if (d.id === event.id) {
                index = i
                return true
            }
            return false
        })
        if (!!existingEvent)  events.splice(index, 1, event)
        else events.push(event)
    }
    else {
        events.push(event)
    }
    localStorage.setItem("events", JSON.stringify(events))
}

export function remove(id) {
    if (localStorage.getItem("events")) {
        var events = JSON.parse(localStorage.getItem("events"))
        events = events.filter(function(event) { return event.id !== id })
        localStorage.setItem("events", JSON.stringify(events))
    }
}