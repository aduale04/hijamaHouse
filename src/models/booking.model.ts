import MySqlDb from './db'
import sendEmailNotification from "../config/email.config";

export interface BookingModel {
  id: number
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
  cancelBooking: (result: any) => void
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
        result({
          success: false,
          message: "Could not book at this time. Please! try again.",
          data: null
        });
      }
      this.book.id = res?.insertId;
      result({
        success: true,
        message: "Booking successful. Please check your email inbox or spam.",
        data: {...this.book, id: res?.insertId}
      });
    });
  }

  findOne = (result: any) => {
    this.db.dbConnect.query(`SELECT * FROM booking WHERE dateBooking='${this.book.dateBooking}' AND timeFrom = ${this.book.timeFrom}`, (err: any, res: string | any[]) => {
      if (err) {
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


    const date = new Date(this.book.dateBooking)
    const emailBody = `
        <div class="container">
            <div class="row">
                <div class="col-12" style="width: 100%;">
                    Dear ${this.book.firstName},<br/>
                    We are looking forward to welcoming you to ${process.env.PRACTICE_NAME} on:
                    <b>${date.toString().substr(0, 10)} at ${timeFrom} to ${timeTo}</b><br/>
                    You’ve booked a 45 minutes with ${process.env.PRACTICE_NAME} for ${this.book.package}.
                    If, for any reason, you can’t make the appointment, please let us know as soon as possible either by giving us a call on +44 7561 323849 or sending email.
                    Please take a moment to read our Cancellation Policy (link) as well as our Important Information page if you are a new client.

                    <br/>
                    <br/>
                    Kind Regards,<br/>
                    The ${process.env.PRACTICE_NAME} Team<br/>
                    Hijama House, 234 Old Kent Road, London SE1 5UB.Clinic based Services | Mobile services, info@hijamahouse.co.uk, +44 7561 323849
                </div>
                <div class="mail-footer">
                    <p>With ❤ by Hijama</p>
                    <br/>
                    <br/>
                    TO CANCEL YOUR BOOKING <a style="color: indianred" href='${process.env.WEB_URL}/cancel-booking/${this.book.id}/${this.book.dateBooking}/${this.book.email}/${this.book.phoneNumber}'>CLICK HERE.</a>
                </div>
            </div>
            <hr>
        </div>
    `;
    const subject = "Your Appointment at Hijama House Old Kent Road is Confirmed"
    sendEmailNotification(this.book.email, emailBody, subject)

    const htmlBodyBooking = `
            <h3>Booking Details</h3>
            <ul>
                <li>Package: ${this.book.package}</li>
                <li>Date: ${this.book.dateBooking}</li>
                <li>Name: ${this.book.firstName} ${this.book.lastName}</li>
                <li>Phone Number: ${this.book.phoneNumber}</li>
                <li>E-Mail: ${this.book.email}</li>
            </ul>
            <h3>Message</h3>
            <p>${this.book.comments}</p>
        `;

    const subjectBooked = `Customer, ${this.book.firstName} ${this.book.lastName} has been booked ${timeFrom} for hijama`
    const emailToBooking = `${process.env.EMAIL_DEFAULT_TO}`
    sendEmailNotification(emailToBooking, htmlBodyBooking, subjectBooked);
  }

  findAvailableTimeByDate = (date: string, result: any) => {
    this.db.dbConnect.query(`SELECT timeFrom FROM booking WHERE dateBooking='${date}'`, (err: any, res: string | any[]) => {
      if (err) {
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
  cancelBooking = (result: any) => {
    this.db.dbConnect.query(`SELECT timeFrom, firstName,lastName,phoneNumber, email, timeTo FROM booking WHERE id=${this.book.id}`, (errQuery: any, data: string | any[]) => {
      if (!errQuery && data.length > 0) {
        this.db.dbConnect.query(`delete FROM booking WHERE dateBooking='${this.book.dateBooking}' and id=${this.book.id} and phoneNumber='${this.book.phoneNumber}' and email='${this.book.email}'`, (err: any, res: string | any[]) => {
          if (!err) {
            let timeFrom
            let timeTo
            if (data[0].timeFrom.toString().length == 3) {
              timeFrom = `${data[0].timeFrom.toString().substr(0, 1)}:${data[0].timeFrom.toString().substr(1, 3)} AM`
            } else if (parseInt(data[0].timeFrom.toString().substr(0, 2)) > 12) {
              timeFrom = `${parseInt(data[0].timeFrom.toString().substr(0, 2)) - 12}:${data[0].timeFrom.toString().substr(2, 4)} PM`
            } else if (parseInt(data[0].timeFrom.toString().substr(0, 2)) == 12) {
              timeFrom = `12:${data[0].timeFrom.toString().substr(2, 4)} PM`
            } else {
              timeFrom = `${data[0].timeFrom.toString().substr(0, 2)}:${data[0].timeFrom.toString().substr(2, 4)} AM`
            }

            if (data[0]?.timeTo?.toString()?.length == 3) {
              timeTo = `${data[0].timeTo.toString().substr(0, 1)}:${data[0].timeTo.toString().substr(1, 4)} AM`
            } else if (parseInt(data[0]?.timeTo.toString().substr(0, 2)) > 12) {
              timeTo = `${parseInt(data[0]?.timeTo.toString().substr(0, 2)) - 12}:${data[0]?.timeTo.toString().substr(2, 4)} PM`
            } else if (parseInt(data[0].timeTo.toString().substr(0, 2)) == 12) {
              timeTo = `12:${data[0].timeTo.toString().substr(2, 4)} PM`
            } else {
              timeTo = `${data[0].timeTo.toString().substr(0, 2)}:${data[0].timeTo.toString().substr(2, 4)} AM`
            }
            const htmlBodyBooking = `
                <h3>Booking Cancellation</h3>
                <ul>
                    <li>Package: ${data[0].package}</li>
                    <li>Date: ${data[0].dateBooking}</li>
                    <li>Time: ${timeFrom} to ${timeTo}</li>
                    <li>Name: ${data[0].firstName} ${data[0].lastName}</li>
                    <li>Phone Number: ${data[0].phoneNumber}</li>
                    <li>E-Mail: ${data[0].email}</li>
                </ul>
            `;

            const subjectBooked = `Customer, ${data[0].firstName} ${data[0].lastName} has been cancel booking`
            const emailToBooking = `${process.env.EMAIL_DEFAULT_TO}`
            sendEmailNotification(emailToBooking, htmlBodyBooking, subjectBooked);
          }
        });
        return result({
          success: true,
          message: `Booking has been cancel successfully.`,
        });
      }
      return result({
        success: false,
        message: "Could not make cancel your booking.",
        data: null
      });
    })
  };
}

export default Booking
