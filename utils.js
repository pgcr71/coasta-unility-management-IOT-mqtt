import pkg from 'sqlite3'

const { verbose } = pkg;



////////////////////////////////////////////////////
///////////////////// MYSQL ////////////////////////
////////////////////////////////////////////////////

export function sqlConnection() {
    const sqlite = verbose();
    const db = new sqlite.Database("./coasta.db");
    return db;
}


export function createInfoTable() {
    const db = sqlConnection();
    db.serialize(() => {
        //Create Connection
        db.get("SELECT * FROM sqlite_master WHERE type='table' AND name='info'", (err, res) => {
            if (!res)
                db.run("CREATE TABLE info (topic Text, message TEXT, created_at TEXT)");
        })
    })
}

export function insert_message(topic, message_str, packet = '') {
    const db = sqlConnection();
    db.serialize(() => {
        const stmt = db.prepare("INSERT INTO info VALUES (?, ?, ?)");
        var params = [topic, message_str, new Date().toISOString()];
        stmt.run(params);
        stmt.finalize();
    })
};

//split a string into an array of substrings

