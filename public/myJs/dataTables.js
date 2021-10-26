
angular.module('ngBlockchain', [])
    .controller('zbycontroller', ['$scope', '$http', '$interval', '$filter', '$window',

        function ($scope, $http, $interval, $filter, $window) {
            console.log("ok");



            /**
             * GET 统计答题正确率
             * GET /api/tab_record_answer/correct/rate/search
             * */
            var promise2 = $http.get('http://127.0.0.1:3002/api/tab_record_answer/correct/rate/search', {params: {}}).then(
                (res) => {
                    var dataSet = [];
                    console.log("GET 数据列表=>",res.data);

                    res.data.forEach( function(item){
                        console.log(item);
                        dataSet.push([
                            item.q_id,
                            item.rightCount,
                            item.totalCount,
                            toPercent(item.rightCount/item.totalCount)
                        ]);
                        });

                    $(document).ready(function() {
                        $('#example').DataTable( {
                            data: dataSet,
                            columns: [
                                { title: "问题编号" },
                                { title: "正确人数" },
                                { title: "总人数" },
                                { title: "正确率" }
                            ],
                            "language": {
                                "lengthMenu": "每页展示 _MENU_ 条数据",
                                "zeroRecords": "Nothing found - sorry",
                                "info": " 显示 _TOTAL_ 条记录中的 _START_ 到 _END_",
                                "infoFiltered": "(从 _MAX_ 条记录中过滤)",
                                "search":"搜索:",
                                "paginate": {
                                    "first":      "首页",
                                    "last":       "末页",
                                    "next":       "下一页",
                                    "previous":   "上一页"
                                },
                            }
                        } );
                    } );

                },
                (err) => {
                    console.log('err');
                }
            );


            /* 封装 */
            function toPercent(point){
                var str=Number(point*100).toFixed(1);
                str+="%";
                return str;
            }

            function toPoint(percent){
                var str=percent.replace("%","");
                str= str/100;
                return str;
            }

        }

    ]);

