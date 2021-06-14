let options = {
    swaggerDefinition: {
        info: {
            title: 'Roll-call API',
            version: '1.0.0',
        },
        host: process.env.HOST,
        basePath: '/api',
        produces: [
            "application/json",
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            Bearer: {
                description: 'Copy token của tài khoản bỏ vào ô value.',
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