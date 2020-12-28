import mysql from 'mysql'

class MySqlDb{
    dbConnect: any
    constructor() {
        this.dbConnect= mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            insecureAuth : true
        });
        // open the MySQL connection
        this.dbConnect.connect((error: any) => {
            if (error) throw error;
            console.log("Successfully connected to the database.");
        });
    }
    createTable=(query: string)=>{
        this.dbConnect.query(query)
    }
}


export default MySqlDb;
