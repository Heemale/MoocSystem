
angular.module('ngBlockchain', [])
    .controller('zbycontroller', ['$scope', '$http', '$interval', '$filter', '$window',

        function ($scope, $http, $interval, $filter, $window) {
            console.log("ok");


            /**
             * GET [v_id=1] 的问题列表
             * GET /api/tab_question/question/counts/search/v_id=1
             * */
            var promise2 = $http.get('http://127.0.0.1:3002/api/tab_question/question/questions/search/v_id=1', {params: {}}).then(
                (res) => {

                    console.log("GET [v_id=1] 的问题列表=>",res.data);

                    res.data.forEach( function(item){
                            // console.log("item=>",item.id);
                            $("#test").append('<div id=main_'+ item.id +' style="width: 600px;height:400px;"><h3>' + item.id + '</h3></div>');

                            /**
                             * GET [q_id=1] 各个选项的人数
                             * GET /api/tab_record_answer/answer/counts/search/q_id=1
                             * */
                            var promise2 = $http.get('http://127.0.0.1:3002/api/tab_record_answer/answer/counts/search/q_id=' + item.id , {params: {}}).then(
                                (res) => {
                                    console.log("GET [q_id="+ item.id +"] 各个选项的人数=>",res.data);
                                    // console.log("dom=>",document.getElementById('main_' + item.id));

                                    var myChart = echarts.init(document.getElementById('main_' + item.id));

                                    var option = {
                                        title: {
                                            text: ''
                                        },
                                        tooltip: {},
                                        legend: {
                                            data: ['人数']
                                        },
                                        xAxis: {
                                            data: []
                                        },
                                        yAxis: {},
                                        series: [
                                            {
                                                name: '人数',
                                                type: 'bar',
                                                data: []
                                            }
                                        ]
                                    };

                                    option.title.text = "学生作答情况 问题编号[" + item.id + "]";

                                    res.data.forEach( function (item2) {
                                        option.xAxis.data.push(item2.a_id);
                                        option.series[0].data.push(item2.counts)
                                    });

                                    myChart.setOption(option);


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










        }

    ]);

