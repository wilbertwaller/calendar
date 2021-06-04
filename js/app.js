import { load, save, remove } from "./event-service.js"

(function() {
    var calendar, modal, confirmationModal, selectedEvent = {}
    document.addEventListener("DOMContentLoaded", init)

    function init() {
        document.getElementById("save").addEventListener("click", saveEvent)
        document.getElementById("submitRemove").addEventListener("click", removeEvent)
        modal = new bootstrap.Modal(document.getElementById("eventForm"))
        confirmationModal = new bootstrap.Modal(document.getElementById("eventRemove"))
        var calendarEl = document.getElementById("calendar")
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            headerToolbar: {
                start: "today prev,next",
                center: "title",
                end: "dayGridMonth,timeGridWeek"
            },
            events: load(),
            eventClick: handleEventClick,
            selectable: true,
            select: handleDateSelect
        })
        calendar.render()
    }

    function saveEvent() {
        var id = document.getElementById("id").value
        var title = document.getElementById("title").value
        var allDay = document.getElementById("allDay").checked
        var start = document.getElementById("start").value
        var end = document.getElementById("end").value
        var event = { id, title, allDay, start, end }

        if (selectedEvent.id === id) {
            var calendarEvent = calendar.getEventById(id)
            if (selectedEvent.title !== title) calendarEvent.setProp("title", title)
            if (selectedEvent.allDay !== allDay) calendarEvent.setAllDay(allDay)
            if (selectedEvent.start !== start) calendarEvent.setStart(start)
            if (selectedEvent.end !== end) calendarEvent.setEnd(end)
        }
        else {
            calendar.addEvent(event)
        }

        save(event)
        modal.hide()
    }

    function removeEvent() {
        var id = document.getElementById("id").value
        var event = calendar.getEventById(id)
        event.remove()
        remove(id)
        confirmationModal.hide()
    }

    function handleEventClick(info) {
        document.getElementById("remove").style.display = "block"
        selectedEvent = info.event
        populateForm(info.event)
        modal.show()
    }
    
    function handleDateSelect(info) {
        document.getElementById("remove").style.display = "none"
        selectedEvent = {}
        populateForm(info)
        modal.show()
        calendar.unselect()
    }
    
    function populateForm(info) {
        var id = document.getElementById("id")
        var title = document.getElementById("title")
        var allDay = document.getElementById("allDay")
        var start = document.getElementById("start")
        var end = document.getElementById("end")
        id.value = info.id || Date.now()
        title.value = info.title || ""
        allDay.checked = info.allDay
        start.value = datetimeLocalFormat(info.start)
        end.value = datetimeLocalFormat(info.end)
    }

    function datetimeLocalFormat(dateStr) {
        var date = new Date(dateStr)
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        var day = date.getDate()
        var hours = date.getHours()
        var minutes = date.getMinutes()
        var seconds = date.getSeconds()
        var milliseconds = date.getMilliseconds()

        if (month < 10) month = `0${month}`
        if (day < 10) day = `0${day}`
        if (hours < 10) hours = `0${hours}`
        if (minutes < 10) minutes = `0${minutes}`
        if (seconds < 10) seconds = `0${seconds}`

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`
    }
})()