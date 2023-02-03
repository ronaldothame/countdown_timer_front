async function getTimestamp() {
    let eventList;
    const res = await fetch ('http://localhost:8080/countdown')
    eventList = await res.json()
    return eventList;
}

function handleEvents(eventList) {
    let events = "";
    if (eventList.length > 0) {
        eventList.forEach(element => {
            let currentTime = new Date().getTime();
            let finalTime = element.eventTime - currentTime;        
            let days = Math.floor((finalTime / 1000) / 60 / 60 / 24)
            let hours = Math.floor((finalTime / 1000) / 60 / 60 % 24)
            let minutes = Math.floor((finalTime / 1000) / 60 % 60)
            let seconds = Math.floor((finalTime / 1000) % 60)
            events += `<li>${element.eventName} - ${days} Days : ${hours} Hours : ${minutes} Minutes : ${seconds} Seconds.</li>`;
        });  
    }
    document.getElementById("eventList").innerHTML = events;
}

async function countdown(){    
    let event = await getTimestamp();
    setInterval(handleEvents, 500, event);
}

let countdownForm = document.querySelector('.form');

document.getElementById('create').onclick = function() {
    let formData = new FormData(countdownForm);
    let timestamp = new Date(formData.get('eventTime')); 
    let eventName = formData.get('eventName');
    let obj = {eventName:eventName, eventTime:timestamp.getTime()}
    fetch('http://localhost:8080/countdown', {
        method : 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(obj)
    })    
}

document.getElementById('delete').onclick = function(){    
    fetch('http://localhost:8080/countdown',{
        method : 'DELETE'        
    })
}
countdown();