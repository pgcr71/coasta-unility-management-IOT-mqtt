//https://www.npmjs.com/package/mqtt
import cron from "node-cron";
import dayjs from "dayjs";

cron.schedule('1 */1 * * *', () => {
    let lastHour = dayjs().subtract(1, 'hours').format("DDMMYYYYHH");
        //sync databases
});

//split a string into an array of substrings

