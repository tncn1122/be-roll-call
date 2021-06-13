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
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./routes/*.js'] //Path to the API handle folder
};

module.exports = options;