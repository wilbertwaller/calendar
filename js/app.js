import { load, save, remove } from "./event-service.js"

(function() {
    var calendar, modal, confirmationModal, events = [], selectedEvent = {}
    $(document).ready(init)

    function init() {
        $("#save").click(saveEvent)
        $("#submitRemove").click(removeEvent)
        $("#isRecurring").change(toggleRecurrence)
        $("#daysOfWeek").select2({
            dropdownParent: $("#eventForm"),
            closeOnSelect: false,
            placeholder: "Select days of recurrence",
            allowClear: true
        })
        modal = new bootstrap.Modal(document.getElementById("eventForm"))
        confirmationModal = new bootstrap.Modal(document.getElementById("eventRemove"))
        events = load()
        var calendarEl = document.getElementById("calendar")
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            headerToolbar: {
                start: "today prev,next",
                center: "title",
                end: "dayGridMonth,timeGridWeek,listWeek"
            },
            events: events,
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
        var isRecurring = document.getElementById("isRecurring").checked
        var daysOfWeek = isRecurring ? $("#daysOfWeek").val() : undefined
        var startTime = isRecurring ? document.getElementById("startTime").value : undefined
        var endTime = isRecurring ? document.getElementById("endTime").value : undefined
        var startRecur = isRecurring ? document.getElementById("startRecur").value : undefined
        var endRecur = isRecurring ? document.getElementById("endRecur").value : undefined
        var event = { id, title, allDay, start, end, daysOfWeek, startTime, endTime, startRecur, endRecur }

        if (selectedEvent.id === id) {
            events = events.map(function(d) {
                if (d.id === id) return event
                return d
            })
            // Simple recurrence props cannot be set to cause a rerender.
            // Best to remove then re-add the event
            var calendarEvent = calendar.getEventById(id)
            calendarEvent.remove()
        }
        else {
            events.push(event)
        }
        calendar.addEvent(event)

        save(event)
        modal.hide()
    }

    function removeEvent() {
        var id = document.getElementById("id").value
        var event = calendar.getEventById(id)
        events = events.filter(function(d) { return d.id !== id })
        event.remove()
        remove(id)
        confirmationModal.hide()
    }

    function toggleRecurrence() {
        var isRecurring = document.getElementById("isRecurring").checked
        var recurring = document.querySelector(".recurring")
        if (isRecurring) recurring.style.display = "block"
        else recurring.style.display = "none"
    }

    function handleEventClick(info) {
        document.getElementById("remove").style.display = "block"
        // Calendar info does not provide easy way to obtain recurrence related
        // props. Using persisted data to populate form instead.
        selectedEvent = events.find(function(d) { return d.id === info.event.id })
        populateForm(selectedEvent)
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
        populateRecurrence(info)
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

    function populateRecurrence(info) {
        var isRecurring = document.getElementById("isRecurring")
        var daysOfWeek = $("#daysOfWeek")
        var startTime = document.getElementById("startTime")
        var endTime = document.getElementById("endTime")
        var startRecur = document.getElementById("startRecur")
        var endRecur = document.getElementById("endRecur")
        daysOfWeek.val(info.daysOfWeek).trigger("change")
        startTime.value = info.startTime
        endTime.value = info.endTime
        startRecur.value = info.startRecur
        endRecur.value = info.endRecur
        if (eventIsRecurring(info)) {
            isRecurring.checked = true
            document.querySelector(".recurring").style.display = "block"
        }
        else {
            isRecurring.checked = false
            document.querySelector(".recurring").style.display = "none"
        }
    }

    function eventIsRecurring(info) {
        return info.daysOfWeek || info.startTime || info.endTime || info.startRecur || info.endRecur
    }
})()