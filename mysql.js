var cors = require('cors');
const express = require('express');
const app = express();
app.use(cors());

//连接到数据库
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',
    password : 'root',
    database : 'groupchat'
});
connection.connect(function(err) {
    if (err) {
        console.error('连接失败: ' + err.stack);
        return;
    }
    console.log('连接成功，id是 ' + connection.threadId);
});

/*  1.答题系统  */
/* 1.1弹出问题 */
/**
 * 1.
 * GET [v_id=1] 时间点列表
 * GET /api/tab_question/video/timepoints/search/v_id=1
 * */
app.all('/api/tab_question/video/timepoints/search/v_id=:_v_id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    var _v_id = req.params._v_id;
    console.log("GET [v_id=1] 时间点列表" +
        "，_v_id=>"+_v_id);


    var query = connection.query('select time from tab_question where v_id =? group by time;', [_v_id], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});

/**
 * 2.
 * GET [v_id=1] [time=5] 指定时间点，随机得到1个问题，选项随机排序
 * GET /api/tab_question/question/random/search/v_id=1&time=5
 * */
app.all('/api/tab_question/question/random/search/v_id=:_v_id&time=:_time', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    var _v_id = req.params._v_id;
    var _time = req.params._time;
    console.log("GET [v_id=1] [time=5] 随机1个问题随机答案" +
        "，_v_id=>" + _v_id +
        "，_time=>"+_time);

    var query = connection.query(' select * from\n' +
        ' tab_question t1 \n' +
        ' \tleft join tab_answer t2\n' +
        ' \ton `t1`.id=`t2`.q_id\n' +
        '    where t1.id in (\n' +
        '    \tselect t.id from(\n' +
        '        \t select * from `tab_question` where v_id=? && TIME=?  order by RAND() limit 1\n' +
        '        ) t\n' +
        '    ) order by RAND()\n' +
        ';', [_v_id,_time], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});

/**
 * 3.
 * GET [选项] 的正确性
 * GET /api/tab_answer/answer/correctness/search/a_id=1
 **/
app.all('/api/tab_answer/answer/correctness/search/a_id=:_a_id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    var _a_id = req.params._a_id;
    console.log("GET [选项] 的正确性" +
        "，_a_id=>"+_a_id);

    var query = connection.query('select correctness from `tab_answer` where id = ?;', [_a_id], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});

/* 1.2记录作答 */
/**
 * 4.
 * POST 答题数据
 * POST /api/u/tab_record_answer/add/v_id=1&u_id=1&q_id=1&a_id=1&correctness=0
 **/
app.all('/api/u/tab_record_answer/add/v_id=:_v_id&u_id=:_u_id&q_id=:_q_id&a_id=:_a_id&correctness=:_correctness', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _v_id = req.params._v_id;
    var _u_id = req.params._u_id;
    var _q_id = req.params._q_id;
    var _a_id = req.params._a_id;
    var _correctness = req.params._correctness;

    console.log("POST 答题数据" +
        "，_v_id=>"+_v_id +
        "，_u_id=>" + _u_id +
        "，_q_id=>" + _q_id +
        "，_a_id=>" + _a_id +
        "，_correctness=>" + _correctness);

    let date = new Date();
    let nowadays = dateFormat("YYYY-mm-dd HH:MM:SS", date);
    console.log(" 当前时间=>",nowadays);

    var query = connection.query('insert into `tab_record_answer` \n' +
        '(v_id,u_id,q_id,a_id,timestamp,correctness)\n' +
        'values\n' +
        '(?,?,?,?,?,?);', [_v_id,_u_id,_q_id,_a_id,nowadays,_correctness], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp({

                "state":"200",

                "msg":"success",

                "data": {
                    affectedRows:results.affectedRows,
                    insertId:results.insertId
                }

            });
        }
    });

});



/**
 * GET [v_id=1] 问题列表
 * GET /api/tab_question/question/questions/search/v_id=1
 **/
app.all('/api/tab_question/question/questions/search/v_id=:_v_id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _v_id = req.params._v_id;
    console.log("GET [v_id=1] 问题列表" +
        "，_v_id=>"+_v_id);

    var query = connection.query('select id from `tab_question` where v_id=?;', [_v_id], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});

/**
 * GET [q_id=1] 各个选项的人数
 * GET /api/tab_record_answer/answer/counts/search/q_id=1
 **/
app.all('/api/tab_record_answer/answer/counts/search/q_id=:_q_id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _q_id = req.params._q_id;
    console.log("GET [q_id=1] 各个选项的人数" +
        "，_q_id=>"+_q_id);

    var query = connection.query('select t4.a_id,COUNT(*) as counts from\n' +
        '  ( select t3.* from\n' +
        '  (SELECT \n' +
        ' \tt1.* \n' +
        ' FROM \n' +
        ' tab_record_answer t1\n' +
        ' \tLEFT JOIN tab_record_answer t2 \n' +
        '    ON t1.u_id = t2.u_id\n' +
        '    and t1.q_id =t2.q_id\n' +
        '    AND t1.timestamp < t2.timestamp\n' +
        ' WHERE t2.id IS NULL) t3 where q_id = ?) t4 group by t4.a_id;', [_q_id], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});



/**
 * POST 问题数据
 * POST /api/u/tab_question/add/v_id=2&title=问题&time=5
 **/
app.all('/api/u/tab_question/add/v_id=:_v_id&title=:_title&time=:_time', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _v_id = req.params._v_id;
    var _title = req.params._title;
    var _time = req.params._time;

    console.log("POST " +
        "[_v_id=" +  _v_id + "]" +
        "[_title=" +  _title + "]" +
        "[_time=" +  _time + "]" +
        " 问题数据");

    var query = connection.query('insert into `tab_question` (v_id,title,time)\n' +
        '\tVALUE(?,?,?);', [_v_id,_title,_time], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp({

                "state":"200",

                "msg":"success",

                "data": {
                    affectedRows:results.affectedRows,
                    insertId:results.insertId
                }

            });
        }
    });

});

/**
 * POST 答案数据
 * POST /api/u/tab_question/add/v_id=2&q_id=5&context=答案一&correctness=0
 **/
app.all('/api/u/tab_question/add/v_id=:_v_id&q_id=:_q_id&context=:_context&correctness=:_correctness', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _v_id = req.params._v_id;
    var _q_id = req.params._q_id;
    var _context = req.params._context;
    var _correctness = req.params._correctness;

    console.log("POST " +
        "[_v_id=" +  _v_id + "]" +
        "[_q_id=" +  _q_id + "]" +
        "[_context=" +  _context + "]" +
        "[_correctness=" +  _correctness + "]" +
        " 答案数据");

    var query = connection.query('insert into tab_answer (v_id,q_id,context,correctness)\n' +
        '\tVALUE(?,?,?,?);', [_v_id,_q_id,_context,_correctness], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp({

                "state":"200",

                "msg":"success",

                "data": {
                    affectedRows:results.affectedRows,
                    insertId:results.insertId
                }

            });
        }
    });

});

/**
 * GET [v_id=2] [time=20] 附近10s的时间点
 * GET /api/tab_question/video/timepoints/nearby/search/v_id=1&time=20
 **/
app.all('/api/tab_question/video/timepoints/nearby/search/v_id=2&time=:_time', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _time = req.params._time;

    console.log("POST " +
        "[_v_id=" + 2 + "]" +
        "[_time=" + _time + "]" +
        " 附近10s的时间点");

    let lowerLimit = _time-10;
    let upperLimit = _time+10;

    var query = connection.query('select time from `tab_question` where\n' +
        ' v_id = 2\n' +
        ' and\n' +
        ' time>=? && time<=? && time!=?;', [lowerLimit,upperLimit,_time], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});

/**
 * POST 添加观看记录
 * POST /api/u/tab_record_video/add/v_id=1&u_id=1&progress=15&finished=0
 **/
app.all('/api/u/tab_record_video/add/v_id=1&u_id=1&progress=:_progress&finished=:_finished', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _progress = req.params._progress;
    var _finished = req.params._finished;
    let date = new Date();
    let nowadays = dateFormat("YYYY-mm-dd HH:MM:SS", date);

    console.log("POST " +
        "[_progress=" +  _progress + "]" +
        "[_finished=" +  _finished + "]" +
        " 添加观看记录");

    var query = connection.query('insert into `tab_record_video` \n' +
        '(v_id,u_id,progress,finished,TIMESTAMP)\n' +
        'VALUE\n' +
        '(1,1,?,?,?);', [_progress,_finished,nowadays], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp({

                "state":"200",

                "msg":"success",

                "data": {
                    affectedRows:results.affectedRows,
                    insertId:results.insertId
                }

            });
        }
    });

});

/**
 * GET 上次观看时间
 * GET /api/u/tab_record_video/last/time/v_id=1&u_id=1
 **/
app.all('/api/u/tab_record_video/last/time/v_id=:_v_id&u_id=:_u_id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _v_id = req.params._v_id;
    var _u_id = req.params._u_id;

    console.log("GET " +
        "[_v_id=" +  _v_id + "]" +
        "[_u_id=" +  _u_id + "]" +
        " 上次观看时间");

    var query = connection.query('SELECT \n' +
        ' \tt1.progress \n' +
        ' FROM \n' +
        ' tab_record_video t1\n' +
        ' \tLEFT JOIN tab_record_video t2\n' +
        '    ON t1.v_id =t2.v_id = ?\n' +
        '    AND t1.u_id = t2.u_id = ?\n' +
        '    AND t1.timestamp < t2.timestamp\n' +
        ' WHERE t2.id IS NULL', [_v_id,_u_id], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});

/**
 * GET 展示题目
 * GET /api/tab_question/search/id=1
 **/
app.all('/api/tab_question/search/id=:_id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _id = req.params._id;

    console.log("GET " +
        "[_id=" +  _id + "]" +
        " 展示题目");

    var query = connection.query('select title from tab_question where id=?;', [_id], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});

/**
 * GET 展示答案
 * GET /api/tab_answer/search/q_id=1
 **/
app.all('/api/tab_answer/search/q_id=:_q_id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _q_id = req.params._q_id;

    console.log("GET " +
        "[_q_id=" +  _q_id + "]" +
        " 展示答案");

    var query = connection.query('select context from tab_answer where q_id=?;', [_q_id], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});

/**
 * GET 统计答题正确率
 * GET /api/tab_record_answer/correct/rate/search
 **/
app.all('/api/tab_record_answer/correct/rate/search', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    console.log("GET " +
        " 统计答题正确率");

    var query = connection.query('select\n' +
        '\tq_id, \n' +
        '\tcount(1) totalCount,\n' +
        '\tsum(case when correctness = 1 then 1 else 0 end) rightCount,\n' +
        '\tsum(case when correctness != 1 then 1 else 0 end) mistakeCount \n' +
        '\tfrom \n' +
        '    \n' +
        '(SELECT \n' +
        ' \tt1.* \n' +
        ' FROM \n' +
        ' tab_record_answer t1\n' +
        ' \tLEFT JOIN tab_record_answer t2\n' +
        '    ON t1.u_id = t2.u_id\n' +
        '    and t1.q_id =t2.q_id\n' +
        '    AND t1.timestamp < t2.timestamp\n' +
        ' WHERE t2.id IS NULL) t3\n' +
        ' \n' +
        'group by q_id;', [], function (error, results, fields) {
        if (error) throw error;
        else {
            res.jsonp(results);
        }
    });

});


/**
 * 题库系统
 * */
/**
 * GET 题库展示题目
 * GET /api/tab_question/question/bank/search
 **/
app.all('/api/tab_question/question/bank/search', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    console.log("GET " +
        " 所有题目");

    var query = connection.query('select id,title from tab_question;', [], function (error, results, fields) {
        if (error) throw error;
        else {
            results = {'data':results};
            res.json(results);
        }
    });

});

/**
 * GET 题库展示答案
 * GET /api/tab_answer/question/bank/search/q_id=1
 **/
app.all('/api/tab_answer/question/bank/search/q_id=:_q_id', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var _q_id = req.params._q_id;

    console.log("GET " +
        "[_q_id=" +  _q_id + "]" +
        " 展示答案");

    var query = connection.query('select context,correctness from tab_answer where q_id=?;', [_q_id], function (error, results, fields) {
        if (error) throw error;
        else {
            res.json(results);
        }
    });

});


/**
 * 时间转化工具
 * 转化结果 2021-10-23 12:58:11
 * */
function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        }
    }
    return fmt;
}


app.listen(3002);
console.log(">运行成功，端口：3002");