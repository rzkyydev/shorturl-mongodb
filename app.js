const express = require("express"),
    logger = require("morgan"),
    cors = require("cors"),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    database = require("./db/mongo"),
    db = database.get("short-url"),
    db2 = database.get("html-gen");


const app = express()
const port = process.env.PORT || 8000

const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

app.set('json spaces', 2)
app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static('public'))
app.set("view engine", "ejs");
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.get('/', async(req, res) => {
let jumlahdb = await db.count()
    res.render(__dirname + '/public/index.ejs',{ jumlahdb })
})
app.get('/data', async(req, res) => {
const teksnya = req.query.data
const datanya = req.query.get
const apikey = req.query.apikey
if(!apikey) return res.json({status:false, message: "ngapain cuy"})
if(apikey !== 'ikiapi') return res.json({status:false, message: "ngapain cuy"})
try {
hasil = datanya ? await db.find({ [teksnya]: datanya}) : await db.find()
    datanya ? res.json({ result: hasil }) : res.json({db: hasil , count: await db.count()})
} catch(e) {
res.json({ 
status: false,
message: "error",
error: String(e)
})
}
})

app.use('/delete/:id', async (req, res) => {
    db.findOne({
        delete: req.params.id
    }).then((result) => {
        if (result == null) return res.status(404).json({
            status: false,
            message: "ID not found"
        })
        if (req.method == "POST") {
            db.findOneAndDelete({
                delete: req.params.id
            }).then((result) => {
                if (result == null) return res.status(404).json({
                    status: false,
                    message: "ID not found"
                })
                else res.status(200).json({
                    status: true,
                    message: "Success delete short url"
                })
            })
        } else res.sendFile(__dirname + '/public/delete.html')
    })
})

app.get('/:id', async (req, res, next) => {
    db.findOne({
        id: req.params.id
    }).then((result) => {
        if (result == null) return next()
        else res.redirect(result.url)
    })
})

app.get('/create', async (req, res) => {
    const ur = req.originalUrl,
        costum = req.query.costum,
url = ur.replace('/create?url=','').split('&costum')[0]
console.log(req.originalUrl)
    if (!url) return res.status(400).json({
        status: false,
        message: "Masukkan parameter url"
    })

    if (!isUrl(url)) return res.status(400).json({
        status: false,
        message: "Harap masukkan url parameter yang valid"
    })
    const id = costum ? costum : makeid(6)
    const delete_id = makeid(18)
    const check = await db.findOne({
        id
    })
    if (check) return res.status(400).json({
        status: false,
        message: "Id tersebut sudah ada, silahkan coba lagi atau ganti dengan yang lain"
    })
    let urls = new URL(url)
    
    db.insert({
        id,
        url: urls.href,
        delete: delete_id
    }).then(() => res.status(200).json({
        status: true,
        result: {
            url: 'https://sl.rzkyfdlh.tech/'+id,
            delete: 'https://sl.rzkyfdlh.tech/delete/'+delete_id
        }
    })).catch((err) => {
        console.log(err)
        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    })
})
app.get('/createhtml', async (req, res) => {
    const htmlny = req.query.code,
        nameny = req.query.name
console.log(req.query.code)
    if (!htmlny) return res.status(400).json({
        status: false,
        message: "Masukkan parameter code html"
    })

    const idny = nameny ? nameny : makeid(4)
    const delete_idny = makeid(18)
    const checkny = await db2.findOne({
        id: idny
    })
    if (checkny) return res.status(400).json({
        status: false,
        message: "Name tersebut sudah ada, silahkan coba lagi atau ganti dengan yang lain"
    })
    fs.writeFileSync('./public/web/'+idny+'.html',htmlny)
    db2.insert({
        id: idny,
        code: htmlny,
        delete: delete_idny
    }).then(() => res.status(200).json({
        status: true,
        result: {
            url: 'https://sl.rzkyfdlh.tech/web/'+idny,
            delete: 'https://sl.rzkyfdlh.tech/web/delete/'+delete_idny
        }
    })).catch((err) => {
        console.log(err)
        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    })
})
app.post('/create2', async (req, res) => {
    const re = req.body.url,
        tum = req.body.costum,
rel = re
console.log(rel+'\n'+tum)
    if (!rel) return res.status(400).json({
        status: false,
        message: "Masukkan parameter url"
    })

    if (!isUrl(rel)) return res.status(400).json({
        status: false,
        message: "Harap masukkan url parameter yang valid"
    })
    const red = tum ? tum : makeid(6)
    const del = makeid(18)
    const cr = await db.findOne({
        id: red
    })
    if (cr) return res.status(400).json({
        status: false,
        message: "Id tersebut sudah ada, silahkan coba lagi atau ganti dengan yang lain"
    })
let asw = new URL(rel)
    db.insert({
        id: red,
        url: asw.href,
        delete: del
    }).then(() => res.status(200).json({
        status: true,
        result: {
            id: red,
            delete: del
        }
    })).catch((err) => {
        console.log(err)
        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    })
})

// Handling 404
app.use(function (req, res, next) {
    res.status(404).json({
        status: false,
        message: "Page not found"
    })
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
