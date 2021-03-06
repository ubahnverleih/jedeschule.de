app.controller('schoolProfileController', function($scope, $window, $location, $timeout, schools, chartistUtilsService) {

    $scope.categoryRessources = {
        Umwelt: {
            color: '#57CF9A',
            image: '/assets/img/wg-icons/umwelt.png'
        },
        Sport: {
            color: '#D55879',
            image: '/assets/img/wg-icons/sport.png'
        },
        'Musik / Tanz': {
            color: '#EB8E24',
            image: '/assets/img/wg-icons/musik.png'
        },
        'Gesellschaft / Partizipation': {
            color: '#AD4561',
            image: '/assets/img/wg-icons/gesellschaft.png'
        },
        'Literatur / Medien': {
            color: '#FF9817',
            image: '/assets/img/wg-icons/literatur.png'
        },
        Handwerk: {
            color: '#199B5D',
            image: '/assets/img/wg-icons/handwerk.png'
        },
        'Kunst / Kultur': {
            color: '#FD7526',
            image: '/assets/img/wg-icons/kunst.png'
        },
        'Naturwissenschaft / Technik': {
            color: '#3dd7ff',
            image: '/assets/img/wg-icons/mint.png'
        },
        Berufsorientierung: {
            color: '#CC3D63',
            image: '/assets/img/wg-icons/berufsorientierung.png'
        },
        Sprachen: {
            color: '#30C5E2',
            image: '/assets/img/wg-icons/sprachen.png'
        }

    };

    $scope.partnerRessources = {
        'Gemeinnütziger Akteur': {
            color: '#57CF9A'
        },
        'Öffentliche Infrastruktur': {
            color: '#D55879'
        },
        'Wirtschaftsakteur': {
            color: '#EB8E24'
        },
        'Partnerschule': {
            color: '#AD4561'
        },
        'Modell/Förderprogramm/Projekt': {
            color: '#FF9817'
        },
        'kirchliche Einrichtung': {
            color: '#199B5D'
        },
        'Verband / Kammer / Innung / Gewerkschaft': {
            color: '#30C5E2'
        }
    };

    var chart_students = {
        data: {},
        options: {
            height: '300px',
            chartPadding: {
                top: 20,
                right: 0,
                bottom: 55,
                left: 40
            },
            axisY: {
                onlyInteger: true
            },
            low: 0,
            plugins: [
                Chartist.plugins.ctAxisTitle({
                    axisX: {
                        axisTitle: 'Schuljahr',
                        axisClass: 'ct-axis-title',
                        offset: {
                            x: 0,
                            y: 80
                        },
                        textAnchor: 'middle'
                    },
                    axisY: {
                        axisTitle: 'Anzahl Schüler',
                        axisClass: 'ct-axis-title',
                        offset: {
                            x: -50,
                            y: -5
                        },
                        flipTitle: false
                    }
                }),
                Chartist.plugins.tooltip(
                    {
                        appendToBody: true,
                        anchorToPoint: true,
                        transformTooltipTextFnc: function(value) {
                            return value + ' Schüler*innen';
                        }
                    })
            ]
        },
        events: {
            draw: chartistUtilsService.rotateOnMinDraw([31, 60])
        }
    };

    var chart_teacher = {
        data: {},
        options: {
            height: '300px',
            chartPadding: {
                top: 20,
                right: 0,
                bottom: 55,
                left: 40
            },
            axisY: {
                onlyInteger: true
            },
            axisX: {
                offset: 30
            },
            low: 0,
            plugins: [
                Chartist.plugins.ctAxisTitle({
                    axisX: {
                        axisTitle: 'Schuljahr',
                        axisClass: 'ct-axis-title',
                        offset: {x: 0, y: 80},
                        textAnchor: 'middle'
                    },
                    axisY: {
                        axisTitle: 'Anzahl Lehrer',
                        axisClass: 'ct-axis-title',
                        offset: {x: -50, y: -5},
                        flipTitle: false
                    }
                }),
                Chartist.plugins.tooltip(
                    {
                        appendToBody: true,
                        anchorToPoint: true,
                        transformTooltipTextFnc: function(value) {
                            return value + ' Lehrer*innen';
                        }
                    })
            ]
        },
        events: {
            draw: chartistUtilsService.rotateOnMinDraw([31, 60])
        }
    };

    $scope.chart_students = chart_students;
    $scope.chart_teacher = chart_teacher;

    var school_id = $location.absUrl().split('?')[1].split('=')[1];
    schools.getSchool(school_id, function(err, school) {
        $scope.school = school;
        $window.document.title = $scope.school.name + ' - Schulprofil - JedeSchule.de';
        var working_groups = _.groupBy(school.programs.working_groups, 'category');
        delete working_groups['no category'];
        $scope.working_groups = working_groups;

        var p = _.groupBy(school.partner, function(o) {
            return o.type.grob;
        });
        $scope.partnerships = p;

        var number_of_partners = school.partner.length;
        $scope.partner_stat = Object.keys(p).map(function(partner) {
            return {name: partner, value: p[partner].length * 100 / number_of_partners};
        });
        var d = Object.keys(school.students).map(function(o) {
            var current = school.students[o];
            return {
                amount: _.sumBy(current, function(n) {
                    return n.male + n.female
                }),
                year: o
            }
        });

        d = _.sortBy(d, ['name']);
        chart_students.data = {
            labels: _.map(d, 'year'),
            series: [_.map(d, 'amount')]
        };

        var t = _.map(school.teacher, function(o) {
            return {amount: o.female + o.male, year: o.year}
        });
        $scope.chart_teacher.data = {
            labels: _.map(t, 'year'),
            series: [_.map(t, 'amount')]
        };

        $scope.coordinates = [school.lat, school.lon];

        L.marker([school.lat, school.lon], {icon: mapIcon}).addTo($scope.map);
        $scope.map.setView([school.lat, school.lon], 15);
        $timeout(function() {
            checkConceptHeight();
        }, 0)
    });

    $scope.map = L.map('map-profile', {zoomControl: false}).setView([51.505, -0.09], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/okfde/ciwxo7szj00052pnx7xgwdl1d/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoib2tmZGUiLCJhIjoiY2lpOHhvMnNhMDAyNnZla280ZWhmMm96NyJ9.IvGz74dvvukg19B4Npsm1g', {
        attribution: '&copy; <a href="https://www.mapbox.com">Map Box</a> contributors'
    }).addTo($scope.map);
    var mapIcon = L.icon({
        iconUrl: '/assets/img/map_pin.png',
        iconAnchor: [20, 53],
        popupAnchor: [0, -55],
        iconSize: [40, 53] // size of the icon
    });

    $scope.map.dragging.disable();
    $scope.map.touchZoom.disable();
    $scope.map.doubleClickZoom.disable();
    $scope.map.scrollWheelZoom.disable();
    $scope.map.boxZoom.disable();
    $scope.map.keyboard.disable();
    if ($scope.map.tap) $scope.map.tap.disable();

    $scope.concecpt_needs_collapsing = false;
    $scope.concecpt_expanded = false;

    var conceptElement = null;

    function checkConceptHeight() {
        if (!conceptElement) return;
        var h = conceptElement[0].clientHeight;
        $scope.concecpt_needs_collapsing = (h > 290);
    }

    var ele = document.querySelector('#profile-concept');
    if (ele) {
        conceptElement = angular.element(ele);
        if (conceptElement[0]) {
            var w = angular.element($window);
            $scope.$watch(
                function() {
                    return $window.innerWidth;
                },
                function() {
                    checkConceptHeight();
                },
                true
            );
            w.bind('resize', function() {
                $scope.$apply();
            });
        }
    }

});

