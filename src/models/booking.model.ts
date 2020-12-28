import MySqlDb from './db'
import sendEmailNotification from "../config/email.config";
export interface BookingModel {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
    package: string
    isFirstTime: boolean
    dateBooking: string
    timeFrom: number
    timeTo: string
    comments: string,
    findOne: (result: any) => void
    createBooking: (result: any) => void
}

class Booking {
    book: BookingModel
    db: any;

    constructor(book: BookingModel) {
        this.book = book
        this.db = new MySqlDb()
        this.db.dbConnect.query("CREATE TABLE IF NOT EXISTS `booking` (\n" +
            "  id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,\n" +
            "  email varchar(255) NOT NULL,\n" +
            "  firstName varchar(255) NOT NULL,\n" +
            "  lastName varchar(255) NOT NULL,\n" +
            "  phoneNumber varchar(255) NOT NULL,\n" +
            "  package varchar(255) NOT NULL,\n" +
            "  dateBooking varchar(255) NOT NULL,\n" +
            "  timeFrom int(20) NOT NULL,\n" +
            "  timeTo int(20) NOT NULL,\n" +
            "  comments text(255) NULL,\n" +
            "  isFirstTime BOOLEAN DEFAULT false\n" +
            ") ENGINE=InnoDB DEFAULT CHARSET=utf8")
    }

    createBooking = (result: any) => {

        this.db.dbConnect.query("INSERT INTO booking SET ?", this.book, (err: any, res: any) => {
            if (err) {
                console.log("error: ", err);
                result({
                    success: false,
                    message: "Could not book at this time. Please! try again.",
                    data: null
                });
            }
            result({
                success: true,
                message: "Booking successful.",
                data: {...this.book}
            });
        });
    }

    findOne = (result: any) => {
        this.db.dbConnect.query(`SELECT * FROM booking WHERE dateBooking='${this.book.dateBooking}' AND timeFrom = ${this.book.timeFrom}`, (err: any, res: string | any[]) => {
            if (err) {
                console.log("error: ", err);
                return result({
                    success: false,
                    message: "Could not book at this time. Please! try again.",
                    data: null
                });
            }

            if (res.length) {
                let timeFrom
                let timeTo
                if (res[0].timeFrom.toString().length == 3) {
                    timeFrom = `${res[0].timeFrom.toString().substr(0, 1)}:${res[0].timeFrom.toString().substr(1, 3)} AM`
                } else if (parseInt(res[0].timeFrom.toString().substr(0, 2)) > 12) {
                    timeFrom = `${parseInt(res[0].timeFrom.toString().substr(0, 2)) - 12}:${res[0].timeFrom.toString().substr(2, 4)} PM`
                } else if (parseInt(res[0].timeFrom.toString().substr(0, 2)) == 12) {
                    timeFrom = `12:${res[0].timeFrom.toString().substr(2, 4)} PM`
                } else {
                    timeFrom = `${res[0].timeFrom.toString().substr(0, 2)}:${res[0].timeFrom.toString().substr(2, 4)} AM`
                }

                if (res[0].timeTo.toString().length == 3) {
                    timeTo = `${res[0].timeTo.toString().substr(0, 1)}:${res[0].timeTo.toString().substr(1, 4)} AM`
                } else if (parseInt(res[0].timeTo.toString().substr(0, 2)) > 12) {
                    timeTo = `${parseInt(res[0].timeTo.toString().substr(0, 2)) - 12}:${res[0].timeTo.toString().substr(2, 4)} PM`
                } else if (parseInt(res[0].timeTo.toString().substr(0, 2)) == 12) {
                    timeTo = `12:${res[0].timeTo.toString().substr(2, 4)} PM`
                } else {
                    timeTo = `${res[0].timeTo.toString().substr(0, 2)}:${res[0].timeTo.toString().substr(2, 4)} AM`
                }
                return result({
                    success: true,
                    message: `Time ${timeFrom} to ${timeTo} has been already booked. Please try for another time.`,
                    data: res[0],
                });
            }
            // not found Customer with the id
            return result({
                success: false,
                message: "Not found.",
                data: null
            });
        });
    };

    sendMail = async () => {
        let timeFrom
        let timeTo
        if (this.book.timeFrom.toString().length == 3) {
            timeFrom = `${this.book.timeFrom.toString().substr(0, 1)}:${this.book.timeFrom.toString().substr(1, 3)} AM`
        } else if (parseInt(this.book.timeFrom.toString().substr(0, 2)) > 12) {
            timeFrom = `${parseInt(this.book.timeFrom.toString().substr(0, 2)) - 12}:${this.book.timeFrom.toString().substr(2, 4)} PM`
        } else if (parseInt(this.book.timeFrom.toString().substr(0, 2)) == 12) {
            timeFrom = `12:${this.book.timeFrom.toString().substr(2, 4)} PM`
        } else {
            timeFrom = `${this.book.timeFrom.toString().substr(0, 2)}:${this.book.timeFrom.toString().substr(2, 4)} AM`
        }

        if (this.book.timeTo.toString().length == 3) {
            timeTo = `${this.book.timeTo.toString().substr(0, 1)}:${this.book.timeTo.toString().substr(1, 4)} AM`
        } else if (parseInt(this.book.timeTo.toString().substr(0, 2)) > 12) {
            timeTo = `${parseInt(this.book.timeTo.toString().substr(0, 2)) - 12}:${this.book.timeTo.toString().substr(2, 4)} PM`
        } else if (parseInt(this.book.timeTo.toString().substr(0, 2)) == 12) {
            timeTo = `12:${this.book.timeTo.toString().substr(2, 4)} PM`
        } else {
            timeTo = `${this.book.timeTo.toString().substr(0, 2)}:${this.book.timeTo.toString().substr(2, 4)} AM`
        }
        const date=new Date(this.book.dateBooking)
        const emailBody = `
        <div class="container">
            <div class="row">
                <div class="col-12" style="width: 100%;">
                    Dear ${this.book.firstName},<br/>
                    We are looking forward to welcoming you to ${process.env.PRACTICE_NAME} on:
                    <b>${date.toString().substr(0,10)} at ${timeFrom} to ${timeTo}</b><br/>
                    You’ve booked a 45 minutes with ${process.env.PRACTICE_NAME} for ${this.book.package}.
                    If, for any reason, you can’t make the appointment, please let us know as soon as possible either by giving us a call on +44 7561 323849 or sending email.
                    Please take a moment to read our Cancellation Policy (link) as well as our Important Information page if you are a new client.
                    <br/>
                    <br/>
                    Kind Regards,<br/>
                    The ${process.env.PRACTICE_NAME} Team<br/>
                    Hijama House, 234 Old Kent Road, London SE1 5UB.Clinic based Services | Mobile services, Hijama.house@gmail.com, +44 7561 323849
                </div>
                <div class="mail-footer">
                    <p>With ❤ by Hijama</p>
                </div>
            </div>
            <hr>         
        </div>             
    `;
        const subject="Your Appointment at Hijama House Old Kent Road is Confirmed"
        sendEmailNotification(this.book.email,emailBody,subject)
    }

    findAvailableTimeByDate = (date:string, result: any) => {
        this.db.dbConnect.query(`SELECT timeFrom FROM booking WHERE dateBooking='${date}'`, (err: any, res: string | any[]) => {
            if (err) {
                console.log("error: ", err);
                return result({
                    success: false,
                    message: "Could not book at this time. Please! try again.",
                    data: null
                });
            }

            if (res.length) {
                return result({
                    success: true,
                    message: ``,
                    data: res,
                });
            }
            // not found Customer with the id
            return result({
                success: false,
                message: "Not found.",
                data: null
            });
        });
    };
}

export default Booking
