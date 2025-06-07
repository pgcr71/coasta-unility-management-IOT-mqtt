import cron from "node-cron";
import pkg from 'sqlite3';
import fs from 'fs'
import glob from 'glob'
import path from 'path';
import { fileURLToPath } from 'url';
// import { parentPort } from "worker_threads";

const { verbose } = pkg;
const sqlite = verbose();

cron.schedule('15 * * * *', crons);
crons()
console.log(process.env.BASIC_AUTH_USER)
function crons() {
    // parentPort.postMessage('cron job started every 15 * * * *')
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const databasePath = path.resolve(__dirname);
        const fileNames = glob.sync(`${databasePath}/databases/*.db`)
            .map(name => ({ name, ctime: fs.statSync(name).ctime }))
            .sort((a, b) => b.ctime - a.ctime)
        if (!fileNames.length) {
            console.log('No files in database folder')
            return
        }
        const newestFile =fileNames.length > 1 ? fileNames[1].name : fileNames[0].name
        const db = new sqlite.Database(path.resolve(newestFile));
        db.serialize(() => {
            //Create Connection
            getTopRecordForEachParameter(db, newestFile)
        })


    } catch (e) {
        console.log('coulnd connect to sqlite', e)
    }

}


function getTopRecordForEachParameter(db, databasePath) {
    db.all(`WITH a AS (select json_extract(value, '$.parameter') as parameter1,json_extract(value, '$.mac') as macadd,json_extract(value, '$.sid') as sid, json_extract(value, '$.seq') as seq, value
from info, json_each(info.message, '$') order by sid desc),
b as (select *, ROW_NUMBER() OVER (PARTITION BY parameter1, macadd, sid) as rank1 from a where parameter1 is not null)
select value from b where rank1 = 1;`, async (err, res) => {
        if (err) {
            console.log(err)

            return
        }
        try {
            const data = res.map(({ value }) => JSON.parse(value))
                .filter(({ parameter }) => ["DI01","DI02","DI03","DI04","DI05","DL01","DL02",,"DL03","DL04","EBKWh", "DGKWh", "CH0", "CH1", "CH2", "CH3", "CH4", "CH5", "CH6", "CH7", "CH8", "CH00", "CH01", "CH02", "CH03", "CH04", "CH05", "CH06", "CH07", "CH08"].includes(parameter))

            fetch('https://utilfacts.com/api/v1/sync',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': "basic " + btoa(process.env.BASIC_AUTH_USER + ":" + process.env.BASIC_AUTH_PASSWORD)
                    },

                    body: JSON.stringify(data)
                })
                .then(res => res.json())
                .then(({ inserted = [], notInserted =  []}) => {
                    console.log(inserted.length, ' Record has been inserted');
                    console.log('not inserted\n', notInserted);
                })
        } catch (e) {
            console.log('Some of the devices data is not synced')
            console.log(e)
        }


    })
}


// // DCU table (name, ip, mac address)
// // slaves(EM, IG -> water meter, gas meter) (sid, macaddress)
// // device parameter
// //devices model

// //split a string into an array of substrings

