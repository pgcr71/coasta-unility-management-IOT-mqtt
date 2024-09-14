//https://www.npmjs.com/package/mqtt
import cron from "node-cron";
import dayjs from "dayjs";

cron.schedule('1 */1 * * *', () => {
    let lastHour = dayjs().subtract(1, 'hours').format("DDMMYYYYHH");
    let databasePath = `./databases/${lastHour}.db`;
    const db = new sqlite.Database(databasePath);
    db.serialize(() => {
        //Create Connection
        getTopRecordForEachParameter()
    })
    //sync databases
});

function getTopRecordForEachParameter() {
    db.get(`WITH summary AS (select *, ROW_NUMBER() OVER(PARTITION BY json_extract(value, '$.mac,'),json_extract(value, '$.sid'), json_extract(value, '$.parameter')
ORDER BY json_extract(value, '$.seq') desc) AS rownum from info, json_each(info.message, '$'))
select value from summary where rownum = 1;`, (err, res) => {
        if (err) {
            console.log('some thing went wrong')
            return
        }
        console.log(res)
    })
}


// // DCU table (name, ip, mac address)
// // slaves(EM, IG -> water meter, gas meter) (sid, macaddress)
// // device parameter
// //devices model

// //split a string into an array of substrings

