import cron from "node-cron";
import dayjs from "dayjs";
import pkg from 'sqlite3';
import fs from 'fs'
import glob from 'glob'



const { verbose } = pkg;
const sqlite = verbose();

cron.schedule('15 * * * *', crons);
crons()
function crons() {
    try {
    const newestFile = glob.sync('databases/*.db')
        .map(name => ({ name, ctime: fs.statSync(name).ctime }))
        .sort((a, b) => b.ctime - a.ctime)[1].name
    let databasePath = `${newestFile}`;
    console.log(databasePath)
        const db = new sqlite.Database(databasePath);
        db.serialize(() => {
            //Create Connection
            getTopRecordForEachParameter(db)
        })
    } catch (e) {
        console.log('coulnd connect to sqlite', e)
    }

}
function getTopRecordForEachParameter(db) {
    db.all(`WITH a AS (select json_extract(value, '$.parameter') as parameter1,json_extract(value, '$.mac') as macadd,json_extract(value, '$.sid') as sid, json_extract(value, '$.seq') as seq, value
from info, json_each(info.message, '$') order by sid desc),
b as (select *, ROW_NUMBER() OVER (PARTITION BY parameter1, macadd, sid) as rank1 from a where parameter1 is not null)
select value from b where rank1 = 1;`, async (err, res) => {
        if (err) {
            // console.log(err)
            console.log('Some of the devices data is not synced')
            return
        }
        try {
            const data = res.map(({ value }) => JSON.parse(value))
            .filter(({parameter}) => ["EBKWh", "DGKWh"].includes(parameter))
            console.log(data.length)
            const result = await fetch('https://utilfacts.com/api/v1/sync',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': "basic " + btoa(process.env.BASIC_AUTH_USER + ":" + process.env.BASIC_AUTH_PASSWORD)
                    },

                    body: JSON.stringify(data)
                }).then((res) => res.text())
        } catch (e) {
            console.log(e)
        }


    })
}


// // DCU table (name, ip, mac address)
// // slaves(EM, IG -> water meter, gas meter) (sid, macaddress)
// // device parameter
// //devices model

// //split a string into an array of substrings

