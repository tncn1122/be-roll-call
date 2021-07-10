module.exports = {
  apps : [{
    script: 'app.js',
    watch: '.'
  },],

  deploy: {
    production: {
      user: 'tncn1122',
      host: '13.250.121.254',
      key: 'deploy.key',
      ref: 'origin/master',
      repo: 'https://github.com/tncn1122/be-roll-call',
      path: 'https://github.com/tncn1122/be-roll-call',
      'post-deploy':
        'yarn install && yarn build && pm2 reload ecosystem.config.js --env production && pm2 save && git checkout yarn.lock',
    },
  },
};
