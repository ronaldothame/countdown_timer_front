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
            if (days > 0) {
                events += `<p>${element.eventName} - ${days} Days : ${hours} Hours : ${minutes} Minutes : ${seconds} Seconds.</p>`
            } else if (hours > 0) {
                events += `<p>${element.eventName} - ${hours} Hours : ${minutes} Minutes : ${seconds} Seconds.</p>`
            } else if (minutes > 0) {
                events += `<p>${element.eventName} - ${minutes} Minutes : ${seconds} Seconds.</p>`
            } else if (seconds > 0) {
                events += `<p>${element.eventName} - ${seconds} Seconds.</p>`
            } else {
                events += `<p>${element.eventName} - has arrived.</p>`
            }
            if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
                alert(`${element.eventName} it's on!!!`)
            }
        });
    }
    document.getElementById("eventList").innerHTML = events;
}

async function countdown() {
    const eventList = await getTimestamp()
    interval = setInterval(handleEvents, 500, eventList)
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
    if (timestamp < new Date()) {
        alert('Wrong Date!')
    } else if (eventName === "") {
        alert('Invalid Name!')
    } else {
        const obj = { eventName: eventName, eventTime: timestamp.getTime() }
        await fetch('http://localhost:8080/countdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
    }
    clearInterval(interval)
    countdown()
})

document.getElementById('delete').onclick = function () {
    fetch('http://localhost:8080/countdown', {
        method: 'DELETE'
    })
}
countdown()