const protocol = process.env.PROTOCOL
let options = {
    swaggerDefinition: {
        info: {
            title: 'Roll-call API',
            version: "1.0.0",
            description: "Author: Tran Nguyen Chi Nhan"
        },
        host: process.env.HOST,
        basePath: '/api',
        produces: [
            "application/json",
        ],
        schemes: [protocol],
        securityDefinitions: {
            Bearer: {
                description: 'Copy token của tài khoản đưa vào ô value.',
                type: 'apiKey',
                name: 'Authorization',
                in: 'header'
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./routes/*.js', './models/*.js'] //Path to the API handle folder
};

module.exports = options;