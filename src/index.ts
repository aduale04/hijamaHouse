import App from "./App";

const port = process.env.PORT || 3000;
const app= new App();



app.expressApp.listen(port, () => {
    return console.log(`server is listening on http://localhost:${port}`);
});
