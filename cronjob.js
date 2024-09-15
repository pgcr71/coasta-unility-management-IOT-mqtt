import cron from "node-cron";
import dayjs from "dayjs";
import pkg from 'sqlite3';

const { verbose } = pkg;
const sqlite = verbose();

// cron.schedule('1 */1 * * *',crons );
crons()
function crons() {
 
    let lastHour = dayjs().subtract(1, 'hours').format("DDMMYYYYHH");
    let databasePath = `./databases/${lastHour}.db`;
    const db = new sqlite.Database(databasePath);
        db.serialize(() => {
            //Create Connection
            getTopRecordForEachParameter(db)
        })
        //sync databases
    
}
 function getTopRecordForEachParameter(db) {
    db.all(`WITH summary AS (select *, dense_rank() OVER(PARTITION BY json_extract(value, '$.parameter'),json_extract(value, '$.mac'),json_extract(value, '$.sid')
ORDER BY json_extract(value, '$.seq') desc) AS rank from info, json_each(info.message, '$'))
select value from summary where rank = 1;`, async (err, res) => {
        if (err) {
            console.log('some thing went wrong')
            return
        }
   
        fetch('https://utilfacts.com/api/v1/sync',
            {
                method: 'POST',
                headers: {
                    'Authorization': "basic "+  btoa(process.env.BASIC_AUTH_USER + ":" + process.env.BASIC_AUTH_PASSWORD)
                },
                
                body: JSON.stringify({data: res.map(({value}) => value)})
            }).catch(e => console.log(e))
    
    })
}


// // DCU table (name, ip, mac address)
// // slaves(EM, IG -> water meter, gas meter) (sid, macaddress)
// // device parameter
// //devices model

// //split a string into an array of substrings

