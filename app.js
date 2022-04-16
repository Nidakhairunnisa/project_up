const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const app = express()
const morgan = require('morgan')
const pool = require("./db")
const { body, validationResult, check } = require('express-validator');
const res = require('express/lib/response')
const port = 3000

// Set Templating Engines
app.use(expressLayouts)

// set morgan
app.use(morgan('dev'))

// set express json
app.use(express.json());

// Static Middleware 
 app.use(express.static('public'));
 app.use(express.urlencoded({extended :true}))

//information using ejs
app.set('view engine', 'ejs')

// Home page
app.get('/', (req, res) => {
    const nama = 'nida';
    const page = "Web Server Node JS";
    res.render("index.ejs", {nama, page});  
})  

// admin page
app.get('/admin', async (req, res) => {
    const page = 'Admin List'
    try{
        const {rows: detcont} = await pool.query(`SELECT id_admin, nama_admin FROM admin`)
            detcont.map(data => {
                console.log(data)
                if(data){
                    res.render("admin.ejs", {page, data}); 
                }
                return true;
            })
    } catch (err){
    }
})

// detail page
app.get('/detail_admin/:id_admin', async (req, res) => {
    const page = 'Detail Admin'
    try{
        const {rows: detcont} = await pool.query(`SELECT * FROM admin WHERE id_admin = ('${req.params.id_admin}')`)
            detcont.map(data => {
                console.log(data)
                if(data){
                    res.render("detail_admin.ejs", {page, data}); 
                }
                return true;
            })
    } catch (err){
    }
})

// add admin page
app.get('/add_admin', (req, res) => {
    const page = 'Add Admin'
    res.render("add_admin", {page});  
})

// POST data -> add admin
app.post('/admin',
        body('name').custom(async(name, {req})=>{
            try{
                const {rows: detcont} = await pool.query(`SELECT nama_admin FROM admin where nama_admin = '${req.params.nama_admin}'`)
                detcont.map(data => {
                    if(data){
                        throw new Error ('Duplicate name'); 
                    }
                    return true;
                })
            } catch (err){
                throw new Error ('Duplicate name'); 
            }
        }),
        check('email', 'Email not Valid').isEmail().normalizeEmail(), 
        check('mobile', 'Mobile not Valid').isMobilePhone('id-ID'),
        (req, res) => {         
            
            const errors = validationResult(req);
            if (errors)
            if (!errors.isEmpty()) {
                const notif = errors.array();
                res.render("add_admin", {notif})
            } else{
                    //insert database
                    const name = req.body.name
                    const email = req.body.email
                    const mobile = req.body.mobile
                    const password = req.body.password
                    const newCont = pool.query(`INSERT INTO admin VALUES (DEFAULT,'${name}', '${email}', '${mobile}', '${password}')`, function (err, result){
                        if (err) {
                            console.log("Error Saving : %s ", err);
                        }
                        
                    })
                    res.redirect('/admin')
                    //res.send("now data is added")
            }

    
})


//menghapus data di page detail
app.get('/admin/del/:id_admin', (req, res) => {
    const newCont = pool.query(`DELETE FROM admin WHERE id_admin = ('${req.params.id_admin}')`, function (err, result){
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
            res.redirect('/admin')
    })

})

// update data di page detail
app.get('/admin/update/:id_admin', async (req, res) => {
    
    // pakai ini update formnya ga muncul
    try{
        const {rows: detcont} = await pool.query(`SELECT id_admin FROM admin where id_admin = '${req.params.id_admin}'`)
            detcont.map(data => {
                console.log(data)
                if(data){
                    res.render("update.ejs", {page, data}); 
                }
                return true;
            })
    } catch (err){
    }

    // kalau pake ini data lamanya ga keluar atau datanya kosong
    // const newCont = pool.query(`SELECT id_admin FROM admin where id_admin = '${req.params.id_admin}'`, function (err, result){
    //     console.log('23')
    //     if (err) {
    //         console.log(err);
    //         res.status(400).send(err);
    //     }
    //     res.render("update.ejs", {data : result.rows})
    // })

})

//POST data update -> update admin
app.post('/admin/update/:id_admin',
        body('name').custom(async(name, {req})=>{
            try{
                //cek duplicate
                const {rows: detcont} = await pool.query(`SELECT nama_admin FROM admin where nama_admin = '${req.params.nama_admin}'`)
                    detcont.map(data => {
                        if(name !== data && req.body.oldname){
                            throw new Error ('Duplicate name'); 
                        }
                        return true;
                    })
            } catch (err){
                throw new Error ('Duplicate name'); 
            }
        }), 
        check('email', 'Email not Valid').isEmail(), 
        check('mobile', 'Mobile not Valid').isMobilePhone('id-ID'),
        (req, res) => {         
            const errors = validationResult(req);
            const data = [req.body];
            console.log(data)
            if (!errors.isEmpty()) {
                const notif = errors.array();
                res.render("update", {notif, data})
            } else{
                const {name, email, mobile, password} = req.body
                const newCont = pool.query(`UPDATE contacs SET name = '${name}', email= '${email}', mobile = '${mobile}', password = '${password}' WHERE id_admin = '${req.params.id_admin}'`, function (err, result){
                    if (err) {
                        console.log("Error Updating : %s ", err);
                    }
                    res.redirect('/admin')
                })
            }
})

// handling error
app.use(function(req, res, next) {

    var err = new Error('Not Found');
    err.status = 404;
    next(err);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})