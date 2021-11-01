
angular.module('ngBlockchain', [])
    .controller('zbycontroller', ['$scope', '$http', '$interval', '$filter', '$window',

        function ($scope, $http, $interval, $filter, $window) {
            console.log("ok");

            $(document).ready(function() {

                var table = $('#myTable').DataTable( {
                    ajax: 'http://127.0.0.1:3002/api/tab_question/question/bank/search',
                    // ajax: 'objects2.json',
                    columns: [
                        {
                            className:      'details-control',
                            orderable:      false,
                            data:           null,
                            defaultContent: ''
                        },
                        { data: "id" },
                        { data: "title" }
                    ],
                    order: [[1, 'asc']]
                } );

                $('#myTable tbody').on('click', 'td.details-control', function () {
                    var tr = $(this).closest('tr');
                    var row = table.row( tr );

                    if ( row.child.isShown() ) {
                        row.child.hide();
                        tr.removeClass('shown');
                    }
                    else {
                        row.child( format(row.data()) ).show();
                        tr.addClass('shown');
                    }
                } );

                function format ( rowData ) {
                    var div = $('<div/>')
                        .addClass( 'loading' );
                        // .text( 'Loading...' );
                    console.log("rowData=>",rowData);
                    console.log("rowData.name=>",rowData.id);

                    $.ajax( {
                        url: 'http://127.0.0.1:3002/api/tab_answer/question/bank/search/q_id=' + rowData.id,
                        dataType: 'json',
                        success: function ( json ) {
                            console.log("json=>",json);
                            json.forEach(function (item) {
                                console.log("item=>",item);
                                div
                                    .append(
                                        "<div>" +
                                        // "<span><img src='" + json.img + "' width='30%'></span>" +
                                        "<span>"+ "选项:" + item.context + "，正确性:" + item.correctness +"</span>" +
                                        "</div>"
                                    )
                                    .removeClass( 'loading' );
                            })
                        }
                    } );

                    return div;
                }

            } );

        }

    ]);

