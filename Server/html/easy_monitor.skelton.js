$(function () {
        $('#container').highcharts({
            chart: {
                type: 'line',
                zoomType: 'xy'
            },
            title: {
                text: '**title**'
            },
            subtitle: {
                text: '**subtitle**'
            },
            xAxis: {
                type: 'datetime',
                maxZoom: 1 , // one day only
                title: {
                    text: 'Day - Time'
                }
             },
            yAxis: {
                title: {
                    text: '***yaxis***'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valuePrefix: '',
                valueSuffix: '%'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0,
			itemStyle: {
			   fontSize: '16px'
			}
	        },
         	plotOptions: {
                line: {
                    lineWidth: 2,
                    marker: {
                        enabled: true
                    },
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return this.point.y.toFixed(2);
	                        }
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 4
                        }
                    },
                    threshold: null
                },
               column: {
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return this.point.y.toFixed(2);
	                        }
                    },
                    threshold: null
                },
               spline: {
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return this.point.y.toFixed(2);
	                        }
                    },
                    threshold: null
                },
               area: {
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return this.point.y.toFixed(2);
	                        }
                    },
                    threshold: null
                },
               scatter: {
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return this.point.y.toFixed(2);
	                        }
                    },
                    threshold: null
                },
               areaspline: {
                   dataLabels: {
                       enabled: true,
                       formatter: function () {
                           return this.point.y.toFixed(2);
                       }
                   },
                   threshold: null
               }},
            series: [
            	//**data**
            ]
        });

    var chart = $('#container').highcharts();

    // Toggle logarithmic gage
    var ytype = 1, ytypes = ['linear','logarithmic'];
    $('#toggle-type').click(function() {
        chart.yAxis[0].update({
            type: ytypes[ytype]
        });
        ytype++;
        if (ytype === ytypes.length) {
            ytype = 0;
        }
    });

    // Toggle data labels
    var enableDataLabels = false;
    $('#data-labels').click(function() {
	   	for (i=0; i<chart.series.length;++i){
        chart.series[i].update({
            dataLabels: {
                enabled: enableDataLabels
            }
        });
        }
        enableDataLabels = !enableDataLabels;
    });

    // Toggle point markers
    var enableMarkers = false;
    $('#markers').click(function() {
	   	for (i=0; i<chart.series.length;++i){
        chart.series[i].update({
	            marker: {
                enabled: enableMarkers
            }
        });
        }
        enableMarkers = !enableMarkers;
    });

    // Toggle point markers
    var color = false;
    $('#color').click(function() {
	   	for (i=0; i<chart.series.length;++i){
        chart.series[i].update({
            color: color ? null : Highcharts.getOptions().colors[1]
        });
       	}
        color = !color;
    });

    // Set type
    $.each(['line', 'column', 'spline', 'area', 'areaspline', 'scatter'], function (i, type) {
        $('#' + type).click(function () {
	   	for (i=0; i<chart.series.length;++i){
            chart.series[i].update({
                type: type
            });
        }
        });
    });

});
    

