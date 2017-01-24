var express = require('express');
var mysql = require('mysql');
var conn = mysql.createConnection({
  host : '127.0.0.1',
  user : 'root',
  password : 'java0000',
  database : 'library22'
});
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');
app.set('views','./views');

conn.connect();

app.get('/home',function(req,res){
  res.render('booksHome');
});
// get요청 등록화면들.
app.get('/add/:id',function(req,res){
  var id = req.params.id;
  var sqlLibrary = 'SELECT * FROM library';
  conn.query(sqlLibrary,function(err, libraryResult){
    if(err){
      res.send("System Error2!")
    } else {
      if(id === 'books'){
        var sql = 'SELECT * FROM bookskinds';
        conn.query(sql, function(err, kindsresult){
          if(err){
            res.send("System Error1!")
          } else {
            res.render(id+'AddForm',{booksKinds:kindsresult, libResult:libraryResult});
          }
        });
      } else if(id === 'member'){
        var sql = 'SELECT * FROM local'
        conn.query(sql, function(err, localResult){
          if(err){
            res.send("System Error1!")
          } else {
            res.render(id+'AddForm',{local:localResult, libResult:libraryResult});
          }
        });
      }
    }
  });
});
//post요청처리(등록)
app.post('/add/:id',function(req, res){
  var libNum = req.body.libraryCode;
  var sql = 'SELECT localnumber FROM library WHERE librarynumber=?';
  var localNum ='';
  // 지역번호 구하기
  conn.query(sql,[libNum], function(err, localNum){
    if(err){
      res.send('localNum : '+err);
    }else {
      console.log(localNum[0].localnumber);
      //id값 가져와서 books요청이면 도서등록 실시.
      var id=req.params.id;
      if(id==='books'){
        var sql =' INSERT INTO books(bookskindsnumber,'
          +'localnumber,librarynumber,booksname,booksmade,booksauthor,'
          +'bookslendingpossible,bookslendingcount,bookslendingday,booksdamage) '
          +'VALUES(?,?,?,?,?,?,?,?,?,?)';
        var stateMent = [
          req.body.booksCategory, localNum[0].localnumber, req.body.libraryCode, req.body.booksName,
          req.body.bookCompany,req.body.booksWriter, req.body.rentCan, req.body.rentCount,
          req.body.rentDaily, req.body.booksDamage];
        conn.query(sql, stateMent, function(err, result){
          if(err){
            res.send(err);
          }else{
            res.redirect('/home');
          }
        });
      }
    }
  });
});
app.post('/modify/:id', function(req, res){
  res.send('h2 modifyPost!!')
});
app.get('/modify/:id', function(req, res){
  var id = req.params.id;
  var sql = 'SELECT books.*, bookskinds.bookskindname, library.libraryname'
    +' FROM books'
    +' LEFT JOIN bookskinds'
    +' ON books.bookskindsnumber = bookskinds.bookskindnumber'
    +' LEFT JOIN library'
    +' ON books.librarynumber = library.librarynumber'
    +' WHERE booksnumber = ?';
  conn.query(sql,[id],function(err, result){
    if(err){
      res.send('modify!'+err);
    }else{
      console.log(result);
      sql = 'SELECT * FROM bookskinds';
      conn.query(sql,function(err,kinds){
        if(err){
          res.send('modify!'+err);
        }else{
          sql= 'SELECT * FROM library';
          conn.query(sql, function(err,lib){
            if(err){
              res.send('modify!'+err);
            }else{
              res.render('booksModify',{books:result, booksKinds:kinds, libResult:lib});
            }
          });
        }
      });
    }
  });
});

app.get('/list/:id', function(req, res){
  var sql = 'SELECT * FROM books';
  conn.query(sql, function(err, result){
    if(err){
      res.send('list Error : '+ err);
    }else{
      res.render('booksList',{booksList:result});
    }
  });
});
app.listen(3000,function(){
  console.log('Connected 3000port!');
});
