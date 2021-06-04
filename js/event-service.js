export function load() {
    if (localStorage.getItem("events")) return JSON.parse(localStorage.getItem("events"))
    return []
}

export function save(events) {
    localStorage.setItem("events", JSON.stringify(events))
}