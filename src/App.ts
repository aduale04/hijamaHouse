import express, {Application} from "express";
const bodyParser = require('body-parser');
import * as dotenv from 'dotenv';
import  {join} from "path";
import expressHandlebars  from 'express-handlebars'
import Controller from "./controllers/Controller";

class App {
    public expressApp: Application;

    constructor() {
        dotenv.config();
        this.expressApp = express();
        const controller= new Controller();
        this.expressApp.use(bodyParser.urlencoded({extended:false}));
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(controller.router);
        this.prepareStatic();
        this.setViewEngine();
        this.expressApp.get('/page-not-found',controller.error404);
        this.expressApp.get('*',controller.error);
    }

    // This serves everything in `static` as static files
    private prepareStatic(): void {
        this.expressApp.use(express.static(join(__dirname, '..', 'public/assets')));
    }

    // Sets up handlebars as a view engine
    private setViewEngine(): void {
        // this.expressApp.engine('.hbs', expressHandlebars({extname: '.hbs'}));
        this.expressApp.engine( '.hbs', expressHandlebars( {
            extname: 'hbs',
            defaultLayout: 'main',
            layoutsDir: join(__dirname, '..', '/public/views/layouts/'),
            partialsDir: join(__dirname, '..', '/public/views/templates/')
        } ) );
        this.expressApp.set('views', join(__dirname, '..', 'public/views'));
        this.expressApp.set('view engine', 'hbs');
    }
}

export default App;
