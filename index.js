
const Botassignment = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');
process.env.TZ = 'Asia/Kolkata'; 

const token = "6770406997:AAH08JaTYkwjV0covtuqXmssPArU1xqshl0"; 
const bot = new Botassignment(token, { polling: true });

const userCities = {}; 
const cityRequests = {}; 

// bot.onText(/\/setcity/, (msg) => {
//     const chatId = msg.chat.id;
//     const userId = msg.from.id;

//     // Update user's current request status to indicate city setting is in progress
//     cityRequests[userId] = 'setCity';

//     bot.sendMessage(chatId, 'Please enter your city:');
// });
///////////////////////////for time////////////////
bot.onText(/\/setinfo/, (msg) => { 
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Update user's current request status to indicate city setting is in progress
    cityRequests[userId] = 'setCity';

    bot.sendMessage(chatId, 'Please enter your city and time for weather updates (e.g., Mumbai 14:30):');
});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userInput = msg.text;
    const userId = msg.from.id;
//////////////////////main///////////////////
    // if (cityRequests[userId] === 'setCity') {
    //     // Set user's city preference (in-memory storage)
    //     userCities[userId] = userInput;

    //     // Clear user's current request status
    //     delete cityRequests[userId];

    //     bot.sendMessage(chatId, `Your city is set to ${userInput}`);
    // }
    //////////////////adding////////////////////////
    // else if (cityRequests[userId] === 'setTime') {
    //     // Convert 24-hour time to 12-hour format
    //     let time12Hour = convertTo12HourFormat(userInput);

    //     // Clear user's current request status
    //     delete cityRequests[userId];

    //     bot.sendMessage(chatId, `Your time is set to ${time12Hour}`);
    // }
    if (cityRequests[userId] === 'setCity') {
        const [city, time] = userInput.split(' ');

        // Set user's city preference (in-memory storage)
        userCities[userId] = city;
        scheduleWeatherUpdate(userId, time);

        // Clear user's current request status
        delete cityRequests[userId];

        bot.sendMessage(chatId, `Your city is set to ${city} and weather updates are scheduled at ${time}`);
    }

});
///////////////////extra for time conversion//////////////
function scheduleWeatherUpdate(userId, time) {
    // Extract hours and minutes from the provided time
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);

    cron.schedule(`${minute} ${hour} * * *`, () => {
        sendWeatherUpdate(userId);
    });
}

//////////////////////////////extra ends////////////////////

// Function to send weather update to users
function sendWeatherUpdate() {
    Object.keys(userCities).forEach(async (userId) => {
        const city = userCities[userId];

        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d4eb7fe7289ae1f6c748bdccd6ea05f8`
            );
            const data = response.data;
            const weather = data.weather[0].description;
            const temperature = data.main.temp - 273.15;
            const humidity = data.main.humidity;
            const pressure = data.main.pressure;
            const windSpeed = data.wind.speed;

            const message = `Hope you are enjoying! 
The weather in ${city} is ${weather} with a temperature of ${temperature.toFixed(
                2
            )}°C. The humidity is ${humidity}%, the pressure is ${pressure}hPa, and the wind speed is ${windSpeed}m/s.`;

            bot.sendMessage(userId, message);
        } catch (error) {
            bot.sendMessage(userId, 'Error fetching weather for your city.');
        }
    });
}

// Schedule the weather update job to run daily at a specific time (adjust as needed)
// cron.schedule('24 21 * * *', () => {
//     // '0 9 * * *' means the job runs every day at 9 AM (change as per your requirement)
//     sendWeatherUpdate();
// });
// ///////////////////adding/////
// function convertTo12HourFormat(time24) {
//     let time = time24.split(':');
//     let hours = parseInt(time[0], 10);
//     let minutes = parseInt(time[1], 10);

//     let period = hours >= 12 ? 'PM' : 'AM';
//     hours = hours % 12 || 12;
//     let formattedTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + period;
    
//     return formattedTime;
// }
