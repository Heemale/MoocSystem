const express = require("express");
const path = require("path");
const bodyParser =require("body-parser");
const port = 3000;
const app = express();



// -----------------------------------------------------
// -----------------------------------------------------

//mysql启动
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
    "mysql://root:root@127.0.0.1:3306/study",
    {
        pool:{
            max:50,
            min:10,
            acquire:30000,
            idle:10000
        },
        define:{
            timestamp:false
        },
        dialect:"mysql"
    }
);

const user = sequelize.define("user",{
        name:{
            type:Sequelize.STRING,
            allowNull:true,
        },psw:{
            type:Sequelize.STRING,
            allowNull:true,
        },email:{
            type:Sequelize.STRING,
            allowNull:true,
        },enable:{
            type:Sequelize.STRING,
            allowNull:false,
        }
    },
    {
        freezeTableName:true,
    },
);

const record = sequelize.define("record",{
        uid:{
            type:Sequelize.INTEGER,
            allowNull:true,
        },videos:{
            type:Sequelize.STRING,
            allowNull:true,
        },times:{
            type:Sequelize.INTEGER,
            allowNull:true,
        },qcode:{
            type:Sequelize.STRING,
            allowNull:true,
        }
    },
    {
        freezeTableName:true,
    },
);


sequelize
    .authenticate()
    .then(()=>{
        console.log(">数据库连接成功！！");
        app.listen(port,()=>{
            console.log(">运行端口为" +port+"！！");
        })
    })
    .catch(err =>{
        console.error(">连接失败！！：",err)
    });

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use(express.static(path.join(__dirname,"public")));
console.log(__dirname);

//session begin
var session = require('express-session');
var sess = {
    saveUninitialized: true,
    resave: false,
    secret: 'keyboard jianghai ',
    // cookie: { maxAge: 60000 }
};
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess));
// session end


//view setup
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");





//index
app.get("/",(req,res,next)=>{

    //1.首页限制
    if (!req.session.name) {
        console.log("未登录");
        res.redirect('/login');
        return
    }

    res.render("index",{
        msg:{ code:"good",txt:req.session.name  }
    });
});


app.get("/login",(req,res,next)=>{
    res.render("login",{
        msg:{}
    });
});

app.post("/login",(req,res,next)=>{
    _name = req.body.name;
    _psw = req.body.psw;

    console.log("名字为 %s 密码为 %s", _name,_psw);



    user.findOne({ where:{name:_name,psw:_psw,enable:1} }).then(rows=>{
        console.log(">查询结果：",JSON.stringify(rows,null,4));

        if (rows){
            req.session.name = _name;
            req.session.enable = 1;
            res.redirect("/");
        } else {
            res.render("login",{
                msg:{ code:"2333~~",txt:"~~~用户名或者密码错误啦~~" }
            });
        }
    })

});

app.get("/videos/:num",(req,res,next)=>{
    res.render("videos")
});


app.get("/statisticalData",(req,res,next)=>{
    res.render("statisticalData")
});

app.get("/dataTables",(req,res,next)=>{
    res.render("dataTables")
});

app.get("/danmu",(req,res,next)=>{
    res.render("danmu")
});

app.get("/QuestionBank",(req,res,next)=>{
    res.render("QuestionBank")
});

app.get("/QuestionBankBatchImport",(req,res,next)=>{
    res.render("QuestionBankBatchImport")
});




