async function getTimestamp() {
    const res = await fetch('http://localhost:8080/countdown')
    const eventList = await res.json()
    return eventList
}

let interval
function handleEvents(eventList) {
    let events = ""
    if (eventList.length > 0) {
        eventList.map(element => {
            const currentTime = new Date().getTime()
            const finalTime = element.eventTime - currentTime
            const days = Math.floor((finalTime / 1000) / 60 / 60 / 24)
            const hours = Math.floor((finalTime / 1000) / 60 / 60 % 24)
            const minutes = Math.floor((finalTime / 1000) / 60 % 60)
            const seconds = Math.floor((finalTime / 1000) % 60)
            events += '<tr>'
            if (days > 0) {
                events += `<td class="event">${element.eventName} - ${days} Days : ${hours} Hours : ${minutes} Minutes : ${seconds} Seconds.</td>`
            } else if (hours > 0) {
                events += `<td class="event">${element.eventName} - ${hours} Hours : ${minutes} Minutes : ${seconds} Seconds.</td>`
            } else if (minutes > 0) {
                events += `<td class="event"><${element.eventName} - ${minutes} Minutes : ${seconds} Seconds.</td>`
            } else if (seconds > 0) {
                events += `<td class="event">${element.eventName} - ${seconds} Seconds.</td>`
            } else {
                events += `<td class="event">${element.eventName} - has arrived.</td>`
            }
            events += '</tr>'
            if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
                Swal.fire({
                    imageUrl: 'https://media.tenor.com/9CSjgBMp2fIAAAAC/emoji-party.gif',
                    imageWidth: 150,
                    imageHeight: 150,
                    text: `${element.eventName} has arrived!`
                })
            }
        })
    }
    document.getElementById("eventList").innerHTML = events;
}

async function countdown() {
    const eventList = await getTimestamp()
    interval = setInterval(handleEvents, 1000, eventList)
}

const countdownForm = document.querySelector('.form')
const midnightUTC = new Date().setHours(21, 00)
const defaultDate = new Date(midnightUTC).toISOString().slice(0, 16)
document.getElementById('eventTime').value = defaultDate

document.getElementById('create').addEventListener('click', async function (event) {
    event.preventDefault()
    const formData = new FormData(countdownForm)
    const timestamp = new Date(formData.get('eventTime'))
    const eventName = formData.get('eventName')
    if (eventName === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Invalid name!'
        })
    } else if (timestamp < new Date()) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Invalid Date!'
        })
    } else {
        const obj = { eventName: eventName, eventTime: timestamp.getTime() }
        await fetch('http://localhost:8080/countdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        })
        Toast.fire({
            icon: 'success',
            title: 'A new event has been created'
        })
    }
    document.getElementById('eventTime').value = defaultDate
    clearInterval(interval)
    countdown()
})

document.getElementById('share').addEventListener('click', async function (event) {
    event.preventDefault()
    const inputOptions = await getTimestamp()
    const currentEvent = await Swal.fire({
        title: 'Select an event',
        input: 'select',
        showCancelButton: true,
        inputOptions: inputOptions.map(element => {
            return element.eventName
        })
    })
    const selectedElement = inputOptions[currentEvent.value]
    const now = new Date(parseInt(selectedElement.eventTime))
    if (currentEvent.isConfirmed) {
        navigator.clipboard.writeText(`Hi! I would like to invite you to the ${selectedElement.eventName} that will be held on ${now}. I count on your presence, Bye!`)
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        })
        Toast.fire({
            icon: 'success',
            title: 'Message copied to the clipboard'
        })
    }
})

document.getElementById('delete').addEventListener('click', async function (event) {
    event.preventDefault()
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    })
    if (result.isConfirmed) {
        Swal.fire(
            'Deleted!',
            'All events have been cleared.',
            'success'
        )
        await fetch('http://localhost:8080/countdown', {
            method: 'DELETE'
        })
        clearInterval(interval)
        countdown()
    }
})

document.getElementById('info').addEventListener('click', async function (event) {
    event.preventDefault()
    window.open('https://github.com/ronaldothame/countdown_timer_front#readme', '_blank')
})

countdown()