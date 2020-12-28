import express, {NextFunction, Request, Response, Router} from "express";
import Booking from '../models/booking.model'
import sendEmailNotification from "../config/email.config";

class Controller {
    router: Router

    constructor() {
        this.router = express.Router();
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get('/', this.home);
        this.router.get('/about-us', this.aboutus);
        this.router.get('/book', this.book);
        this.router.post('/bookNow', this.bookNow);
        this.router.get('/contact-us', this.contactus);
        this.router.post('/contact', this.contact);
        this.router.get('/services', this.services);
        this.router.get('/checkAvailableTime/:date', this.checkAvailableTime);
    }

    private home = (req: Request, res: Response, _next: NextFunction) => {
        res.render('index', {
            title: 'Home | Hijama',
            description: "",
            image: 'img/logo/logo.png',
            home: 'home'
        });

    }

    aboutus = (req: Request, res: Response, _next: NextFunction) => {
        res.render('aboutus', {
            title: 'About Us | Hijama',
            description: "",
            image: 'img/logo/logo.png',
            about: 'about'
        });
    }

    timeOption = [
        {value: 900, label: '09:00 AM'},
        {value: 945, label: '09:45 AM'},
        {value: 1030, label: '10:30 AM'},
        {value: 1115, label: '11:15 AM'},
        {value: 1200, label: '12:00 PM'},
        {value: 1245, label: '12:45 PM'},
        {value: 1330, label: '01:30 PM'},
        {value: 1415, label: '02:15 PM'},
        {value: 1500, label: '03:00 PM'},
        {value: 1545, label: '03:45 PM'},
        {value: 1630, label: '04:30 PM'},
        {value: 1715, label: '05:15 PM'},
        {value: 1800, label: '06:00 PM'},
        {value: 1845, label: '06:45 PM'},
        {value: 1930, label: '07:30 PM'},
        {value: 2015, label: '08:15 PM'},
        {value: 2100, label: '09:00 PM'}
    ]
    book = (req: Request, res: Response, _next: NextFunction) => {
        const date = new Date()
        const hours= date.getHours()
        const minutes= date.getMinutes()
        const startHour=parseInt(`${hours}${minutes<10?`0${minutes}`:minutes}`)
        const books = new Booking(req.body)
        const month = date.toLocaleString('default', {month: 'long'});
        const today = date.toLocaleDateString('default', {weekday: 'long'});
        books.findAvailableTimeByDate(date.toISOString().substr(0, 10), ({success, message, data}: any) => {
            let options = this.timeOption.filter(d => startHour<=d.value)
            if (data) {
                const result = data.map((time: any) => time.timeFrom)
                options = options.filter(d => !result.includes(d.value) && startHour<=d.value)
                res.render('booking', {
                    title: 'Booking form | Hijama',
                    description: "",
                    image: 'img/logo/logo.png',
                    book: 'book',
                    timeNotAvailable: options.length<=0?'yes':'',
                    data: {
                        dateBooking: date.toISOString().substr(0, 10),
                        date: `${today}, ${month} ${date.getDate()}`,
                        options: options
                    }
                });
            } else {
                res.render('booking', {
                    title: 'Booking form | Hijama',
                    description: "",
                    image: 'img/logo/logo.png',
                    book: 'book',
                    timeNotAvailable: options.length<=0?'Sorry! there is no time available. Please check for another date.':'',
                    data: {
                        dateBooking: date.toISOString().substr(0, 10),
                        date: `${today}, ${month} ${date.getDate()}`,
                        options: options
                    }
                });
            }
        })
    }
    checkAvailableTime = (req: Request, res: Response, _next: NextFunction) => {
        const books = new Booking(req.body)
        const today= new Date()
        let hours= today.getHours()
        let minutes= today.getMinutes()
        let startHour=parseInt(`${hours}${minutes<10?`0${minutes}`:minutes}`)
        let date = new Date(req.params.date)
        if(req.params.date==new Date().toISOString().substr(0,10)){
            date = new Date(req.params.date)
            date.setHours(hours,minutes)
        }

        hours= date.getHours()
        minutes= date.getMinutes()
        startHour=parseInt(`${hours}${minutes<10?`0${minutes}`:minutes}`)

        books.findAvailableTimeByDate(req.params.date, ({success, message, data}: any) => {
            let options = this.timeOption.filter(d => d.value>=startHour)

            if (data) {
                const result = data.map((time: any) => time.timeFrom)
                options = options.filter(d => !result.includes(d.value))
                res.send({success: true, options: options, timeNotAvailable: options.length<=0?'Sorry! there is no time available. Please check for another date.':'',})
            } else {
                res.send({success: true, options: options, timeNotAvailable: options.length<=0?'Sorry! there is no time available. Please check for another date.':'',})
            }
        })

    }
    bookNow = (req: Request, res: Response, _next: NextFunction) => {
        const date = new Date(req.body.dateBooking)
        const month = date.toLocaleString('default', {month: 'long'});
        const today = date.toLocaleDateString('default', {weekday: 'long'});
        const hours= date.getHours()
        const minutes= date.getMinutes()
        const startHour=parseInt(`${hours}${minutes<10?`0${minutes}`:minutes}`)
        const {isFirstTime, timeFrom} = req.body
        req.body.timeFrom = parseInt(timeFrom);
        req.body.timeTo = parseInt(timeFrom) + 44;
        req.body.isFirstTime = isFirstTime === 'Sorry! there is no time available. Please check for another date.';
        const booking = new Booking(req.body)
        booking.findOne(({success, message, data}: any) => {
            let options: { value: number; label: string; }[] = this.timeOption.filter(d => startHour<=d.value)
            if (data && success) {
                booking.findAvailableTimeByDate(req.body.dateBooking, (avilable: any) => {
                    if (avilable.data) {
                        const result = avilable.data.map((time: any) => time.timeFrom)
                        options = this.timeOption.filter(d => !result.includes(d.value) && startHour<=d.value)
                    }
                    res.render('booking', {
                        title: 'Booking form | Hijama',
                        description: "",
                        image: 'img/logo/logo.png',
                        message: message,
                        canBook: 'false',
                        timeNotAvailabletimeNotAvailable: options.length<=0?'Sorry! there is no time available. Please check for another date.':'',
                        data: {
                            dateBooking: new Date().toISOString().substr(0, 10),
                            date: `${today}, ${month} ${date.getDate()}`,
                            options: options,
                            ...req.body
                        }
                    });
                })
                return;
            } else {
                booking.createBooking((result: any) => {
                    let canBook = 'false'
                    if (result.success) {
                        booking.sendMail();
                        canBook = 'true'
                    }

                    if (result) {
                        booking.findAvailableTimeByDate(req.body.dateBooking, (avilable: any) => {
                            if (avilable.data) {
                                const result = avilable.data.map((time: any) => time.timeFrom)
                                options = this.timeOption.filter(d => !result.includes(d.value) && startHour<=d.value)
                            }
                            res.render('booking', {
                                title: 'Booking form | Hijama',
                                description: "",
                                image: 'img/logo/logo.png',
                                message: result.message,
                                canBook: canBook,
                                book: 'book',
                                timeNotAvailable: options.length<=0?'Sorry! there is no time available. Please check for another date.':'',
                                data: {
                                    dateBooking: new Date().toISOString().substr(0, 10),
                                    date: `${today}, ${month} ${date.getDate()}`,
                                    options: options.filter(time => time.value !== parseInt(timeFrom)),
                                    ...req.body
                                }
                            });
                        })
                    }

                })
            }

        })

    }

    contact = (req: Request, res: Response, _next: NextFunction) => {
        const htmlBody = `
            <p>You have a new contact request</p>
            <h3>Contact Details</h3>
            <ul>
                <li>Name:${req.body.name}</li>
                <li>Phone Number:${req.body.phoneNumber}</li>
                <li>E-Mail:${req.body.email}</li>
            </ul>
            <h3>Message</h3>
            <p>${req.body.message}</p>
        `;

        const subject = `Contact from ${req.body.name}`
        const emailTo = `${process.env.EMAIL_DEFAULT_TO}`
        sendEmailNotification(emailTo, htmlBody, subject);
        res.render('contactus', {
            title: 'Contact Us | Hijama',
            description: "",
            image: 'img/logo/logo.png',
            contact: 'contact',
            message: 'Email has been sent.'
        });
    }
    services = (req: Request, res: Response, _next: NextFunction) => {
        res.render('services', {
            title: 'Services | Hijama',
            description: "",
            image: 'img/logo/logo.png',
            services: 'services'
        });
    }

    contactus = (req: Request, res: Response, _next: NextFunction) => {
        res.render('contactus', {
            title: 'Contact Us | Hijama',
            description: "",
            image: 'img/logo/logo.png',
            contact: 'contact'
        });
    }

    public error404 = (req: Request, res: Response, _next: NextFunction) => {
        res.render('error404', {
            title: '404 Error',
            description: "",
            image: 'img/error-404.PNG'
        });
    }

    public error = (req: Request, res: Response, _next: NextFunction) => {
        res.redirect('/page-not-found');
    }
}

export default Controller
