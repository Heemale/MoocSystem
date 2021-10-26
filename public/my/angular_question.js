
angular.module('ngBlockchain', [])
    .controller('zbycontroller', ['$scope', '$http', '$interval', '$filter', '$window',

        function ($scope, $http, $interval, $filter, $window) {
            console.log("ok");



            /**
             * GET 上次观看时间
             * GET /api/u/tab_record_video/last/time/v_id=1&u_id=1
             **/
            var promise = $http.get('http://127.0.0.1:3002/api/u/tab_record_video/last/time/v_id=1&u_id=1', {params: {}}).then(
                (res) => {
                    console.log("GET 上次观看时间=>",res.data[0].progress);
                    $scope.video.currentTime = res.data[0].progress
                },
                (err) => {
                    console.log('err');
                }
            );

            window.onbeforeunload = function () {
                RecordTime();
                return "exit";
            };

            window.onunload = function () {
                RecordTime();
                // return "exit";
            };


            function RecordTime(){
                let _finished = 0;
                let _progress = parseInt($scope.video.currentTime);
                if ($scope.video.currentTime == $scope.video.duration){
                    _finished = 1;
                }
                /**
                 * POST 添加观看记录
                 * POST /api/u/tab_record_video/add/v_id=1&u_id=1&progress=15&finished=0
                 **/
                var promise = $http.get('http://127.0.0.1:3002/api/u/tab_record_video/add/v_id=1&u_id=1&progress='+ _progress +'&finished=' + _finished, {params: {}}).then(
                    (res) => {
                        console.log("GET [v_id=2] [time=20] 附近10s的时间点=>",res.data);
                    },
                    (err) => {
                        console.log('err');
                    }
                );

            }


            $scope.addQuestion = function (){
                let radio = new Array();
                radio[0] = $('input:radio[name="setRadio"]:checked').val();
                let correct = radio[0];
                console.log("correct=>",correct);
                if (radio[0] == undefined){
                    alert("请勾选一个正确答案");
                    return;
                }
                // console.log("测试=>",$('#login_value').serialize());

                console.log($("#setAnswer1").val());
                console.log($("#setAnswer2").val());
                console.log($("#setAnswer3").val());
                console.log($("#setAnswer4").val());

                let _title = $("#setTitle").val();
                let _time = $("#setTime").val();

                /**
                 * GET [v_id=2] [time=20] 附近10s的时间点
                 * GET /api/tab_question/video/timepoints/nearby/search/v_id=1&time=20
                 **/
                var promise = $http.get('http://127.0.0.1:3002/api/tab_question/video/timepoints/nearby/search/v_id=2&time=' + _time, {params: {}}).then(
                    (res) => {
                        console.log("GET [v_id=2] [time=" + _time + "] 附近10s的时间点=>",res.data);
                        if (res.data.length > 0){
                            alert("10s范围内设置过时间点")
                        } else{
                            /**
                             * POST 问题数据
                             * POST /api/u/tab_question/add/v_id=2&title=问题&time=5
                             **/
                            var promise = $http.post('http://127.0.0.1:3002/api/u/tab_question/add/v_id=2&title='+ _title +'&time='+ _time , {params: {}}).then(
                                (res) => {
                                    console.log("POST 问题数据=>",res.data);
                                    console.log("POST 问题数据 data.msg=>",res.data.data.insertId);


                                    for(i=1;i<5;i++){
                                        let _context = $("#setAnswer" + i).val();
                                        console.log("_context=>"+_context);

                                        let _q_id = res.data.data.insertId;
                                        let correctness = 0;
                                        if(i==correct){
                                            correctness = 1;
                                        } else{
                                            correctness = 0;
                                        }

                                        var promise = $http.post('http://127.0.0.1:3002/api/u/tab_question/add/' +
                                            'v_id=2'+ '&' +
                                            'q_id='+ _q_id + '&' +
                                            'context=' + _context + '&' +
                                            'correctness=' + correctness, {params: {}}).then(
                                            (res) => {
                                                console.log("POST 答案数据=>",res.data);

                                            },
                                            (err) => {
                                                console.log('err');
                                            }
                                        );
                                    }
                                    alert("添加完成");
                                },
                                (err) => {
                                    console.log('err');
                                }
                            );
                        }
                    },
                    (err) => {
                        console.log('err');
                    }
                );




            };


            function getjson(_qid) {
                var radio = new Array();
                var radio_name = new String("radio_" + _qid);
                radio[0] = $('input:radio[name=' + radio_name + ']:checked').val();
                console.log("radio_name=>",radio_name);
                console.log("radio[0]=>",radio[0]);

                return radio;
            }


            $scope.my_confirm = function (_qid,_name,_submitId) {
                var json = getjson(_qid);
                let _aid = json[0];

                /**
                 * GET [选项] 的正确性
                 * GET /api/tab_answer/answer/correctness/search/a_id=1
                 **/
                var promise = $http.get('http://127.0.0.1:3002/api/tab_answer/answer/correctness/search/a_id=' + _aid , {params: {}})
                    .then(
                        (res) => {
                            console.log("GET [选项] 的正确性=>",res.data);
                            console.log("GET [选项] 的正确性=>",res.data[0].correctness);
                            let _correctness = res.data[0].correctness;
                            if(_correctness == 1){
                                alert("回答正确")
                            } else{
                                alert("回答错误")
                            }
                            /**
                             * POST 答题数据
                             * POST /api/u/tab_record_answer/add/v_id=1&u_id=1&q_id=1&a_id=1
                             **/
                            var promise = $http.post('http://127.0.0.1:3002/api/u/tab_record_answer/add/v_id=1&u_id=1&' +
                                'q_id='+ _qid  +'&' +
                                'a_id=' + _aid +'&' +
                                'correctness=' + _correctness
                                , {params: {}})
                                .then(
                                    (res) => {
                                        console.log("POST 答题数据=>",res.data);
                                        console.log("POST 答题数据 data.msg=>",res.data.msg);

                                        if (res.data.msg == "success"){
                                            console.log("_submitId=>",_submitId);
                                            $scope.questions[_submitId].submitflag = true;
                                            $(_name).hide();
                                        }
                                    },
                                    (err) => {
                                        console.log('err');
                                    }
                                );

                        },
                        (err) => {
                            console.log('err');
                        }
                    );



            };






            /**
             * GET [v_id=1] 时间点列表
             * GET /api/tab_question/video/timepoints/search/v_id=1
             * */
            var promise = $http.get('http://127.0.0.1:3002/api/tab_question/video/timepoints/search/v_id=1', {params: {}}).then(
                (res) => {

                    console.log("GET [v_id=1] 时间点列表=>",res.data);

                    res.data.forEach( function(item){
                            //console.log("item=>",item.time);

                            /**
                             * GET [v_id=1] [time=5] 随机1个问题随机答案
                             * GET /api/tab_question/question/random/search/v_id=1&time=5
                             * */
                            var promise = $http.get('http://127.0.0.1:3002/api/tab_question/question/random/search/v_id=1&time=' + item.time , {
                                params: {
                                    // assistant1: "11",
                                    // coach_course_id: "233",
                                }
                            }).then(
                                (res) => {
                                    console.log("GET [v_id=1] [time=5] 随机1个问题随机答案=>",res.data);
                                    $scope.questions.push({
                                        id:res.data[0].q_id,
                                        panel: res.data[0].q_id,
                                        timeflag: res.data[0].time,
                                        question: res.data[0].title,
                                        questionImg: "",
                                        score: 4,
                                        answers: [
                                            {
                                                id:res.data[0].id,
                                                choice: res.data[0].context
                                            },
                                            {
                                                id:res.data[1].id,
                                                choice: res.data[1].context
                                            },
                                            {
                                                id:res.data[2].id,
                                                choice: res.data[2].context
                                            },
                                            {
                                                id:res.data[3].id,
                                                choice: res.data[3].context
                                            }

                                        ],
                                        getScore: 10,

                                        submitflag: false
                                    })
                                },
                                (err) => {
                                    console.log('err');
                                }
                            );

                        }
                    )

                },
                (err) => {
                    console.log('err');
                }
            );








            $scope.video = document.getElementById("video");

            $scope.video.oncanplay = function () {
                console.log("准备-----");
                console.log("视频长度", $scope.video.duration);
            };

            $scope.video.onpause = function () {
                console.log("暂停视频", $scope.video.currentTime);
            };

            $scope.video.requestFullscreen = function () {
                console.log("全屏");
            };




            function myplay() {
                console.log("点了播放", $scope.video.currentTime);
                var i = window.setInterval(function () {
                    if ($scope.video.ended) {
                        clearInterval(i);
                        $(".titlebox").show();
                        $(".gift-content").show();
                        // $(".vbox").hide();
                    }
                }, 20)
            }

            $scope.video.addEventListener('play', myplay, false);

            let pretime = 0;

            $scope.video.addEventListener("timeupdate", function () {
                timeDisplay = 0;

                console.log("==>", ($scope.video.currentTime - pretime));
                if (($scope.video.currentTime - pretime) > 10) {
                    console.log("向前");
                }
                if (($scope.video.currentTime - pretime) < -10) {
                    console.log("向后");
                }
                timeDisplay = $scope.video.currentTime;
                pretime = timeDisplay;
                console.log("当前进度", timeDisplay);
                // $("#setTime").val(parseInt(timeDisplay));
                $("#setTime").val(parseInt(timeDisplay));

                angular.forEach($scope.questions, function (value, key) {
                    if (timeDisplay > value.timeflag && !value.submitflag) {
                        $scope.video.pause();

                        if (checkFullScreen()){
                            exitFullscreen();
                        }

                        $("." + value.panel).show();
                    }
                });

                if ($scope.video.currentTime == $scope.video.duration){
                    RecordTime();
                }

            }, false);

            $scope.questions = [];
            $scope.record_answers = [];

            //退出全屏
            function exitFullscreen() {
                var de = document;
                if (de.exitFullscreen) {
                    de.exitFullscreen();
                    console.log("退出全屏")
                } else if (de.mozCancelFullScreen) {
                    de.mozCancelFullScreen();
                    console.log("退出全屏")
                } else if (de.webkitCancelFullScreen) {
                    de.webkitCancelFullScreen();
                    console.log("退出全屏")
                }
            }

            function checkFullScreen() {
                var isFull = document.webkitIsFullScreen || document.mozFullScreen ||
                    document.msFullscreenElement || document.fullscreenElement;
                if (isFull == null || isFull == undefined) {
                    isFull = false
                }
                return isFull
            }

        }

    ]);

