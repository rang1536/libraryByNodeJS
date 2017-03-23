var express = require('express');
var mysql = require('mysql');
var conn = mysql.createConnection({
  host : '127.0.0.1',
  user : 'root',
  password : 'java0000',
  database : 'library22'
});
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
app.use(session({
  secret: 'H!@OJ$#ISNC@JRGO$J!@#',
  resave: false,
  saveUninitialized: true,
}));
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(__dirname+'/public'));
app.use(function(req, res, next){
  res.locals.user = req.session.level;
  next();
});
app.set('view engine', 'ejs');
app.set('views','./views');

conn.connect();

app.get('/home',function(req,res){
  res.render('booksHome');
});

//admin 로그인,로그아웃 라우트 분리
var admin = require('./routes/admin')();
app.use('/admin',admin);

//add 라우트분리
var add = require('./routes/add')();
app.use('/add',add)


//대여등록,대여리스트,대여수정(반납)로직 라우트분리
var rent = require('./routes/rent')();
app.use('/rent',rent);

//도서정보수정 로직 라우트분리.
var modify = require('./routes/booksModify')();
app.use('/booksModify',modify);

// 목록보기 리스트(도서목록,대출가능목록) 로직 분리
var list = require('./routes/list')();
app.use('/list',list);

app.listen(process.env.PORT || 3000,function(){
  console.log('Connected 3000port!');
});
