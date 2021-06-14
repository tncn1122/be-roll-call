const bcrypt = require('bcryptjs')

async function fx(){
    let pass = "admin";
    const ps = await bcrypt.hash(pass, 8);
    //console.log(ps);
}

fx();

